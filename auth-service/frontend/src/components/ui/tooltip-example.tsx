import React from 'react';
import { Tooltip } from './tooltip';

export function TooltipExample() {
  return (
    <div className="p-10 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Tooltip Examples</h2>
      
      <div className="flex flex-wrap gap-8">
        <div>
          <h3 className="font-medium mb-2">Basic Usage</h3>
          <Tooltip content="This is a basic tooltip">
            <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>
          </Tooltip>
        </div>

        <div>
          <h3 className="font-medium mb-2">Different Positions</h3>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Tooltip on top" position="top">
              <button className="px-4 py-2 bg-green-500 text-white rounded">Top</button>
            </Tooltip>
            
            <Tooltip content="Tooltip on bottom" position="bottom">
              <button className="px-4 py-2 bg-green-500 text-white rounded">Bottom</button>
            </Tooltip>
            
            <Tooltip content="Tooltip on left" position="left">
              <button className="px-4 py-2 bg-green-500 text-white rounded">Left</button>
            </Tooltip>
            
            <Tooltip content="Tooltip on right" position="right">
              <button className="px-4 py-2 bg-green-500 text-white rounded">Right</button>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">With Icons</h3>
        <div className="flex gap-4 items-center">
          <Tooltip content="This field is required">
            <span className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
              </svg>
            </span>
          </Tooltip>
          
          <Tooltip content="More information about this feature" position="right">
            <span className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
            </span>
          </Tooltip>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">With Form Elements</h3>
        <div className="max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Username
              <Tooltip content="Choose a unique username between 3-15 characters" position="right">
                <span className="ml-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                </span>
              </Tooltip>
            </label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">
              Password Strength
              <Tooltip content="Passwords should include uppercase, lowercase, numbers and special characters" position="right">
                <span className="ml-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                </span>
              </Tooltip>
            </label>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Strong</p>
          </div>
        </div>
      </div>
    </div>
  );
} 