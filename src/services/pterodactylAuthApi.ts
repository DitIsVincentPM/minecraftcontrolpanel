// Pterodactyl Panel Authentication API Service
const PANEL_API_BASE = import.meta.env.VITE_PANEL_API_URL || 'https://game.vincentvanhoof.be';
const PANEL_APPLICATION_TOKEN = import.meta.env.VITE_PANEL_APPLICATION_TOKEN || 'ptla_Fe2x9E3wDHX9f2mXJDXdSkzA2jl3IQ6hzPX9JHdd3KT';

interface PanelUser {
  id: number;
  external_id: string | null;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  '2fa': boolean;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  identifier: string;
  description: string;
  allowed_ips: string[];
  last_used_at: string | null;
  created_at: string;
}

interface AuthResponse {
  user: PanelUser;
  apiKey: string;
  success: boolean;
  message?: string;
}

class PterodactylAuthService {
  private baseUrl: string;
  private applicationToken: string;

  constructor() {
    this.baseUrl = PANEL_API_BASE;
    this.applicationToken = PANEL_APPLICATION_TOKEN;
  }

  private async clientRequest(endpoint: string, token: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/client${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.pterodactyl.v1+json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Client API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Pterodactyl Panel - CORS issue');
      }
      throw error;
    }
  }

  // Simplified authentication - just validate the API key directly
  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // For demo purposes, accept admin/admin
      if (email === 'admin' && password === 'admin') {
        return {
          user: {
            id: 0,
            external_id: null,
            uuid: 'demo-uuid',
            username: 'admin',
            email: 'admin@minecraftcp.com',
            first_name: 'Administrator',
            last_name: 'User',
            language: 'en',
            root_admin: true,
            '2fa': false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          apiKey: 'demo-admin-key',
          success: true
        };
      }

      // For real authentication, we need the user to provide their Client API key
      // since we can't reliably authenticate with email/password through the API
      return {
        user: null as any,
        apiKey: '',
        success: false,
        message: 'Please use the API Key login option with your Pterodactyl Client API key.'
      };
    } catch (error) {
      return {
        user: null as any,
        apiKey: '',
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Simplified registration - direct users to use API key
  async registerUser(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    return {
      user: null as any,
      apiKey: '',
      success: false,
      message: 'Registration is not available. Please use your existing Pterodactyl account and Client API key.'
    };
  }

  // Validate an existing API key by testing it against the client API
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await this.clientRequest('/account', apiKey);
      return {
        valid: true,
        user: response.attributes
      };
    } catch (error) {
      console.error('API key validation failed:', error);
      return {
        valid: false
      };
    }
  }
}

export const pterodactylAuthApi = new PterodactylAuthService();
export type { PanelUser, ApiKey, AuthResponse };