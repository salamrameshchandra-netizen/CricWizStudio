import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { MatchLog } from '../types';

interface CSVImportProps {
  onImportComplete: (data: MatchLog[], detectedType: 'batsman' | 'bowler', playerName: string, playerStyle: string, playerTeam: string) => void;
}

export default function CSVImport({ onImportComplete }: CSVImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState<'batsman' | 'bowler'>('batsman');
  const [playerStyle, setPlayerStyle] = useState('Right-hand Bat');
  const [playerTeam, setPlayerTeam] = useState('My Local Club');
  
  const [parseStatus, setParseStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    parsedCount?: number;
    preview?: any[];
  }>({ status: 'idle', message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      // Attempt to auto-infer player type from file name or headers
      if (file.name.toLowerCase().includes('bowl') || file.name.toLowerCase().includes('wick')) {
        setPlayerType('bowler');
        setPlayerStyle('Right-arm Fast');
      } else if (file.name.toLowerCase().includes('bat') || file.name.toLowerCase().includes('run')) {
        setPlayerType('batsman');
        setPlayerStyle('Right-hand Bat');
      }
      // Infer player name from filename
      const inferredName = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[_-]/g, " ")    // Replace dash/under with space
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      setPlayerName(inferredName);
      
      triggerParse(text);
    };
    reader.readAsText(file);
  };

  const parseCSVString = (csv: string): { logs: MatchLog[], type: 'batsman' | 'bowler' } => {
    const lines = csv.split('\n').map(line => line.trim()).filter(line => line !== '');
    if (lines.length < 2) {
      throw new Error("CSV must include a header row and at least 1 statistical row.");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Auto-detect discipline type based on header occurrence
    let scoreType: 'batsman' | 'bowler' = 'batsman';
    if (headers.includes('overs') || headers.includes('runsconceded') || headers.includes('wickets')) {
      scoreType = 'bowler';
    }

    const logs: MatchLog[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(',').map(v => v.trim());
      // Handle commas inside fields if necessary (simple split works since they're basic numbers)
      const obj: any = { id: `csv-${Date.now()}-${i}` };
      
      headers.forEach((header, index) => {
        const val = currentline[index];
        if (val === undefined) return;

        // Map header key variations to match types
        if (header.includes('match') || header === 'no' || header === 'id') {
          // just optional serial, handle if needed
        } else if (header.includes('opponent') || header.includes('team') || header === 'vs') {
          obj.opponent = val;
        } else if (header.includes('date')) {
          obj.date = val;
        } else if (header === 'matchtype' || header === 'format' || header === 'match type' || header === 'type') {
          obj.matchType = val;
        } else if (header === 'runs' || header === 'runs scored' || header === 'r') {
          if (scoreType === 'batsman') obj.runs = Number(val) || 0;
          else obj.runsConceded = Number(val) || 0;
        } else if (header === 'runsconceded' || header === 'conceded' || header === 'rc') {
          obj.runsConceded = Number(val) || 0;
        } else if (header === 'balls' || header === 'balls faced' || header === 'bf' || header === 'b') {
          obj.balls = Number(val) || 0;
        } else if (header === 'fours' || header === '4s' || header === 'boundaryfour') {
          obj.fours = Number(val) || 0;
        } else if (header === 'sixes' || header === '6s' || header === 'boundarysix') {
          obj.sixes = Number(val) || 0;
        } else if (header === 'dismissed' || header === 'out' || header === 'wicket') {
          obj.dismissed = val.toLowerCase() === 'yes' || val.toLowerCase() === 'out' || val.toLowerCase() === 'true' || val === '1';
        } else if (header === 'overs' || header === 'o' || header === 'overs bowled') {
          obj.overs = Number(val) || 0;
        } else if (header === 'wickets' || header === 'wkt' || header === 'w') {
          obj.wickets = Number(val) || 0;
        } else if (header === 'maidens' || header === 'm' || header === 'maidens bowled') {
          obj.maidens = Number(val) || 0;
        } else if (header === 'dots' || header === 'dot balls' || header === 'd') {
          obj.dots = Number(val) || 0;
        }
      });

      // Assign default safety parameters
      if (!obj.opponent) obj.opponent = `Match ${i}`;
      if (!obj.date) obj.date = new Date(Date.now() - (lines.length - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (!obj.matchType) obj.matchType = 'T20';

      logs.push(obj as MatchLog);
    }

    return { logs, type: scoreType };
  };

  const triggerParse = (textToParse: string) => {
    try {
      const { logs, type } = parseCSVString(textToParse);
      setPlayerType(type);
      if (type === 'batsman' && playerStyle.includes('arm')) {
        setPlayerStyle('Right-hand Bat');
      } else if (type === 'bowler' && playerStyle.includes('Bat')) {
        setPlayerStyle('Right-arm Fast');
      }

      setParseStatus({
        status: 'success',
        message: `Successfully parsed cricket stats CSV with structural schema validation!`,
        parsedCount: logs.length,
        preview: logs.slice(0, 3)
      });
    } catch (err: any) {
      setParseStatus({
        status: 'error',
        message: err.message || 'Fatal formatting error parsing CSV values.'
      });
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim() !== '') {
      triggerParse(text);
    } else {
      setParseStatus({ status: 'idle', message: '' });
    }
  };

  const submitImport = () => {
    if (parseStatus.status !== 'success' || !playerName.trim()) {
      setParseStatus({
        status: 'error',
        message: 'Must input a player name and upload a valid, parsed CSV sheet.'
      });
      return;
    }

    try {
      const { logs, type } = parseCSVString(csvText);
      onImportComplete(
        logs,
        playerType,
        playerName.trim(),
        playerStyle,
        playerTeam.trim() || 'Club XI'
      );
      
      // Reset inputs
      setCsvText('');
      setPlayerName('');
      setParseStatus({ status: 'idle', message: '' });
    } catch (err: any) {
      setParseStatus({
        status: 'error',
        message: err.message || 'Fatal error submitting parser logs.'
      });
    }
  };

  const loadSampleCSV = (sampleType: 'batsman' | 'bowler') => {
    const batsmanSample = `Match,Opponent,Runs,Balls,Fours,Sixes,Dismissed,Date
1,Australia Group,52,38,6,2,yes,2026-05-10
2,South Africa,71,45,8,3,yes,2026-05-12
3,West Indies,104,65,11,5,no,2026-05-15
4,Sri Lanka,32,22,2,1,yes,2026-05-18`;

    const bowlerSample = `Match,Opponent,Overs,RunsConceded,Wickets,Maidens,Dots,Date
1,West Indies,4.0,24,2,0,10,2026-05-10
2,New Zealand,10.0,42,4,1,32,2026-05-13
3,England,8.0,21,3,2,26,2026-05-16
4,Bangladesh,9.0,35,1,0,22,2026-05-19`;

    const text = sampleType === 'batsman' ? batsmanSample : bowlerSample;
    setCsvText(text);
    setPlayerType(sampleType);
    setPlayerStyle(sampleType === 'batsman' ? 'Right-hand Bat' : 'Right-arm Leg Spin');
    
    // Capitalize type for sample name
    setPlayerName(`Sample Elite ${sampleType.charAt(0).toUpperCase() + sampleType.slice(1)}`);
    triggerParse(text);
  };

  const onDragToggle = (active: boolean) => {
    setDragActive(active);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-sm border border-slate-700/80 p-6 md:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display tracking-tight flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Bulk CSV Processing
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Drag files or paste inline scores to create an instant visual cricketer profile.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadSampleCSV('batsman')}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-800 rounded-lg hover:bg-indigo-900 hover:text-white transition-colors cursor-pointer"
          >
            Load Batsman CSV Temp
          </button>
          <button
            onClick={() => loadSampleCSV('bowler')}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-800 rounded-lg hover:bg-emerald-900 hover:text-white transition-colors cursor-pointer"
          >
            Load Bowler CSV Temp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Player Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 font-display">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            1. Player Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cricketer Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Babar Azam"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-750 border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-500 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discipline</label>
              <select
                value={playerType}
                onChange={(e) => {
                  const val = e.target.value as 'batsman' | 'bowler';
                  setPlayerType(val);
                  setPlayerStyle(val === 'batsman' ? 'Right-hand Bat' : 'Right-arm Fast');
                }}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Team Fr.</label>
              <input
                type="text"
                placeholder="e.g. Pakistan"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-500 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Playing Style</label>
            {playerType === 'batsman' ? (
              <select
                value={playerStyle}
                onChange={(e) => setPlayerStyle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="Right-hand Bat">Right-hand Bat</option>
                <option value="Left-hand Bat">Left-hand Bat</option>
                <option value="All-rounder (RHB)">All-rounder (RHB)</option>
              </select>
            ) : (
              <select
                value={playerStyle}
                onChange={(e) => setPlayerStyle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="Right-arm Fast">Right-arm Fast</option>
                <option value="Right-arm Medium">Right-arm Fast Medium</option>
                <option value="Right-arm Leg Spin">Right-arm Leg Spin</option>
                <option value="Right-arm Off Spin">Right-arm Off Spin</option>
                <option value="Left-arm Fast">Left-arm Fast</option>
                <option value="Left-arm Orthodox Spin">Left-arm Orthodox Spin</option>
              </select>
            )}
          </div>
        </div>

        {/* Middle/Right: File Import and Text Paste */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 font-display">
            <FileText className="w-4 h-4 text-slate-500" />
            2. Supply CSV Matches
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drag and Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 select-none ${
                dragActive
                  ? 'border-indigo-505 border-indigo-500 bg-indigo-950/40'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900 hover:bg-slate-850/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".csv,text/csv"
                className="hidden"
              />
              <div className="p-3 bg-slate-800 rounded-xl text-slate-400 border border-slate-700">
                <Upload className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Drag & Drop CSV sheet</p>
              <p className="text-xs text-slate-500">or click to browse local files</p>
            </div>

            {/* Paste Data Space */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-slate-300">Or Paste Raw CSV Values</label>
              <textarea
                rows={5}
                value={csvText}
                onChange={handlePasteChange}
                placeholder={`Match,Opponent,Runs,Balls,Fours,Sixes,Dismissed
1,Australia,55,30,6,2,yes
2,England,70,45,8,1,no`}
                className="w-full flex-grow p-3 border border-slate-700 bg-slate-900 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 placeholder-slate-650 placeholder-slate-600 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Validation Report */}
          {parseStatus.status !== 'idle' && (
            <div className={`p-4 rounded-xl border flex gap-3 ${
              parseStatus.status === 'success'
                ? 'bg-[#152e1f]/85 text-emerald-300 border-emerald-900/40'
                : 'bg-[#3b1517]/85 text-rose-300 border-rose-900/40'
            }`}>
              {parseStatus.status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 max-w-full overflow-hidden">
                <p className="text-sm font-semibold">{parseStatus.status === 'success' ? 'Structure Verified' : 'Formatting Critical Exception'}</p>
                <p className="text-xs text-opacity-90">{parseStatus.message}</p>
                {parseStatus.parsedCount && (
                  <div className="pt-2 text-[11px] flex gap-2 items-center text-slate-400">
                    <span className="font-bold text-slate-300">Detected:</span>
                    <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded-md uppercase font-semibold text-[10px] tracking-wider">
                      {playerType}
                    </span>
                    <span>•</span>
                    <span>Parsed {parseStatus.parsedCount} scoreboard entries.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={submitImport}
              disabled={parseStatus.status !== 'success' || !playerName.trim()}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 ${
                parseStatus.status === 'success' && playerName.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer hover:shadow hover:shadow-indigo-500/10'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Compile & Save Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
