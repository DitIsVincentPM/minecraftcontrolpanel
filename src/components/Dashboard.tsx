import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Server, 
  Plus, 
  Settings, 
  LogOut, 
  Play, 
  Square, 
  Users, 
  Activity,
  HardDrive,
  Cpu,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CreateServerModal } from './CreateServerModal';
import { pterodactylApi, PterodactylServer, ServerStats } from '../services/pterodactylApi';

interface ServerWithStats extends PterodactylServer {
  stats?: ServerStats;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [servers, setServers] = useState<ServerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'mock'>('disconnected');

  const fetchServers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test connection first
      const isConnected = await pterodactylApi.healthCheck();
      setConnectionStatus(isConnected ? 'connected' : 'mock');
      
      const serverList = await pterodactylApi.getServers();
      
      // Fetch stats for each server
      const serversWithStats = await Promise.all(
        serverList.map(async (server) => {
          try {
            const stats = await pterodactylApi.getServerStats(server.attributes.identifier);
            return { ...server, stats };
          } catch (err) {
            console.error(`Failed to fetch stats for server ${server.attributes.identifier}:`, err);
            return server;
          }
        })
      );
      
      setServers(serversWithStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch servers';
      setError(errorMessage);
      setConnectionStatus('mock');
      console.error('Failed to fetch servers:', err);
      
      // If it's a CORS error, show helpful message
      if (errorMessage.includes('CORS') || errorMessage.includes('405')) {
        setError('CORS configuration issue detected. Using mock data for development. Please configure CORS on your Pterodactyl Panel for production use.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    
    // Refresh servers every 30 seconds
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleServerAction = async (identifier: string, action: 'start' | 'stop' | 'restart') => {
    try {
      switch (action) {
        case 'start':
          await pterodactylApi.startServer(identifier);
          break;
        case 'stop':
          await pterodactylApi.stopServer(identifier);
          break;
        case 'restart':
          await pterodactylApi.restartServer(identifier);
          break;
      }
      
      // Refresh server data after action
      setTimeout(fetchServers, 2000);
    } catch (err) {
      console.error(`Failed to ${action} server:`, err);
    }
  };

  const getStatusColor = (state?: string) => {
    switch (state) {
      case 'running': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500';
      case 'stopping': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (state?: string) => {
    switch (state) {
      case 'running': return 'Online';
      case 'starting': return 'Starting';
      case 'stopping': return 'Stopping';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && servers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Connecting to Pterodactyl Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">MinecraftCP</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : connectionStatus === 'mock' ? (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Mock Data</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchServers}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Servers</h1>
              <p className="mt-1 text-gray-600">Manage and monitor your Minecraft servers</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Server</span>
            </button>
          </div>
        </div>

        {/* Error/Warning Messages */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Connection Issue</h4>
                <p className="text-yellow-700 text-sm mt-1">{error}</p>
                {connectionStatus === 'mock' && (
                  <div className="mt-2 text-sm text-yellow-700">
                    <p><strong>For development:</strong> The app is using mock data. This is normal during development.</p>
                    <p><strong>For production:</strong> Please configure CORS on your Pterodactyl Panel.</p>
                  </div>
                )}
                <button
                  onClick={fetchServers}
                  className="mt-2 text-yellow-600 hover:text-yellow-800 underline text-sm"
                >
                  Try connecting again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="w-6 h-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Servers</p>
                <p className="text-2xl font-bold text-gray-900">{servers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running Servers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {servers.filter(s => s.stats?.attributes.current_state === 'running').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Memory</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(servers.reduce((acc, s) => acc + (s.attributes.limits.memory * 1024 * 1024), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-orange-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(servers.reduce((acc, s) => acc + (s.attributes.limits.disk * 1024 * 1024), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Server List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Server List</h2>
          </div>
          
          {servers.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
              <p className="text-gray-600 mb-4">
                {connectionStatus === 'mock' 
                  ? 'Using mock data - configure CORS to see real servers' 
                  : 'Get started by creating your first server'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Your First Server
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {servers.map((server) => (
                <div key={server.attributes.uuid} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Server className="w-6 h-6 text-green-700" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{server.attributes.name}</h3>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(server.stats?.attributes.current_state)}`}></div>
                            <span className="text-sm text-gray-600">{getStatusText(server.stats?.attributes.current_state)}</span>
                          </div>
                          {server.attributes.is_suspended && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Suspended
                            </span>
                          )}
                          {connectionStatus === 'mock' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Mock Data
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-6 text-sm text-gray-500">
                          <span>{server.attributes.node}</span>
                          <span className="flex items-center space-x-1">
                            <Cpu className="w-4 h-4" />
                            <span>{server.attributes.limits.memory}MB RAM</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <HardDrive className="w-4 h-4" />
                            <span>{server.attributes.limits.disk}MB Storage</span>
                          </span>
                          {server.stats?.attributes.resources.uptime && (
                            <span>Uptime: {formatUptime(server.stats.attributes.resources.uptime)}</span>
                          )}
                        </div>
                        
                        {server.stats && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>CPU: {(server.stats.attributes.resources.cpu_absolute || 0).toFixed(1)}%</span>
                            <span>
                              Memory: {formatBytes(server.stats.attributes.resources.memory_bytes || 0)} / {formatBytes(server.stats.attributes.resources.memory_limit_bytes || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {!server.attributes.is_suspended && (
                        <>
                          {server.stats?.attributes.current_state === 'running' ? (
                            <>
                              <button 
                                onClick={() => handleServerAction(server.attributes.identifier, 'restart')}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Restart"
                              >
                                <RefreshCw className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleServerAction(server.attributes.identifier, 'stop')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Stop"
                              >
                                <Square className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleServerAction(server.attributes.identifier, 'start')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Start"
                              disabled={server.stats?.attributes.current_state === 'starting'}
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                      
                      <Link
                        to={`/server/${server.attributes.identifier}`}
                        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage</span>
                      </Link>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Server Modal */}
      {showCreateModal && (
        <CreateServerModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};