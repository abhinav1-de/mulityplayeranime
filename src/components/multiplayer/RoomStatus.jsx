import { useMultiplayer } from '@/src/context/MultiplayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function RoomStatus() {
  const { isInRoom, roomCode, isHost, members, isConnected } = useMultiplayer();

  if (!isInRoom) return null;

  return (
    <div className={`${isConnected ? 'bg-green-600/20 border-green-600' : 'bg-yellow-600/20 border-yellow-600'} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faUsers} className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`} />
          <div>
            <p className="text-white text-sm font-medium">
              Watching together in room {roomCode}
              {!isConnected && <span className="text-yellow-400 ml-2">(Reconnecting...)</span>}
            </p>
            <p className="text-gray-300 text-xs">
              {members.length} {members.length === 1 ? 'person' : 'people'} watching
            </p>
          </div>
        </div>
        {isHost && (
          <div className="flex items-center gap-1 text-yellow-400">
            <FontAwesomeIcon icon={faCrown} className="w-3 h-3" />
            <span className="text-xs font-medium">Host</span>
          </div>
        )}
      </div>
    </div>
  );
}
