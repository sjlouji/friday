import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <nav className="w-full py-3 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary rounded-full shadow-md flex items-center justify-center">
                <span className="text-white text-xl font-bold">F</span>
              </div>
              <div className="ml-3">
                <Link to="/" className="text-primary text-2xl font-extrabold tracking-tight">
                  FRIDAY
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
