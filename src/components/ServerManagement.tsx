import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Server, 
  ArrowLeft, 
  Terminal, 
  FileText, 
  Package, 
  Settings, 
  Database, 
  Activity,
  Play,
  Square,
  Users,
  Cpu,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { usePterodactylServer } from '../hooks/usePterodactylServer';
import { ConsoleTab } from './server-tabs/ConsoleTab';
import { FileManagerTab } from './server-tabs/FileManagerTab';
import { PluginManagerTab } from './server-tabs/PluginManagerTab';
import { ServerSettingsTab } from './server-tabs/ServerSettingsTab';
import { BackupSystemTab } from './server-tabs/BackupSystemTab';
import { ActivityMonitoringTab } from './server-tabs/ActivityMonitoringTab';

type TabType = 'console' | 'files' | 'plugins' | 'settings' | 'backups' | 'activity';

export const ServerManagement: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('console');
  
  const { 
    server, 
    stats, 
    loading, 
    error, 
    startServer, 
    stopServer, 
    restartServer 
  } = usePterodactylServer(serverId!);

  const tabs = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'files', label: 'File Manager', icon: FileText },
    { id: 'plugins', label: 'Plugins', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  const renderTabContent = () => {
    if (!server || !serverId) return null;

    const serverData = { ...server, stats };

    switch (activeTab) {
      case 'console':
        return <ConsoleTab serverData={serverData} serverId={serverId} />;
      case 'files':
        return <FileManagerTab serverData={serverData} serverId={serverId} />;
      case 'plugins':
        return <PluginManagerTab serverData={serverData} />;
      case 'settings':
        return <ServerSettingsTab serverData={serverData} />;
      case 'backups':
        return <BackupSystemTab serverData={serverData} serverId={serverId} />;
      case 'activity':
        return <ActivityMonitoringTab serverData={serverData} />;
      default:
        return <ConsoleTab serverData={serverData} serverId={serverId} />;
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
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading server...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load server data'}</p>
          <Link
            to="/dashboard"
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
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
              <Link 
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-green-700" />
                </div>
                <span className="font-semibold text-gray-900">{server.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(stats?.attributes.current_state)}`}></div>
                <span className="text-sm text-gray-600 capitalize">{getStatusText(stats?.attributes.current_state)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {!server.is_suspended && (
                  <>
                    {stats?.attributes.current_state === 'running' ? (
                      <>
                        <button
                          onClick={restartServer}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                        >
                          Restart
                        </button>
                        <button
                          onClick={stopServer}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center space-x-1"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startServer}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1"
                        disabled={stats?.attributes.current_state === 'starting'}
                      >
                        <Play className="w-4 h-4" />
                        <span>{stats?.attributes.current_state === 'starting' ? 'Starting...' : 'Start'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Server Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {getStatusText(stats?.attributes.current_state)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600">
                <Cpu className="w-4 h-4" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats ? `${(stats.attributes.resources.cpu_absolute || 0).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats ? formatBytes(stats.attributes.resources.memory_bytes || 0) : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">Node</span>
              <p className="text-lg font-bold text-gray-900">
                {server.node}
              </p>
            </div>
            
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">RAM Limit</span>
              <p className="text-lg font-bold text-gray-900">
                {server.limits.memory}MB
              </p>
            </div>
            
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">Uptime</span>
              <p className="text-lg font-bold text-gray-900">
                {stats?.attributes.resources.uptime ? formatUptime(stats.attributes.resources.uptime) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};