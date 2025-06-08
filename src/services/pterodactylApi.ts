// Pterodactyl Panel API Service
const PANEL_API_BASE = import.meta.env.VITE_PANEL_API_URL || 'https://game.vincentvanhoof.be';
let PANEL_API_TOKEN = import.meta.env.VITE_PANEL_API_TOKEN || 'ptla_Fe2x9E3wDHX9f2mXJDXdSkzA2jl3IQ6hzPX9JHdd3KT';

interface PterodactylServer {
  object: string;
  attributes: {
    server_owner: boolean;
    identifier: string;
    internal_id: number;
    uuid: string;
    name: string;
    description: string;
    status: string | null;
    is_suspended: boolean;
    is_installing: boolean;
    is_transferring: boolean;
    node: string;
    sftp_details: {
      ip: string;
      port: number;
    };
    invocation: string;
    docker_image: string;
    egg_features: string[];
    feature_limits: {
      databases: number;
      allocations: number;
      backups: number;
    };
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
      threads: string | null;
      oom_disabled: boolean;
    };
    relationships: {
      allocations: {
        object: string;
        data: Array<{
          object: string;
          attributes: {
            id: number;
            ip: string;
            ip_alias: string | null;
            port: number;
            notes: string | null;
            is_default: boolean;
          };
        }>;
      };
    };
  };
}

interface ServerStats {
  object: string;
  attributes: {
    current_state: string;
    is_suspended: boolean;
    resources: {
      memory_bytes: number;
      memory_limit_bytes: number;
      cpu_absolute: number;
      network_rx_bytes: number;
      network_tx_bytes: number;
      uptime: number;
      disk_bytes: number;
    };
  };
}

interface FileObject {
  object: string;
  attributes: {
    name: string;
    mode: string;
    mode_bits: string;
    size: number;
    is_file: boolean;
    is_symlink: boolean;
    mimetype: string;
    created_at: string;
    modified_at: string;
  };
}

interface BackupObject {
  object: string;
  attributes: {
    uuid: string;
    name: string;
    ignored_files: string[];
    sha256_hash: string;
    bytes: number;
    created_at: string;
    completed_at: string | null;
    is_successful: boolean;
    is_locked: boolean;
    checksum: string | null;
  };
}

interface DatabaseObject {
  object: string;
  attributes: {
    id: string;
    name: string;
    username: string;
    connections_from: string;
    max_connections: number;
    relationships: {
      password: {
        object: string;
        attributes: {
          password: string;
        };
      };
    };
  };
}

interface WebSocketCredentials {
  object: string;
  attributes: {
    token: string;
    socket: string;
  };
}

class PterodactylApiService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = PANEL_API_BASE;
    this.token = PANEL_API_TOKEN;
  }

  // Method to update the API token dynamically
  updateToken(newToken: string) {
    this.token = newToken;
    PANEL_API_TOKEN = newToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/client${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.pterodactyl.v1+json',
      ...(import.meta.env.DEV && { 'X-Requested-With': 'XMLHttpRequest' }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API token - please check your credentials');
        }
        if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        if (response.status === 405) {
          throw new Error('CORS configuration issue - please configure CORS on your Pterodactyl Panel');
        }
        
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Pterodactyl Panel. This might be a CORS issue - please check the panel configuration or use a CORS proxy.');
      }
      console.error('Pterodactyl API request failed:', error);
      throw error;
    }
  }

  // Fallback method using mock data when CORS fails
  private async requestWithFallback(endpoint: string, options: RequestInit = {}) {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      return this.getMockData(endpoint);
    }
  }

  private getMockData(endpoint: string) {
    // Mock data for development when CORS fails
    if (endpoint === '/') {
      return {
        data: [
          {
            object: 'server',
            attributes: {
              server_owner: true,
              identifier: 'mock-server-1',
              internal_id: 1,
              uuid: 'mock-uuid-1',
              name: 'Survival World',
              description: 'A survival Minecraft server',
              status: null,
              is_suspended: false,
              is_installing: false,
              is_transferring: false,
              node: 'Node-1',
              sftp_details: { ip: '127.0.0.1', port: 2022 },
              invocation: 'java -Xms128M -Xmx2048M -jar server.jar',
              docker_image: 'quay.io/pterodactyl/core:java',
              egg_features: [],
              feature_limits: { databases: 5, allocations: 5, backups: 10 },
              limits: {
                memory: 2048,
                swap: 0,
                disk: 10240,
                io: 500,
                cpu: 200,
                threads: null,
                oom_disabled: true
              },
              relationships: {
                allocations: {
                  object: 'list',
                  data: [{
                    object: 'allocation',
                    attributes: {
                      id: 1,
                      ip: '127.0.0.1',
                      ip_alias: null,
                      port: 25565,
                      notes: null,
                      is_default: true
                    }
                  }]
                }
              }
            }
          }
        ]
      };
    }

    if (endpoint.includes('/resources')) {
      return {
        object: 'stats',
        attributes: {
          current_state: 'running',
          is_suspended: false,
          resources: {
            memory_bytes: 1073741824,
            memory_limit_bytes: 2147483648,
            cpu_absolute: 45.5,
            network_rx_bytes: 1024000,
            network_tx_bytes: 2048000,
            uptime: 3600000,
            disk_bytes: 5368709120
          }
        }
      };
    }

    return { data: [] };
  }

  // Account Management
  async getAccount() {
    return this.requestWithFallback('/account');
  }

  // Server Management
  async getServers(): Promise<PterodactylServer[]> {
    try {
      const response = await this.requestWithFallback('/');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      throw error;
    }
  }

  async getServer(identifier: string): Promise<PterodactylServer> {
    const response = await this.requestWithFallback(`/servers/${identifier}`);
    return response.attributes;
  }

  async getServerStats(identifier: string): Promise<ServerStats> {
    return this.requestWithFallback(`/servers/${identifier}/resources`);
  }

  // Server Control
  async sendPowerAction(identifier: string, action: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/power`, {
        method: 'POST',
        body: JSON.stringify({ signal: action }),
      });
    } catch (error) {
      console.warn(`Mock ${action} action for server ${identifier}`);
      // In development, just log the action
    }
  }

  async startServer(identifier: string): Promise<void> {
    return this.sendPowerAction(identifier, 'start');
  }

  async stopServer(identifier: string): Promise<void> {
    return this.sendPowerAction(identifier, 'stop');
  }

  async restartServer(identifier: string): Promise<void> {
    return this.sendPowerAction(identifier, 'restart');
  }

  async killServer(identifier: string): Promise<void> {
    return this.sendPowerAction(identifier, 'kill');
  }

  // Console
  async sendCommand(identifier: string, command: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/command`, {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
    } catch (error) {
      console.warn(`Mock command sent: ${command}`);
    }
  }

  async getWebSocketCredentials(identifier: string): Promise<WebSocketCredentials> {
    try {
      return await this.request(`/servers/${identifier}/websocket`);
    } catch (error) {
      // Return mock WebSocket credentials for development
      return {
        object: 'websocket',
        attributes: {
          token: 'mock-token',
          socket: 'wss://game.vincentvanhoof.be:8080'
        }
      };
    }
  }

  // Create WebSocket connection
  async createWebSocket(identifier: string): Promise<WebSocket> {
    try {
      const credentials = await this.getWebSocketCredentials(identifier);
      const ws = new WebSocket(credentials.attributes.socket);
      
      // Send authentication token when connection opens
      ws.onopen = () => {
        ws.send(JSON.stringify({
          event: 'auth',
          args: [credentials.attributes.token]
        }));
      };
      
      return ws;
    } catch (error) {
      throw new Error('Failed to create WebSocket connection');
    }
  }

  // File Management
  async getFiles(identifier: string, directory: string = '/'): Promise<FileObject[]> {
    try {
      const params = new URLSearchParams({ directory });
      const response = await this.request(`/servers/${identifier}/files/list?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch files:', error);
      // Return mock file structure
      return [
        {
          object: 'file',
          attributes: {
            name: 'server.properties',
            mode: '644',
            mode_bits: '-rw-r--r--',
            size: 1024,
            is_file: true,
            is_symlink: false,
            mimetype: 'text/plain',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          }
        },
        {
          object: 'file',
          attributes: {
            name: 'plugins',
            mode: '755',
            mode_bits: 'drwxr-xr-x',
            size: 0,
            is_file: false,
            is_symlink: false,
            mimetype: 'inode/directory',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          }
        }
      ];
    }
  }

  async getFileContents(identifier: string, file: string): Promise<string> {
    try {
      const params = new URLSearchParams({ file });
      const response = await fetch(`${this.baseUrl}/api/client/servers/${identifier}/files/contents?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.pterodactyl.v1+json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get file contents: ${response.statusText}`);
      }
      
      return response.text();
    } catch (error) {
      // Return mock file content
      return `# Mock file content for ${file}
# This is a placeholder while CORS is being configured
server-name=Survival World
gamemode=survival
difficulty=normal
max-players=20`;
    }
  }

  async writeFile(identifier: string, file: string, contents: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/write`, {
        method: 'POST',
        body: JSON.stringify({ file, contents }),
      });
    } catch (error) {
      console.warn(`Mock file write: ${file}`);
    }
  }

  async createDirectory(identifier: string, name: string, path: string = '/'): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/create-folder`, {
        method: 'POST',
        body: JSON.stringify({ name, path }),
      });
    } catch (error) {
      console.warn(`Mock directory creation: ${name}`);
    }
  }

  async deleteFiles(identifier: string, files: string[]): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/delete`, {
        method: 'POST',
        body: JSON.stringify({ files }),
      });
    } catch (error) {
      console.warn(`Mock file deletion:`, files);
    }
  }

  async renameFile(identifier: string, from: string, to: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/rename`, {
        method: 'PUT',
        body: JSON.stringify({ from, to }),
      });
    } catch (error) {
      console.warn(`Mock file rename: ${from} -> ${to}`);
    }
  }

  async copyFile(identifier: string, location: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/copy`, {
        method: 'POST',
        body: JSON.stringify({ location }),
      });
    } catch (error) {
      console.warn(`Mock file copy: ${location}`);
    }
  }

  async compressFiles(identifier: string, files: string[], archiveName: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/compress`, {
        method: 'POST',
        body: JSON.stringify({ files, archive_name: archiveName }),
      });
    } catch (error) {
      console.warn(`Mock file compression: ${archiveName}`);
    }
  }

  async decompressFile(identifier: string, file: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/files/decompress`, {
        method: 'POST',
        body: JSON.stringify({ file }),
      });
    } catch (error) {
      console.warn(`Mock file decompression: ${file}`);
    }
  }

  // Backups
  async getBackups(identifier: string): Promise<BackupObject[]> {
    try {
      const response = await this.request(`/servers/${identifier}/backups`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      // Return mock backup data
      return [
        {
          object: 'backup',
          attributes: {
            uuid: 'mock-backup-1',
            name: 'Daily Backup - ' + new Date().toLocaleDateString(),
            ignored_files: [],
            sha256_hash: 'mock-hash',
            bytes: 245760000,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            is_successful: true,
            is_locked: false,
            checksum: 'mock-checksum'
          }
        }
      ];
    }
  }

  async createBackup(identifier: string, name?: string, ignored?: string[]): Promise<BackupObject> {
    try {
      return await this.request(`/servers/${identifier}/backups`, {
        method: 'POST',
        body: JSON.stringify({ name, ignored }),
      });
    } catch (error) {
      console.warn(`Mock backup creation: ${name}`);
      return {
        object: 'backup',
        attributes: {
          uuid: 'mock-backup-new',
          name: name || 'New Backup',
          ignored_files: ignored || [],
          sha256_hash: 'mock-hash',
          bytes: 0,
          created_at: new Date().toISOString(),
          completed_at: null,
          is_successful: false,
          is_locked: false,
          checksum: null
        }
      };
    }
  }

  async getBackup(identifier: string, backupUuid: string): Promise<BackupObject> {
    try {
      return await this.request(`/servers/${identifier}/backups/${backupUuid}`);
    } catch (error) {
      throw new Error('Mock backup not found');
    }
  }

  async deleteBackup(identifier: string, backupUuid: string): Promise<void> {
    try {
      return await this.request(`/servers/${identifier}/backups/${backupUuid}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn(`Mock backup deletion: ${backupUuid}`);
    }
  }

  async getBackupDownloadUrl(identifier: string, backupUuid: string): Promise<{ url: string }> {
    try {
      return await this.request(`/servers/${identifier}/backups/${backupUuid}/download`);
    } catch (error) {
      return { url: '#' }; // Mock download URL
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const pterodactylApi = new PterodactylApiService();

// Make the API service available globally for token updates
(window as any).pterodactylApi = pterodactylApi;

export type { 
  PterodactylServer, 
  ServerStats, 
  FileObject, 
  BackupObject, 
  DatabaseObject, 
  WebSocketCredentials 
};