import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  roles?: string[];
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Admin emails for development
const ADMIN_EMAILS = ['admin@example.com', 'admin@friday.com'];

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // In a real app, verify the token with your API
          // const response = await api.verifyToken(token);
          // setUser(response.user);
          
          // Mock user for development
          const savedEmail = localStorage.getItem('user_email') || 'demo@example.com';
          const isAdmin = ADMIN_EMAILS.includes(savedEmail);
          
          setUser({
            id: '1',
            name: 'Demo User',
            email: savedEmail,
            isAdmin,
            roles: isAdmin ? ['admin', 'user'] : ['user'],
          });
        } catch (error) {
          console.error('Auth token validation failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_email');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, call your API
      // const response = await api.login(email, password);
      // localStorage.setItem('auth_token', response.token);
      // setUser(response.user);
      
      // Mock login for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('auth_token', 'mock_token_12345');
      localStorage.setItem('user_email', email);
      
      // Check if user is admin (for mock purposes)
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      setUser({
        id: '1',
        name: email.split('@')[0], // Use part of email as name
        email,
        isAdmin,
        roles: isAdmin ? ['admin', 'user'] : ['user'],
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, call your API
      // const response = await api.register(name, email, password);
      // localStorage.setItem('auth_token', response.token);
      // setUser(response.user);
      
      // Mock registration for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('auth_token', 'mock_token_12345');
      localStorage.setItem('user_email', email);
      
      // Check if user is admin (for mock purposes)
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      setUser({
        id: '1',
        name,
        email,
        isAdmin,
        roles: isAdmin ? ['admin', 'user'] : ['user'],
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 