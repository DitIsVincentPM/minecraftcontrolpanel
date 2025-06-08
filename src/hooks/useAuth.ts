import { useState, useEffect } from 'react';
import { pterodactylAuthApi, AuthResponse } from '../services/pterodactylAuthApi';

interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  isAdmin: boolean;
  apiKey: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  loginWithApiKey: (apiKey: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): AuthContextType => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate stored API key on app load
  useEffect(() => {
    const validateStoredAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAuth = localStorage.getItem('auth');
      
      if (storedAuth === 'true' && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.apiKey) {
            const validation = await pterodactylAuthApi.validateApiKey(userData.apiKey);
            if (!validation.valid) {
              // API key is invalid, clear auth
              logout();
            }
          }
        } catch (err) {
          console.error('Failed to validate stored auth:', err);
          logout();
        }
      }
    };

    validateStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for demo admin credentials
      if (email === 'admin' && password === 'admin') {
        const adminUser: User = {
          id: 0,
          email: 'admin@minecraftcp.com',
          name: 'Administrator',
          username: 'admin',
          isAdmin: true,
          apiKey: 'demo-admin-key'
        };
        
        setIsAuthenticated(true);
        setUser(adminUser);
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }

      // Authenticate with Pterodactyl Panel
      const authResponse: AuthResponse = await pterodactylAuthApi.authenticateUser(email, password);
      
      if (authResponse.success && authResponse.user && authResponse.apiKey) {
        const userData: User = {
          id: authResponse.user.id,
          email: authResponse.user.email,
          name: `${authResponse.user.first_name} ${authResponse.user.last_name}`,
          username: authResponse.user.username,
          isAdmin: authResponse.user.root_admin,
          apiKey: authResponse.apiKey
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update the pterodactyl API service with the user's API key
        updateApiToken(authResponse.apiKey);
        
        return true;
      } else {
        setError(authResponse.message || 'Authentication failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const authResponse: AuthResponse = await pterodactylAuthApi.registerUser(
        email, 
        password, 
        firstName, 
        lastName
      );
      
      if (authResponse.success && authResponse.user && authResponse.apiKey) {
        const userData: User = {
          id: authResponse.user.id,
          email: authResponse.user.email,
          name: `${authResponse.user.first_name} ${authResponse.user.last_name}`,
          username: authResponse.user.username,
          isAdmin: authResponse.user.root_admin,
          apiKey: authResponse.apiKey
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update the pterodactyl API service with the user's API key
        updateApiToken(authResponse.apiKey);
        
        return true;
      } else {
        setError(authResponse.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApiKey = async (apiKey: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const validation = await pterodactylAuthApi.validateApiKey(apiKey);
      
      if (validation.valid && validation.user) {
        const userData: User = {
          id: validation.user.id || 0,
          email: validation.user.email,
          name: validation.user.first_name ? 
            `${validation.user.first_name} ${validation.user.last_name || ''}`.trim() : 
            validation.user.email.split('@')[0],
          username: validation.user.username || validation.user.email.split('@')[0],
          isAdmin: validation.user.root_admin || false,
          apiKey: apiKey
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update the pterodactyl API service with the user's API key
        updateApiToken(apiKey);
        
        return true;
      } else {
        setError('Invalid API key');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API key validation failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
  };

  // Helper function to update API token in pterodactyl service
  const updateApiToken = (token: string) => {
    // This would update the token in the pterodactyl API service
    // We'll need to modify the pterodactyl API service to accept dynamic tokens
    if (window.pterodactylApi) {
      window.pterodactylApi.updateToken(token);
    }
  };

  return { 
    isAuthenticated, 
    user, 
    login, 
    register, 
    loginWithApiKey,
    logout, 
    loading, 
    error 
  };
};