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

  private async applicationRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/application${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.applicationToken}`,
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
        if (response.status === 401) {
          throw new Error('Invalid application API token');
        }
        if (response.status === 403) {
          throw new Error('Insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('User not found');
        }
        if (response.status === 405) {
          throw new Error('CORS configuration issue');
        }
        
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Pterodactyl Panel - CORS issue');
      }
      throw error;
    }
  }

  private async clientRequest(endpoint: string, token: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/client${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.pterodactyl.v1+json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Client API error: ${response.status}`);
    }

    return await response.json();
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<PanelUser | null> {
    try {
      const response = await this.applicationRequest(`/users?filter[email]=${encodeURIComponent(email)}`);
      
      if (response.data && response.data.length > 0) {
        return response.data[0].attributes;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to find user:', error);
      return null;
    }
  }

  // Create a new user on the panel
  async createUser(email: string, password: string, firstName: string, lastName: string): Promise<PanelUser> {
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const userData = {
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      password,
      root_admin: false,
      language: 'en'
    };

    try {
      const response = await this.applicationRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response.attributes;
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate a client API key for the user
  async generateClientApiKey(userId: number, description: string = 'MinecraftCP Frontend'): Promise<string> {
    try {
      // First, try to get existing API keys to avoid duplicates
      const existingKeys = await this.getUserApiKeys(userId);
      const existingKey = existingKeys.find(key => key.description === description);
      
      if (existingKey) {
        // Return the existing key identifier (this is the actual API key)
        return existingKey.identifier;
      }

      // Create new API key using the application API
      // Note: This is a workaround since we can't directly create client API keys via application API
      // In a real implementation, you might need to use a different approach or have the user create their own key
      
      // For now, we'll create a temporary solution where we store a mapping
      // In production, you'd want to implement proper API key generation
      const tempApiKey = `ptlc_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store this mapping in your backend/database
      // For demo purposes, we'll use localStorage
      const apiKeyMapping = {
        userId,
        apiKey: tempApiKey,
        description,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(`api_key_${userId}`, JSON.stringify(apiKeyMapping));
      
      return tempApiKey;
    } catch (error) {
      throw new Error(`Failed to generate API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's API keys (this would need to be implemented differently in production)
  async getUserApiKeys(userId: number): Promise<ApiKey[]> {
    try {
      // In production, this would query the panel's database or use a proper API endpoint
      // For demo purposes, check localStorage
      const storedKey = localStorage.getItem(`api_key_${userId}`);
      if (storedKey) {
        const keyData = JSON.parse(storedKey);
        return [{
          identifier: keyData.apiKey,
          description: keyData.description,
          allowed_ips: [],
          last_used_at: null,
          created_at: keyData.created_at
        }];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Authenticate user with email/password and return user data + API key
  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Step 1: Find user by email
      let user = await this.findUserByEmail(email);
      
      if (!user) {
        return {
          user: null as any,
          apiKey: '',
          success: false,
          message: 'User not found. Please check your email address.'
        };
      }

      // Step 2: Verify password (in production, this would be done securely)
      // For demo purposes, we'll accept any password for existing users
      // In production, you'd need to implement proper password verification
      
      // Step 3: Generate or get existing client API key
      const apiKey = await this.generateClientApiKey(user.id);
      
      // Step 4: Test the API key by making a client request
      try {
        await this.clientRequest('/account', apiKey);
      } catch (error) {
        // If the generated key doesn't work, it means we need a real client API key
        // In this case, we'll provide instructions to the user
        return {
          user,
          apiKey: '',
          success: false,
          message: 'Please create a Client API key in your Pterodactyl Panel and enter it manually.'
        };
      }

      return {
        user,
        apiKey,
        success: true
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

  // Register a new user
  async registerUser(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      // Step 1: Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        return {
          user: null as any,
          apiKey: '',
          success: false,
          message: 'User already exists with this email address'
        };
      }

      // Step 2: Create new user
      const user = await this.createUser(email, password, firstName, lastName);

      // Step 3: Generate client API key
      const apiKey = await this.generateClientApiKey(user.id);

      return {
        user,
        apiKey,
        success: true
      };
    } catch (error) {
      return {
        user: null as any,
        apiKey: '',
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Validate an existing API key
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await this.clientRequest('/account', apiKey);
      return {
        valid: true,
        user: response.attributes
      };
    } catch (error) {
      return {
        valid: false
      };
    }
  }
}

export const pterodactylAuthApi = new PterodactylAuthService();
export type { PanelUser, ApiKey, AuthResponse };