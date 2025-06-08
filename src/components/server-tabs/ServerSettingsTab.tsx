import React, { useState } from 'react';
import { Save, RefreshCw, AlertTriangle, Info } from 'lucide-react';

interface ServerSettingsTabProps {
  serverData: any;
}

export const ServerSettingsTab: React.FC<ServerSettingsTabProps> = ({ serverData }) => {
  const [settings, setSettings] = useState({
    // Basic Settings
    serverName: 'Survival World',
    motd: 'Welcome to our Minecraft server!',
    maxPlayers: 20,
    gamemode: 'survival',
    difficulty: 'normal',
    
    // World Settings
    levelName: 'world',
    generateStructures: true,
    allowNether: true,
    allowEnd: true,
    spawnProtection: 16,
    
    // Player Settings
    pvp: true,
    allowFlight: false,
    forceGamemode: false,
    hardcore: false,
    whiteList: false,
    
    // Server Settings
    onlineMode: true,
    enableCommandBlock: true,
    enableQuery: false,
    enableRcon: false,
    rconPassword: '',
    rconPort: 25575,
    
    // Performance Settings
    viewDistance: 10,
    networkCompressionThreshold: 256,
    maxWorldSize: 29999984,
    entityBroadcastRangePercentage: 100,
    
    // Resource Pack
    resourcePack: '',
    resourcePackSha1: '',
    requireResourcePack: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    setHasChanges(false);
  };

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart the server? All players will be disconnected.')) {
      console.log('Restarting server...');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Server Settings</h2>
          <p className="text-gray-600">Configure your server properties and behavior</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          
          <button
            onClick={handleRestart}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart Server</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Name
              </label>
              <input
                type="text"
                value={settings.serverName}
                onChange={(e) => handleInputChange('serverName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message of the Day (MOTD)
              </label>
              <textarea
                value={settings.motd}
                onChange={(e) => handleInputChange('motd', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxPlayers}
                  onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gamemode
                </label>
                <select
                  value={settings.gamemode}
                  onChange={(e) => handleInputChange('gamemode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="survival">Survival</option>
                  <option value="creative">Creative</option>
                  <option value="adventure">Adventure</option>
                  <option value="spectator">Spectator</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="peaceful">Peaceful</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* World Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">World Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level Name
              </label>
              <input
                type="text"
                value={settings.levelName}
                onChange={(e) => handleInputChange('levelName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spawn Protection Radius
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.spawnProtection}
                onChange={(e) => handleInputChange('spawnProtection', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.generateStructures}
                  onChange={(e) => handleInputChange('generateStructures', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Generate Structures</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowNether}
                  onChange={(e) => handleInputChange('allowNether', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Nether</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowEnd}
                  onChange={(e) => handleInputChange('allowEnd', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow End</span>
              </label>
            </div>
          </div>
        </div>

        {/* Player Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.pvp}
                onChange={(e) => handleInputChange('pvp', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable PvP</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowFlight}
                onChange={(e) => handleInputChange('allowFlight', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Allow Flight</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.forceGamemode}
                onChange={(e) => handleInputChange('forceGamemode', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Force Gamemode</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.hardcore}
                onChange={(e) => handleInputChange('hardcore', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hardcore Mode</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.whiteList}
                onChange={(e) => handleInputChange('whiteList', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Whitelist</span>
            </label>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Distance
              </label>
              <input
                type="number"
                min="3"
                max="32"
                value={settings.viewDistance}
                onChange={(e) => handleInputChange('viewDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Higher values increase server load</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network Compression Threshold
              </label>
              <input
                type="number"
                min="0"
                max="512"
                value={settings.networkCompressionThreshold}
                onChange={(e) => handleInputChange('networkCompressionThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Broadcast Range Percentage
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.entityBroadcastRangePercentage}
                onChange={(e) => handleInputChange('entityBroadcastRangePercentage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Important Notes</h4>
            <p className="text-sm text-blue-700 mt-1">
              Some settings require a server restart to take effect. Changes to world settings may not apply to already generated chunks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};