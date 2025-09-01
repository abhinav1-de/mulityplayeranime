import { useState, useEffect } from 'react';
import { useMultiplayer } from '@/src/context/MultiplayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faComments, 
  faCrown, 
  faPaperPlane, 
  faSignOutAlt,
  faUserPlus,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

export default function MultiplayerPanel() {
  const {
    isConnected,
    roomCode,
    isHost,
    isInRoom,
    members,
    chat,
    nickname,
    setNickname,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    roomError
  } = useMultiplayer();

  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [joinCode, setJoinCode] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [nicknameInput, setNicknameInput] = useState(nickname);

  useEffect(() => {
    setNicknameInput(nickname);
  }, [nickname]);

  const handleCreateRoom = () => {
    if (nicknameInput.trim()) {
      setNickname(nicknameInput.trim());
      createRoom();
    }
  };

  const handleJoinRoom = () => {
    if (nicknameInput.trim() && joinCode.trim()) {
      setNickname(nicknameInput.trim());
      joinRoom(joinCode.trim());
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage);
      setChatMessage('');
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
        Connecting to multiplayer...
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
          isInRoom ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        data-testid="button-multiplayer-toggle"
      >
        <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
        {isInRoom && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {members.length}
          </span>
        )}
      </button>

      {/* Multiplayer Panel */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 w-80 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50">
          {!isInRoom ? (
            // Room Creation/Join Interface
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Watch Together</h3>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Your Nickname</label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your nickname"
                  data-testid="input-nickname"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={!nicknameInput.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
                  data-testid="button-create-room"
                >
                  Create Room
                </button>

                <div className="text-center text-gray-400 text-sm">or</div>

                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none mb-2"
                    placeholder="Enter room code"
                    data-testid="input-room-code"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!nicknameInput.trim() || !joinCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
                    data-testid="button-join-room"
                  >
                    Join Room
                  </button>
                </div>
              </div>

              {roomError && (
                <div className="mt-3 text-red-400 text-sm" data-testid="text-room-error">
                  {roomError}
                </div>
              )}
            </div>
          ) : (
            // Room Interface
            <div className="flex flex-col h-96">
              {/* Room Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Room {roomCode}</h3>
                    <p className="text-gray-400 text-sm">
                      {isHost ? 'You are the host' : 'Watching together'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyRoomCode}
                      className="text-gray-400 hover:text-white"
                      title="Copy room code"
                      data-testid="button-copy-room-code"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={leaveRoom}
                      className="text-red-400 hover:text-red-300"
                      title="Leave room"
                      data-testid="button-leave-room"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'members' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="tab-members"
                >
                  <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2" />
                  Members ({members.length})
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'chat' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="tab-chat"
                >
                  <FontAwesomeIcon icon={faComments} className="w-4 h-4 mr-2" />
                  Chat
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'members' ? (
                  <div className="p-4 space-y-2 overflow-y-auto h-full">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded"
                        data-testid={`member-${index}`}
                      >
                        <span className="text-white">{member.nickname}</span>
                        {member.isHost && (
                          <FontAwesomeIcon 
                            icon={faCrown} 
                            className="w-4 h-4 text-yellow-400" 
                            title="Host"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-2">
                      {chat.map((msg) => (
                        <div
                          key={msg.id}
                          className={`text-sm ${
                            msg.isSystem 
                              ? 'text-gray-400 italic text-center' 
                              : 'text-white'
                          }`}
                          data-testid={`chat-message-${msg.id}`}
                        >
                          {!msg.isSystem && (
                            <span className={`font-medium ${msg.isHost ? 'text-yellow-400' : 'text-blue-400'}`}>
                              {msg.nickname}: 
                            </span>
                          )}
                          <span className="ml-1">{msg.message}</span>
                        </div>
                      ))}
                      {chat.length === 0 && (
                        <div className="text-center text-gray-400 text-sm">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="Type a message..."
                          data-testid="input-chat-message"
                        />
                        <button
                          type="submit"
                          disabled={!chatMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded transition-colors"
                          data-testid="button-send-message"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}