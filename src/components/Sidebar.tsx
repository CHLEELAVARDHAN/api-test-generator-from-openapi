import React, { useState } from 'react';
import { LayoutDashboard, FileJson, Beaker, ChevronLeft, ChevronRight } from 'lucide-react';
import { apis } from '../data';

interface SidebarProps {
  activeTab: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside className={`${isMinimized ? 'w-20' : 'w-72'} transition-all duration-300 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-screen shrink-0 z-30 relative`}>
      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-2 top-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full p-1.5 z-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm cursor-pointer"
      >
        {isMinimized ? <ChevronRight className="w-4 h-4 text-neutral-500" /> : <ChevronLeft className="w-4 h-4 text-neutral-500" />}
      </button>

      <div className={`p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur z-10 flex items-center ${isMinimized ? 'justify-center' : 'gap-2'}`}>
        <Beaker className="w-5 h-5 text-purple-600 dark:text-purple-500 shrink-0" />
        {!isMinimized && (
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 line-clamp-1">
              Test Generator
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono uppercase tracking-wider line-clamp-1">
              AI QA Architecture
            </p>
          </div>
        )}
      </div>
      
      <nav className="p-4 space-y-6 overflow-y-auto flex-1">
        
        {/* Dashboard Section */}
        <div>
          {!isMinimized && <h2 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2 line-clamp-1">Metrics</h2>}
          <button
            onClick={() => onSelect('dashboard')}
            title="Test Statistics"
            className={
              "w-full text-left p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 " +
              (activeTab === 'dashboard'
                ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-500/20' 
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200') + 
                (isMinimized ? ' justify-center' : ' px-3')
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!isMinimized && <span>Test Statistics</span>}
          </button>
        </div>

        {/* APIs Section */}
        <div>
          {!isMinimized && <h2 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2 line-clamp-1">API Schemas</h2>}
          <div className="space-y-1">
            {apis.map((api) => {
              const isActive = activeTab === api.id;
              return (
                <button
                  key={api.id}
                  onClick={() => onSelect(api.id)}
                  title={api.name}
                  className={
                    "w-full text-left p-2 rounded-lg text-sm transition-all flex items-center gap-3 " +
                    (isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-300 dark:border-neutral-700' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 border border-transparent') + 
                      (isMinimized ? ' justify-center' : ' px-3')
                  }
                >
                  <FileJson className={"w-5 h-5 shrink-0 " + (isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500')} />
                  {!isMinimized && <span className="truncate">{api.name}</span>}
                </button>
              );
            })}
          </div>
        </div>

      </nav>
    </aside>
  );
}
