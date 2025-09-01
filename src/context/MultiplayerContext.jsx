import { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    // Generate random nickname if not set
    if (!nickname) {
      setNickname(`Guest-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [nickname]);

  useEffect(() => {
    // Initialize socket connection - use the current domain with port 3001
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    const serverUrl = `http://${hostname}:3001`;
    const newSocket = io(serverUrl);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to multiplayer server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
      console.log('Disconnected from multiplayer server');
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
        // Emit episode change to sync new user
        window.location.href = `/watch/${data.animeId}?ep=${data.currentEpisode}&room=${data.roomCode}`;
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
      const currentUrl = new URL(window.location);
      const newUrl = `/watch/${animeId}?ep=${episodeId}&room=${roomCode}`;
      
      if (currentUrl.pathname + currentUrl.search !== newUrl) {
        window.location.href = newUrl;
      }
    });

    // Chat events
    newSocket.on('chatMessage', (message) => {
      setChat(prev => [...prev, message]);
    });

    // Error handling
    newSocket.on('error', (error) => {
      setRoomError(error.message);
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

  const joinRoom = (code) => {
    if (socket && nickname && code) {
      socket.emit('joinRoom', { roomCode: code, nickname });
    }
  };

  const leaveRoom = () => {
    if (socket && roomCode) {
      socket.disconnect();
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
      
      // Remove room parameter from URL
      const url = new URL(window.location);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url);
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