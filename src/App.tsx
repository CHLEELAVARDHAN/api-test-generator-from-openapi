import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ApiWorkspace } from './components/ApiWorkspace';
import { apis } from './data';
import { TestStats } from './types';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme] = useState<'dark'|'light'>('dark');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Track which APIs have been generated to calculate dashboard stats dynamically
  const [completedApis, setCompletedApis] = useState<Set<string>>(new Set());

  const handleRefresh = () => {
    if (activeTab !== 'dashboard') {
      setCompletedApis(prev => {
        const next = new Set(prev);
        next.delete(activeTab);
        return next;
      });
    } else {
      setCompletedApis(new Set());
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleGenerateSuccess = (apiId: string) => {
    setCompletedApis(prev => {
      const next = new Set(prev);
      next.add(apiId);
      return next;
    });
  };

  const currentApi = apis.find(a => a.id === activeTab);

  const stats: TestStats = {
    totalApis: completedApis.size, // Calculated dynamically based on run tests
    totalTests: completedApis.size * 4,
    happyPath: completedApis.size,
    missingField: completedApis.size,
    invalidType: completedApis.size,
    authTests: completedApis.size
  };

  return (
    <div className={`flex bg-neutral-50 dark:bg-[#0A0A0B] text-neutral-800 dark:text-neutral-200 font-sans h-screen overflow-hidden ${theme}`}>
      
      <Sidebar 
        activeTab={activeTab} 
        onSelect={setActiveTab} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <div className="h-16 border-b border-neutral-200 dark:border-neutral-800/50 flex items-center justify-between px-8 shrink-0 bg-neutral-50/80 dark:bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-20">
          <h1 className="font-semibold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            ⚡ AI Agentic API Test Generator
          </h1>
          <div className="flex items-center gap-4 text-sm">
             <span className="text-neutral-500 font-mono text-xs">Environment: Streamlit UI Mock</span>
             <button 
                 onClick={handleRefresh}
                 className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                 title="Refresh to Re-upload Data"
             >
                 <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-10">
          {activeTab === 'dashboard' ? (
            <Dashboard stats={stats} />
          ) : currentApi ? (
            <ApiWorkspace 
              key={`${currentApi.id}-${refreshKey}`}
              api={currentApi} 
              onGenerateSuccess={handleGenerateSuccess}
              hasRun={completedApis.has(currentApi.id)}
            />
          ) : null}
        </div>
      </main>

    </div>
  );
}

