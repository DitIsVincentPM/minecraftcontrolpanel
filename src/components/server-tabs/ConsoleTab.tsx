import React, { useState } from 'react';
import { Send, Users, User, Shield, Ban, Crown, Terminal, AlertCircle } from 'lucide-react';
import { usePterodactylConsole } from '../../hooks/usePterodactylConsole';

interface ConsoleTabProps {
  serverData: any;
  serverId: string;
}

interface Player {
  id: string;
  name: string;
  status: 'online' | 'away';
  role: 'player' | 'moderator' | 'admin';
  playtime: string;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({ serverData, serverId }) => {
  const [command, setCommand] = useState('');
  const { logs, connected, error, sendCommand } = usePterodactylConsole(serverId);
  
  // Mock players for now - in a real implementation, this would come from server data
  const [players] = useState<Player[]>([
    { id: '1', name: 'Steve_Builder', status: 'online', role: 'admin', playtime: '3h 45m' },
    { id: '2', name: 'Alex_Miner', status: 'online', role: 'moderator', playtime: '2h 12m' },
    { id: '3', name: 'Herobrine_Fan', status: 'online', role: 'player', playtime: '1h 35m' },
    { id: '4', name: 'Enderman_Slayer', status: 'away', role: 'player', playtime: '45m' },
    { id: '5', name: 'Creeper_Destroyer', status: 'online', role: 'player', playtime: '2h 8m' }
  ]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    try {
      await sendCommand(command);
      setCommand('');
    } catch (err) {
      console.error('Failed to send command:', err);
    }
  };

  const quickCommands = [
    { label: 'Save World', command: 'save-all' },
    { label: 'List Players', command: 'list' },
    { label: 'Weather Clear', command: 'weather clear' },
    { label: 'Time Day', command: 'time set day' },
    { label: 'Memory Usage', command: 'memory' },
    { label: 'TPS Check', command: 'tps' }
  ];

  const getLogColor = (content: string) => {
    if (content.includes('[ERROR]') || content.includes('ERROR')) return 'text-red-400';
    if (content.includes('[WARN]') || content.includes('WARN')) return 'text-yellow-400';
    if (content.includes('joined the game') || content.includes('left the game')) return 'text-green-400';
    if (content.includes('<') && content.includes('>')) return 'text-blue-400';
    return 'text-gray-300';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlayerStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-yellow-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Console */}
      <div className="lg:col-span-3 space-y-6">
        {/* Connection Status */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Console Output */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Server Console</h3>
              <div className="ml-auto flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          
          <div className="h-96 p-4 overflow-y-auto bg-gray-900 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {connected ? 'Waiting for console output...' : 'Console not connected'}
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`ml-2 ${getLogColor(log.content)}`}>
                    {log.content}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleCommand} className="border-t border-gray-700 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter server command..."
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-green-500"
                disabled={!connected}
              />
              <button
                type="submit"
                disabled={!connected || !command.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Commands</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => setCommand(cmd.command)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-left"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Players Sidebar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Online Players ({players.filter(p => p.status === 'online').length})
          </h3>
        </div>
        
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-800">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getPlayerStatusColor(player.status)}`}></div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">{player.name}</span>
                    {getRoleIcon(player.role)}
                  </div>
                  <span className="text-xs text-gray-600">{player.playtime}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Online:</span>
              <span className="font-medium">{players.filter(p => p.status === 'online').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Away:</span>
              <span className="font-medium">{players.filter(p => p.status === 'away').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Players:</span>
              <span className="font-medium">{serverData.limits?.memory ? Math.floor(serverData.limits.memory / 100) : 20}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};