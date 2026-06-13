import React from 'react';
import { motion } from 'motion/react';
import { TestStats } from '../types';
import { 
  BarChart, 
  CheckCircle, 
  AlertTriangle, 
  TerminalSquare, 
  Lock, 
  Database 
} from 'lucide-react';

interface DashboardProps {
  stats: TestStats;
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">Test Statistics Dashboard</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Executive overview of all autonomously generated test cases across your API suite.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">Total APIs Processed</p>
            <h3 className="text-5xl font-bold text-neutral-900 dark:text-white">{stats.totalApis}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active Sync</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">Total Tests Generated</p>
            <h3 className="text-5xl font-bold text-neutral-900 dark:text-white">{stats.totalTests}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1"><TerminalSquare className="w-3 h-3"/> AST Validated Code</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
            <BarChart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Detailed Test Categories</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Happy Path</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.happyPath}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Missing Fields</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.missingField}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20">
              <TerminalSquare className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Invalid Types</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.invalidType}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Authentication</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.authTests}</p>
        </motion.div>

      </div>
    </div>
  );
}
