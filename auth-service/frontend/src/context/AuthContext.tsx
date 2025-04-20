import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPasskey: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerPasskey: (email: string) => Promise<void>;
  logout: () => void;
  supportsPasskeys: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginWithPasskey: async () => {},
  register: async () => {},
  registerPasskey: async () => {},
  logout: () => {},
  supportsPasskeys: false,
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAILS = ['admin@example.com', 'admin@friday.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supportsPasskeys, setSupportsPasskeys] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if browser supports WebAuthn/passkeys
    const checkPasskeySupport = () => {
      return window && 
             window.PublicKeyCredential && 
             typeof window.PublicKeyCredential === 'function' && 
             typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    };

    const checkBiometricSupport = async () => {
      if (checkPasskeySupport()) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setSupportsPasskeys(available);
        } catch (error) {
          console.error('Error checking passkey support:', error);
          setSupportsPasskeys(false);
        }
      } else {
        setSupportsPasskeys(false);
      }
    };

    checkBiometricSupport();

    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, use the password to authenticate
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      localStorage.setItem('auth_token', 'mock_token_12345');
      localStorage.setItem('user_email', email);
      
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      setUser({
        id: '1',
        name: email.split('@')[0], 
        email,
        isAdmin,
        roles: isAdmin ? ['admin', 'user'] : ['user'],
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual WebAuthn authentication call
      // Mock implementation for prototype
      const mockEmail = 'demo@example.com';
      
      // In a real app, validate the passkey with the server
      // const credential = await navigator.credentials.get({
      //   publicKey: {
      //     challenge: new Uint8Array([...]),
      //     // other required parameters
      //   }
      // });
      
      // Pretend this works for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('auth_token', 'mock_token_passkey');
      localStorage.setItem('user_email', mockEmail);
      
      const isAdmin = ADMIN_EMAILS.includes(mockEmail);
      
      setUser({
        id: '1',
        name: 'Passkey User',
        email: mockEmail,
        isAdmin,
        roles: isAdmin ? ['admin', 'user'] : ['user'],
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Passkey login failed:', error);
      throw new Error('Passkey authentication failed. Please try again or use password login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, use the password to register
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      // Mock registration for development until the real API is ready
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
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register passkey for an existing account
  const registerPasskey = async (email: string) => {
    setIsLoading(true);
    try {
      // This would be replaced with actual WebAuthn registration call
      // Mock implementation for prototype
      
      // In a real app, register the passkey with the server
      // const credential = await navigator.credentials.create({
      //   publicKey: {
      //     challenge: new Uint8Array([...]),
      //     rp: { name: 'Friday App', id: window.location.hostname },
      //     user: {
      //       id: new Uint8Array([...]),
      //       name: email,
      //       displayName: email.split('@')[0],
      //     },
      //     pubKeyCredParams: [...],
      //     // other required parameters
      //   }
      // });
      
      // Pretend this works for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Passkey registration failed:', error);
      throw new Error('Failed to register passkey. Please try again later.');
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
    loginWithPasskey,
    register,
    registerPasskey,
    logout,
    supportsPasskeys,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 