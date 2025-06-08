import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Settings, 
  Package, 
  Star, 
  Users, 
  ExternalLink,
  Shield,
  Zap,
  Globe,
  CheckCircle
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: string;
  rating: number;
  category: string;
  installed: boolean;
  enabled?: boolean;
  compatible: boolean;
}

interface PluginManagerTabProps {
  serverData: any;
}

export const PluginManagerTab: React.FC<PluginManagerTabProps> = ({ serverData }) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [installedPlugins] = useState<Plugin[]>([
    {
      id: '1',
      name: 'WorldGuard',
      description: 'Comprehensive world protection plugin',
      version: '7.0.8',
      author: 'sk89q',
      downloads: '10M+',
      rating: 4.8,
      category: 'protection',
      installed: true,
      enabled: true,
      compatible: true
    },
    {
      id: '2',
      name: 'Essentials',
      description: 'Essential commands and features for servers',
      version: '2.19.7',
      author: 'EssentialsX Team',
      downloads: '8M+',
      rating: 4.7,
      category: 'utility',
      installed: true,
      enabled: true,
      compatible: true
    },
    {
      id: '3',
      name: 'LuckPerms',
      description: 'Advanced permissions management system',
      version: '5.4.102',
      author: 'Luck',
      downloads: '5M+',
      rating: 4.9,
      category: 'administration',
      installed: true,
      enabled: false,
      compatible: true
    }
  ]);

  const [marketplacePlugins] = useState<Plugin[]>([
    {
      id: '4',
      name: 'CoreProtect',
      description: 'Block logging and rollback plugin for grief protection',
      version: '21.3',
      author: 'Intelli',
      downloads: '3M+',
      rating: 4.8,
      category: 'protection',
      installed: false,
      compatible: true
    },
    {
      id: '5',
      name: 'Vault',
      description: 'Economy API and permissions abstraction layer',
      version: '1.7.3',
      author: 'MilkBowl',
      downloads: '12M+',
      rating: 4.6,
      category: 'economy',
      installed: false,
      compatible: true
    },
    {
      id: '6',
      name: 'PlaceholderAPI',
      description: 'Universal placeholder system for plugins',
      version: '2.11.3',
      author: 'HelpChat',
      downloads: '4M+',
      rating: 4.7,
      category: 'utility',
      installed: false,
      compatible: true
    },
    {
      id: '7',
      name: 'McMMO',
      description: 'RPG skills and abilities system',
      version: '2.1.220',
      author: 'nossr50',
      downloads: '6M+',
      rating: 4.5,
      category: 'gameplay',
      installed: false,
      compatible: false
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'protection', label: 'Protection' },
    { value: 'utility', label: 'Utilities' },
    { value: 'administration', label: 'Administration' },
    { value: 'economy', label: 'Economy' },
    { value: 'gameplay', label: 'Gameplay' },
    { value: 'chat', label: 'Chat' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'protection': return <Shield className="w-4 h-4" />;
      case 'utility': return <Zap className="w-4 h-4" />;
      case 'administration': return <Settings className="w-4 h-4" />;
      case 'economy': return <Globe className="w-4 h-4" />;
      case 'gameplay': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredPlugins = (plugins: Plugin[]) => {
    return plugins.filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const handleInstall = (plugin: Plugin) => {
    console.log('Installing plugin:', plugin.name);
    // Here you would handle plugin installation
  };

  const handleUninstall = (plugin: Plugin) => {
    console.log('Uninstalling plugin:', plugin.name);
    // Here you would handle plugin uninstallation
  };

  const handleTogglePlugin = (plugin: Plugin) => {
    console.log('Toggling plugin:', plugin.name);
    // Here you would handle enabling/disabling plugin
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plugin Manager</h2>
          <p className="text-gray-600">Manage and install plugins for your server</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'installed'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Installed ({installedPlugins.length})
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plugin List */}
      <div className="space-y-4">
        {activeTab === 'installed' ? (
          <>
            {filteredPlugins(installedPlugins).map((plugin) => (
              <div key={plugin.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(plugin.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plugin.enabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {plugin.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{plugin.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>v{plugin.version}</span>
                        <span>by {plugin.author}</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{plugin.downloads}</span>
                        </div>
                        {renderStars(plugin.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePlugin(plugin)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        plugin.enabled
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {plugin.enabled ? 'Disable' : 'Enable'}
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleUninstall(plugin)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {filteredPlugins(marketplacePlugins).map((plugin) => (
              <div key={plugin.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(plugin.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                        {plugin.compatible ? (
                          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>Compatible</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Incompatible
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{plugin.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>v{plugin.version}</span>
                        <span>by {plugin.author}</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{plugin.downloads}</span>
                        </div>
                        {renderStars(plugin.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleInstall(plugin)}
                      disabled={!plugin.compatible}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                        plugin.compatible
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Install</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        
        {((activeTab === 'installed' ? filteredPlugins(installedPlugins) : filteredPlugins(marketplacePlugins)).length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No plugins available'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};