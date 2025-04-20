import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 px-6 border-t border-gray-200 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-500">
          © {currentYear} Friday. All rights reserved.
        </div>
        <div className="text-sm text-gray-500">
          Made with ❤️ by Joan Louji
        </div>
      </div>
    </footer>
  );
}

export default Footer;
