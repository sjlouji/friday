import React from 'react';
import { Tooltip } from './ui/tooltip';

export default function TooltipExample() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Tooltip Examples</h1>
      
      <div className="flex items-center gap-2">
        <span>Hover over the question mark</span>
        <Tooltip text="This is a helpful tooltip explaining something important." />
      </div>
      
      <div className="flex items-center gap-2">
        <span>Custom tooltip trigger</span>
        <Tooltip text="You can customize the tooltip trigger element.">
          <button className="px-3 py-1 bg-blue-500 text-white rounded-md">Hover me</button>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip text="Tooltips can be used with various UI elements">
          <span className="underline cursor-help">Helpful term</span>
        </Tooltip>
        <span> - hover to see explanation</span>
      </div>
    </div>
  );
} 