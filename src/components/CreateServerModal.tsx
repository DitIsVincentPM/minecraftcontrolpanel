import React, { useState } from 'react';
import { X, Server, Cpu, HardDrive, Gamepad2 } from 'lucide-react';

interface CreateServerModalProps {
  onClose: () => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    ram: '2',
    storage: '10',
    version: '1.20.4',
    type: 'paper',
    port: '25565',
    maxPlayers: '20'
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate server creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    onClose();
  };

  const ramOptions = [
    { value: '1', label: '1GB RAM', price: '$5/month' },
    { value: '2', label: '2GB RAM', price: '$8/month' },
    { value: '4', label: '4GB RAM', price: '$15/month' },
    { value: '8', label: '8GB RAM', price: '$25/month' },
    { value: '16', label: '16GB RAM', price: '$45/month' }
  ];

  const serverTypes = [
    { value: 'vanilla', label: 'Vanilla', desc: 'Pure Minecraft experience' },
    { value: 'paper', label: 'Paper', desc: 'Optimized with plugin support' },
    { value: 'spigot', label: 'Spigot', desc: 'Popular plugin platform' },
    { value: 'forge', label: 'Forge', desc: 'Mod support' },
    { value: 'fabric', label: 'Fabric', desc: 'Lightweight mod support' }
  ];

  const versions = ['1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.19.4', '1.19.3', '1.18.2'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Server</h2>
              <p className="text-sm text-gray-600">Set up your Minecraft server in minutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Server Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Server Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="My Awesome Server"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minecraft Version
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                >
                  {versions.map(version => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Server Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Server Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serverTypes.map((type) => (
                <label key={type.value} className="relative">
                  <input
                    type="radio"
                    name="serverType"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Gamepad2 className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.desc}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Server Resources</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Cpu className="w-4 h-4 inline mr-1" />
                RAM Allocation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ramOptions.map((option) => (
                  <label key={option.value} className="relative">
                    <input
                      type="radio"
                      name="ram"
                      value={option.value}
                      checked={formData.ram === option.value}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      formData.ram === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-green-600">{option.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <HardDrive className="w-4 h-4 inline mr-1" />
                Storage Space (GB)
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                className="w-full"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>5GB</span>
                <span className="font-medium">{formData.storage}GB Selected</span>
                <span>100GB</span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Port
              </label>
              <input
                type="number"
                min="1024"
                max="65535"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              />
              <p className="text-sm text-gray-600 mt-1">Default: 25565</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Configuration Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {formData.name || 'Unnamed Server'}</p>
              <p><strong>Type:</strong> {serverTypes.find(t => t.value === formData.type)?.label}</p>
              <p><strong>Version:</strong> {formData.version}</p>
              <p><strong>Resources:</strong> {formData.ram}GB RAM, {formData.storage}GB Storage</p>
              <p><strong>Players:</strong> Up to {formData.maxPlayers} players</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Server...' : 'Create Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};