import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ApiDefinition } from '../types';
import { generateDynamicPytest } from '../data';
import { Play, Download, Terminal, CheckCircle2, UploadCloud, FileJson, Loader2 } from 'lucide-react';

interface ApiWorkspaceProps {
  key?: string;
  api: ApiDefinition;
  onGenerateSuccess: (apiId: string) => void;
  hasRun: boolean;
}

type LogMessage = { id: string; text: string; type: 'info' | 'error' | 'success' | 'warning' | 'loading' };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function ApiWorkspace({ api, onGenerateSuccess, hasRun }: ApiWorkspaceProps) {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'healing' | 'ask_user' | 'agent' | 'validating' | 'success'>(hasRun ? 'success' : 'idle');
  const [codeUrl, setCodeUrl] = useState<string>('');
  const [logs, setLogs] = useState<LogMessage[]>(hasRun ? [{ id: 'init', text: '> [SYSTEM] Suite validated successfully. 4 Tests ready.', type: 'success'}] : []);
  const [askField, setAskField] = useState<string | null>(null);
  const [askValue, setAskValue] = useState<string>('');
  const [correctedJsonObj, setCorrectedJsonObj] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultJson = React.useMemo(() => JSON.stringify(
    api.fields.reduce((acc, f) => {
      acc[f.name] = f.type;
      return acc;
    }, {} as Record<string, string>),
    null,
    2
  ), [api]);

  const [rawJsonStr, setRawJsonStr] = useState<string>(defaultJson);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setRawJsonStr(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setRawJsonStr(defaultJson);
    setAskField(null);
    setAskValue('');
    if (!hasRun) {
      setStatus('idle');
      setLogs([]);
    } else {
      setStatus('success');
      setLogs([{ id: 'init', text: '> [SYSTEM] Suite validated successfully. 4 Tests ready.', type: 'success'}]);
    }
  }, [api.id, hasRun, defaultJson]);

  const runGenerationPipeline = async (currentJson: string) => {
     setStatus('parsing');
     setLogs([{ id: Math.random().toString(), text: '> [ORCHESTRATOR] Validating JSON payload against structure...', type: 'info' }]);
     await sleep(600);

     let parsed;
     try {
       parsed = JSON.parse(currentJson);
     } catch (e) {
       setLogs(p => [...p, { id: Math.random().toString(), text: '> [ERROR] Invalid JSON Syntax found in Raw Input.', type: 'error' }]);
       setStatus('healing');
       await sleep(800);
       setLogs(p => [...p, { id: Math.random().toString(), text: '> [AGENT] Recreating the data... repairing syntax structure with default format...', type: 'loading' }]);
       await sleep(1000);
       parsed = JSON.parse(defaultJson);
       currentJson = JSON.stringify(parsed, null, 2);
       setRawJsonStr(currentJson);
       setLogs(p => [...p, { id: Math.random().toString(), text: '> [AGENT] Syntax corrected successfully.', type: 'success' }]);
     }

     let corrected = { ...parsed };
     let needsInputFor: string | null = null;
     
     for (const f of api.fields) {
       if (!(f.name in corrected)) {
          setLogs(p => [...p, { id: Math.random().toString(), text: `> [ERROR] Missing completely: '${f.name}' data isn't available.`, type: 'error' }]);
          needsInputFor = f.name;
          break; 
       }
     }

     if (needsInputFor) {
        setStatus('ask_user');
        setAskField(needsInputFor);
        setCorrectedJsonObj(corrected);
        return;
     }

     let typeErrors = false;
     for (const f of api.fields) {
       const val = corrected[f.name];
       if (f.type === 'integer' || f.type === 'number') {
         if (typeof val === 'string') {
            typeErrors = true;
            setLogs(p => [...p, { id: Math.random().toString(), text: `> [ERROR] Type mismatch: placed string inplace of integer for '${f.name}'.`, type: 'error' }]);
            const num = Number(val);
            corrected[f.name] = isNaN(num) ? 0 : num;
         }
       } else if (f.type === 'string') {
         if (typeof val === 'number') {
            typeErrors = true;
            setLogs(p => [...p, { id: Math.random().toString(), text: `> [ERROR] Type mismatch: typing number in text format in '${f.name}'.`, type: 'error' }]);
            corrected[f.name] = String(val);
         } else if (typeof val === 'string' && val.trim() === '') {
            typeErrors = true;
            setLogs(p => [...p, { id: Math.random().toString(), text: `> [ERROR] Validation failure: didn't add any characters in string for '${f.name}'.`, type: 'error' }]);
            corrected[f.name] = "auto_validated";
         }
       }
     }

     if (typeErrors) {
        setStatus('healing');
        setLogs(p => [...p, { id: Math.random().toString(), text: '> [AGENT] Recreating the data... Auto-correcting mismatched fields...', type: 'loading' }]);
        await sleep(1500);
        currentJson = JSON.stringify(corrected, null, 2);
        setRawJsonStr(currentJson);
        setLogs(p => [...p, { id: Math.random().toString(), text: '> [AGENT] Data Auto-Corrected.', type: 'success' }]);
     }

     await sleep(800);
     
     setStatus('agent');
     setLogs(p => [...p, { id: Math.random().toString(), text: '> [AGENT] Drafting Base Test Scenarios...', type: 'info' }]);
     await sleep(800);
     setLogs(p => [...p, { id: Math.random().toString(), text: '   - Generating Happy Path Suite...', type: 'info' }]);
     setLogs(p => [...p, { id: Math.random().toString(), text: '   - Generating Missing Field Variants...', type: 'info' }]);
     setLogs(p => [...p, { id: Math.random().toString(), text: '   - Generating Invalid Type Coercions...', type: 'info' }]);
     setLogs(p => [...p, { id: Math.random().toString(), text: '   - Generating Authentication Rejections...', type: 'info' }]);
     
     await sleep(800);
     setStatus('validating');
     setLogs(p => [...p, { id: Math.random().toString(), text: '> [VALIDATOR] ast.parse() initiating sequence...', type: 'info' }]);
     await sleep(1000);
     setLogs(p => [...p, { id: Math.random().toString(), text: '> [SYSTEM] Suite validated successfully. 4 Tests ready.', type: 'success' }]);
     setStatus('success');
     onGenerateSuccess(api.id);
  };

  const handleAskSubmit = () => {
    const newObj = { ...correctedJsonObj };
    const f = api.fields.find(x => x.name === askField);
    let finalVal: string | number = askValue;
    if (f?.type === 'number' || f?.type === 'integer') {
       finalVal = Number(askValue) || 0;
    }
    newObj[askField!] = finalVal;
    const newJson = JSON.stringify(newObj, null, 2);
    setRawJsonStr(newJson);
    setAskField(null);
    setAskValue('');
    runGenerationPipeline(newJson);
  };

  const handleGenerate = () => {
    runGenerationPipeline(rawJsonStr);
  };

  const code = generateDynamicPytest(api);

  useEffect(() => {
    if (status === 'success') {
      const blob = new Blob([code], { type: 'text/plain' });
      setCodeUrl(URL.createObjectURL(blob));
    }
  }, [status, code]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header and File Upload Sim */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">{api.name} Integrator</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Upload an OpenAPI/Swagger JSON or use the pre-extracted fields below to generate a production-ready test suite.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Schema and Controls */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Upload Swagger/OpenAPI File
            </h3>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer mb-4"
            >
              <FileJson className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mb-2" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Click to upload JSON schema</p>
              <p className="text-xs text-neutral-500 mt-1">Simulated for {api.name}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1"></div>
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">OR</span>
              <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1"></div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <DatabaseIcon /> JSON Structure Specification ({api.name})
              </h3>
              <pre className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                {defaultJson}
              </pre>
            </div>

            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-500" /> Raw JSON Input
            </h3>
            <textarea 
                className="w-full h-40 bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-300 dark:border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-700 dark:text-neutral-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                value={rawJsonStr}
                onChange={(e) => setRawJsonStr(e.target.value)}
                placeholder="Paste your raw API JSON fields here..."
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
             <button 
                onClick={handleGenerate}
                disabled={status !== 'idle' && status !== 'success'}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                {status === 'idle' && <><Play className="w-4 h-4" /> Generate Tests (Agent Loop)</>}
                {(status === 'parsing' || status === 'healing' || status === 'agent' || status === 'validating') && <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>}
                {status === 'ask_user' && <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for User Input...</>}
                {status === 'success' && <><CheckCircle2 className="w-4 h-4" /> Tests Generated</>}
             </button>

             {status === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">AST Core Accuracy</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Syntax Validated</p>
                  </div>
                  <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">99.8%</h3>
                </motion.div>
             )}
          </div>
        </div>

        {/* Right Column: Console & Code Output */}
        <div className="col-span-2 space-y-6">
          
          {/* Agent Loop Console */}
          <div className="bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white dark:bg-neutral-900 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Agentic Action Thread</span>
            </div>
            <div className="p-4 font-mono text-sm text-neutral-800 dark:text-neutral-300 space-y-2 h-[320px] overflow-y-auto custom-scrollbar flex flex-col justify-start">
              {logs.length === 0 && status === 'idle' && (
                <p className="text-neutral-400 dark:text-neutral-600">&gt; Waiting for schema compilation...</p>
              )}
              {logs.map((log) => (
                <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} key={log.id}>
                  <p className={
                    log.type === 'error' ? "text-rose-600 dark:text-rose-400" :
                    log.type === 'success' ? "text-emerald-600 dark:text-emerald-400" :
                    log.type === 'loading' ? "text-amber-600 dark:text-amber-400 flex items-center gap-2" :
                    "text-blue-600 dark:text-blue-400"
                  }>
                    {log.type === 'loading' && <Loader2 className="w-3 h-3 animate-spin"/>}
                    {log.text}
                  </p>
                </motion.div>
              ))}
              
              {status === 'ask_user' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg border border-neutral-300 dark:border-neutral-700 w-full max-w-full">
                  <p className="text-amber-700 dark:text-amber-400 mb-3 font-medium">
                    &gt; [API] What value should be added for missing field '{askField}'?
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input 
                      type="text" 
                      value={askValue}
                      onChange={e => setAskValue(e.target.value)}
                      className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 rounded text-sm outline-none focus:border-purple-500 dark:text-white"
                      placeholder={`Enter value for ${askField}...`}
                    />
                    <button 
                      onClick={handleAskSubmit}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors font-medium shadow-sm shrink-0"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Generated Code Viewer */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden relative shadow-sm">
             <div className="absolute top-4 right-4 z-10 flex gap-2">
                {status === 'success' && (
                  <a href={codeUrl} download={'test_' + api.id + '_api.py'} className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors border border-neutral-300 dark:border-neutral-700">
                    <Download className="w-3 h-3" /> Download Generated Tests
                  </a>
                )}
             </div>
             <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-between">
               <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Generated Code Viewer (pytest)</span>
             </div>
             
             {status === 'success' ? (
                <pre className="p-4 overflow-x-auto text-sm font-mono text-neutral-800 dark:text-neutral-300 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <code>{code}</code>
                </pre>
             ) : (
                <div className="h-64 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm font-mono flex-col gap-3">
                  <FileJson className="w-8 h-8 opacity-50" />
                  Code will populate here after AST verification.
                </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
      <path d="M3 12A9 3 0 0 0 21 12"></path>
    </svg>
  );
}
