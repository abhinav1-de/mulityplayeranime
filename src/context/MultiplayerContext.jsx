import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const MultiplayerContext = createContext();

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [members, setMembers] = useState([]);
  const [chat, setChat] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [nickname, setNickname] = useState('');
  
  // Video sync states
  const [roomVideoState, setRoomVideoState] = useState(null);
  const [shouldSyncVideo, setShouldSyncVideo] = useState(false);
  
  // Refs to prevent duplicate syncing
  const playerRef = useRef(null);
  const isUpdatingFromSync = useRef(false);
  
  // Refs for navigation to avoid useEffect dependency issues
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  
  // Update refs when values change
  useEffect(() => {
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [navigate, location]);

  useEffect(() => {
    // Generate random nickname if not set
    if (!nickname) {
      setNickname(`Guest-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [nickname]);

  useEffect(() => {
    // Initialize socket connection to multiplayer server
    const serverUrl = import.meta.env.VITE_MULTIPLAYER_SERVER_URL || 'https://server-bkur.onrender.com';
    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to multiplayer server');
      
      // If we were in a room before disconnect, try to maintain connection
      const currentRoomCode = roomCode;
      if (currentRoomCode && !isInRoom) {
        console.log('Attempting to rejoin room after reconnect:', currentRoomCode);
        // Don't auto-rejoin to avoid conflicts, just log for debugging
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from multiplayer server. Reason:', reason);
      setIsConnected(false);
      
      // Don't immediately clear room state on disconnect
      // Let reconnection handle it
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Only clear state if server deliberately disconnected or client disconnected
        setIsInRoom(false);
        setRoomCode(null);
        setIsHost(false);
        setMembers([]);
        setChat([]);
      }
    });

    // Handle successful reconnection
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Successfully reconnected to multiplayer server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    // Handle reconnection attempts
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect... Attempt:', attemptNumber);
    });

    // Handle reconnection errors
    newSocket.on('reconnect_error', (error) => {
      console.log('Reconnection failed:', error);
    });

    // Room events
    newSocket.on('roomCreated', (data) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setMembers(data.members);
      setIsInRoom(true);
      setRoomError(null);
    });

    newSocket.on('roomJoined', (data) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setMembers(data.members);
      setChat(data.chat || []);
      setIsInRoom(true);
      setRoomError(null);
      
      // If there's a current episode, sync to it
      if (data.currentEpisode && data.animeId) {
        // Use React Router navigation instead of hard reload
        const newUrl = `/watch/${data.animeId}?ep=${data.currentEpisode}&room=${data.roomCode}`;
        const currentLocation = locationRef.current;
        if (currentLocation.pathname + currentLocation.search !== newUrl) {
          navigateRef.current(newUrl);
        }
      }
    });

    newSocket.on('userJoined', (data) => {
      setMembers(data.members);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.nickname} joined the room`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    newSocket.on('userLeft', (data) => {
      setMembers(data.members);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.nickname} left the room`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    newSocket.on('newHost', (data) => {
      setMembers(data.members);
      setIsHost(newSocket.id === data.newHostId);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.newHostNickname} is now the host`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    // Video sync events
    newSocket.on('videoAction', (action) => {
      if (!isUpdatingFromSync.current) {
        setRoomVideoState(action);
        setShouldSyncVideo(true);
      }
    });

    // Episode change events
    newSocket.on('changeEpisode', (data) => {
      const { episodeId, animeId } = data;
      const newUrl = `/watch/${animeId}?ep=${episodeId}&room=${roomCode}`;
      const currentLocation = locationRef.current;
      
      if (currentLocation.pathname + currentLocation.search !== newUrl) {
        navigateRef.current(newUrl);
      }
    });

    // Chat events
    newSocket.on('chatMessage', (message) => {
      setChat(prev => [...prev, message]);
    });

    // Room left event (when user successfully leaves)
    newSocket.on('roomLeft', () => {
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
    });

    // Error handling
    newSocket.on('error', (error) => {
      setRoomError(error.message);
      console.error('Multiplayer error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Functions to interact with multiplayer
  const createRoom = () => {
    if (socket && nickname) {
      socket.emit('createRoom', { nickname });
    }
  };

  const joinRoom = (code, customNickname = null) => {
    const nameToUse = customNickname || nickname;
    if (socket && nameToUse && code) {
      if (customNickname) {
        setNickname(customNickname);
      }
      socket.emit('joinRoom', { roomCode: code, nickname: nameToUse });
    }
  };

  const leaveRoom = () => {
    if (socket && roomCode) {
      // Emit leave room event instead of disconnecting socket
      socket.emit('leaveRoom', { roomCode });
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
      
      // Remove room parameter from URL using React Router
      const currentLocation = locationRef.current;
      const searchParams = new URLSearchParams(currentLocation.search);
      searchParams.delete('room');
      const newSearch = searchParams.toString();
      const newUrl = currentLocation.pathname + (newSearch ? `?${newSearch}` : '');
      navigateRef.current(newUrl, { replace: true });
    }
  };

  const sendChatMessage = (message) => {
    if (socket && roomCode && message.trim()) {
      socket.emit('chatMessage', { message: message.trim() });
    }
  };

  const syncVideoAction = (action) => {
    if (socket && roomCode && isHost) {
      isUpdatingFromSync.current = true;
      socket.emit('videoAction', { action });
      setTimeout(() => {
        isUpdatingFromSync.current = false;
      }, 100);
    }
  };

  const syncEpisodeChange = (episodeId, animeId) => {
    if (socket && roomCode && isHost) {
      socket.emit('changeEpisode', { episodeId, animeId });
    }
  };

  const setPlayerReference = (player) => {
    playerRef.current = player;
  };

  const value = {
    socket,
    isConnected,
    roomCode,
    isHost,
    isInRoom,
    members,
    chat,
    roomError,
    nickname,
    setNickname,
    roomVideoState,
    shouldSyncVideo,
    setShouldSyncVideo,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    syncVideoAction,
    syncEpisodeChange,
    setPlayerReference,
    playerRef
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
