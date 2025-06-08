import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'join' | 'leave' | 'chat' | 'command' | 'death' | 'achievement';
  player: string;
  message: string;
  timestamp: string;
}

interface PerformanceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  players: number;
  tps: number;
}

interface ActivityMonitoringTabProps {
  serverData: any;
}

export const ActivityMonitoringTab: React.FC<ActivityMonitoringTabProps> = ({ serverData }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('players');

  // Mock activity data
  const [recentActivity] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'join',
      player: 'Steve_Builder',
      message: 'joined the game',
      timestamp: '2024-01-15 14:30:25'
    },
    {
      id: '2',
      type: 'achievement',
      player: 'Alex_Miner',
      message: 'has made the advancement [Getting an Upgrade]',
      timestamp: '2024-01-15 14:28:15'
    },
    {
      id: '3',
      type: 'chat',
      player: 'Herobrine_Fan',
      message: 'Found a village!',
      timestamp: '2024-01-15 14:25:42'
    },
    {
      id: '4',
      type: 'death',
      player: 'Enderman_Slayer',
      message: 'was slain by Enderman',
      timestamp: '2024-01-15 14:22:18'
    },
    {
      id: '5',
      type: 'command',
      player: 'Steve_Builder',
      message: 'executed /tp @p spawn',
      timestamp: '2024-01-15 14:20:05'
    },
    {
      id: '6',
      type: 'leave',
      player: 'Creeper_Destroyer',
      message: 'left the game',
      timestamp: '2024-01-15 14:18:33'
    }
  ]);

  // Mock performance data
  const [performanceData] = useState<PerformanceMetric[]>([
    { timestamp: '14:00', cpu: 45, memory: 65, players: 8, tps: 19.8 },
    { timestamp: '14:15', cpu: 52, memory: 68, players: 12, tps: 19.5 },
    { timestamp: '14:30', cpu: 48, memory: 70, players: 15, tps: 19.7 },
    { timestamp: '14:45', cpu: 55, memory: 72, players: 18, tps: 19.3 },
    { timestamp: '15:00', cpu: 42, memory: 69, players: 12, tps: 19.9 }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join':
        return <LogIn className="w-4 h-4 text-green-500" />;
      case 'leave':
        return <LogOut className="w-4 h-4 text-red-500" />;
      case 'chat':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'command':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'death':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'achievement':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'join':
        return 'bg-green-50 border-green-200';
      case 'leave':
        return 'bg-red-50 border-red-200';
      case 'chat':
        return 'bg-blue-50 border-blue-200';
      case 'command':
        return 'bg-purple-50 border-purple-200';
      case 'death':
        return 'bg-red-50 border-red-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const currentStats = {
    cpu: 48,
    memory: 70,
    players: 12,
    tps: 19.7,
    uptime: '2d 5h 23m',
    totalPlayers: 156
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Monitoring</h2>
          <p className="text-gray-600">Real-time server performance and player activity</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.cpu}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentStats.cpu}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.memory}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentStats.memory}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Players</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.players}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Peak: 18 players</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Server TPS</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.tps}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Excellent performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <div className="flex space-x-2">
              {['players', 'cpu', 'memory', 'tps'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {metric.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Simple chart representation */}
          <div className="h-64 flex items-end space-x-2">
            {performanceData.map((data, index) => {
              const value = data[selectedMetric as keyof PerformanceMetric] as number;
              const maxValue = selectedMetric === 'tps' ? 20 : 100;
              const height = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-300"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentActivity.map((event) => (
              <div key={event.id} className={`p-4 border-l-4 ${getActivityColor(event.type)}`}>
                <div className="flex items-start space-x-3">
                  {getActivityIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{event.player}</span>
                      <span className="text-sm text-gray-600">{event.message}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentStats.uptime}</p>
          <p className="text-sm text-gray-600 mt-1">99.9% uptime this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Total Players</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentStats.totalPlayers}</p>
          <p className="text-sm text-gray-600 mt-1">Unique players this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wifi className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Network</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">45ms</p>
          <p className="text-sm text-gray-600 mt-1">Average latency</p>
        </div>
      </div>
    </div>
  );
};