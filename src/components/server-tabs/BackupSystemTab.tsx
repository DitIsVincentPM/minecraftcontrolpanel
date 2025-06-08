import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Clock, 
  Database, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { pterodactylApi, BackupObject } from '../../services/pterodactylApi';

interface BackupSystemTabProps {
  serverData: any;
  serverId: string;
}

export const BackupSystemTab: React.FC<BackupSystemTabProps> = ({ serverData, serverId }) => {
  const [backups, setBackups] = useState<BackupObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, [serverId]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const backupList = await pterodactylApi.getBackups(serverId);
      setBackups(backupList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const backupName = `Manual Backup - ${new Date().toLocaleDateString()}`;
      await pterodactylApi.createBackup(serverId, backupName);
      await fetchBackups(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownload = async (backup: BackupObject) => {
    try {
      const downloadData = await pterodactylApi.getBackupDownloadUrl(serverId, backup.attributes.uuid);
      window.open(downloadData.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get download URL');
    }
  };

  const handleDelete = async (backup: BackupObject) => {
    if (window.confirm(`Are you sure you want to delete "${backup.attributes.name}"? This action cannot be undone.`)) {
      try {
        await pterodactylApi.deleteBackup(serverId, backup.attributes.uuid);
        await fetchBackups(); // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete backup');
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup System</h2>
          <p className="text-gray-600">Manage server backups and restoration</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBackups}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingBackup ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
            <p className="text-gray-600 mb-4">Create your first backup to get started</p>
            <button
              onClick={handleCreateBackup}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create First Backup
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <div key={backup.attributes.uuid} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {backup.attributes.is_successful ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">{backup.attributes.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          backup.attributes.is_successful 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {backup.attributes.is_successful ? 'Completed' : 'Failed'}
                        </span>
                        {backup.attributes.is_locked && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Locked
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <Database className="w-4 h-4" />
                          <span>{formatBytes(backup.attributes.bytes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(backup.attributes.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {backup.attributes.ignored_files.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span>Ignored files: {backup.attributes.ignored_files.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {backup.attributes.is_successful && backup.attributes.completed_at && (
                      <button
                        onClick={() => handleDownload(backup)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download Backup"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    {!backup.attributes.is_locked && (
                      <button
                        onClick={() => handleDelete(backup)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Backup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Storage Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Total backup storage used: {formatBytes(backups.reduce((acc, backup) => acc + backup.attributes.bytes, 0))}. 
              Backups are stored on your Pterodactyl server and managed automatically based on your server's backup limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};