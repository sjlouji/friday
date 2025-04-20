import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@friday/components';
import { User, LogOut, ChevronDown } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if current page is an auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1 text-primary-foreground">
            <span className="flex h-6 w-6 items-center justify-center text-lg font-semibold">F</span>
          </div>
          <span className="text-xl font-bold">FRIDAY</span>
        </div>
        
        {isAuthenticated && !isAuthPage && (
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 text-sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span>{user?.email || user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isAuthenticated && !isAuthPage && (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        )}
        
        {isAuthPage && (
          <div className="flex items-center gap-4">
            {location.pathname !== '/login' && (
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
            )}
            {location.pathname !== '/register' && (
              <Link to="/register">
                <Button variant={location.pathname === '/login' ? "default" : "ghost"} size="sm">Sign up</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
} 