import { useState, useEffect, FormEvent } from 'react';
import {
  Sparkles,
  Users,
  TrendingUp,
  Sliders,
  Play,
  Share2,
  Trash2,
  PlusCircle,
  FolderSync,
  Printer,
  FileSpreadsheet,
  GraduationCap,
  History,
  X,
  Plus,
  Edit3
} from 'lucide-react';

import { INITIAL_PLAYERS } from './data';
import { Player, MatchLog, ShotLocation, DeliveryLocation } from './types';
import MatchTrends from './components/MatchTrends';
import AIScoutingInsight from './components/AIScoutingInsight';
import CSVImport from './components/CSVImport';
import ManualEntryForm from './components/ManualEntryForm';
import PlayerCompare from './components/PlayerCompare';
import UserGuide from './components/UserGuide';

export default function App() {
  // Persistence using standard localStorage supporting offline-first operations
  const [players, setPlayers] = useState<Player[]>(() => {
    const cached = localStorage.getItem('cricket_vz_players');
    return cached ? JSON.parse(cached) : INITIAL_PLAYERS;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'compare' | 'import' | 'manual' | 'guide'>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(() => players[0]?.id || '');
  const [analyticSubTab, setAnalyticSubTab] = useState<'trends' | 'scout'>('trends');
  const [dashboardMatchType, setDashboardMatchType] = useState<string>('All');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const activeAnalyticTab = analyticSubTab;

  useEffect(() => {
    localStorage.setItem('cricket_vz_players', JSON.stringify(players));
    if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  // Player creation and manipulation state overrides
  const handleAddPlayer = (newPlayer: Omit<Player, 'shots' | 'deliveries'>) => {
    const fullPlayer: Player = {
      ...newPlayer,
      shots: [],
      deliveries: []
    };
    setPlayers(prev => [fullPlayer, ...prev]);
    setSelectedPlayerId(fullPlayer.id);
    setActiveTab('dashboard');
  };

  const handleAddMatch = (playerId: string, match: MatchLog) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          matches: [...p.matches, match]
        };
      }
      return p;
    }));
  };

  const handleImportCSVData = (
    logs: MatchLog[],
    detectedType: 'batsman' | 'bowler',
    playerName: string,
    playerStyle: string,
    playerTeam: string
  ) => {
    const newPlayer: Player = {
      id: `csv-p-${Date.now()}`,
      name: playerName,
      team: playerTeam,
      role: detectedType === 'batsman' ? 'batsman' : 'bowler',
      style: playerStyle,
      type: detectedType,
      matches: logs,
      shots: [],
      deliveries: []
    };

    setPlayers(prev => [newPlayer, ...prev]);
    setSelectedPlayerId(newPlayer.id);
    setActiveTab('dashboard');
  };

  const handleDeletePlayer = (id: string) => {
    const filtered = players.filter(p => p.id !== id);
    setPlayers(filtered);
    if (id === selectedPlayerId && filtered.length > 0) {
      setSelectedPlayerId(filtered[0].id);
    } else if (filtered.length === 0) {
      setSelectedPlayerId('');
    }
  };

  const handleDeleteMatchRow = (matchId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerId) {
        return {
          ...p,
          matches: p.matches.filter(m => m.id !== matchId)
        };
      }
      return p;
    }));
  };

  const handleClearAllData = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Clear All Datasets",
      message: "Are you sure you want to completely clear all preloaded and custom cricketer dataset profiles? This action cannot be undone.",
      onConfirm: () => {
        setPlayers([]);
        setSelectedPlayerId('');
        localStorage.setItem('cricket_vz_players', JSON.stringify([]));
        setConfirmConfig(null);
      }
    });
  };

  const handleResetToPreloaded = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Restore Elite Datasets",
      message: "Do you want to restore the preloaded elite cricketer datasets (Kohli, Rohit, Bumrah, Rashid)?",
      onConfirm: () => {
        setPlayers(INITIAL_PLAYERS);
        setSelectedPlayerId(INITIAL_PLAYERS[0].id);
        localStorage.setItem('cricket_vz_players', JSON.stringify(INITIAL_PLAYERS));
        setConfirmConfig(null);
      }
    });
  };

  // Edit player states
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerTeam, setEditPlayerTeam] = useState('');
  const [editPlayerRole, setEditPlayerRole] = useState<'batsman' | 'bowler' | 'allrounder'>('batsman');
  const [editPlayerStyle, setEditPlayerStyle] = useState('');
  const [editPlayerType, setEditPlayerType] = useState<'batsman' | 'bowler'>('batsman');

  // Reusable custom confirm confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleStartEditPlayer = () => {
    if (!selectedPlayer) return;
    setEditPlayerName(selectedPlayer.name);
    setEditPlayerTeam(selectedPlayer.team);
    setEditPlayerRole(selectedPlayer.role);
    setEditPlayerStyle(selectedPlayer.style);
    setEditPlayerType(selectedPlayer.type);
    setIsEditingPlayer(true);
  };

  const handleSaveEditPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (!editPlayerName.trim()) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerId) {
        return {
          ...p,
          name: editPlayerName.trim(),
          team: editPlayerTeam.trim() || 'Club',
          role: editPlayerRole,
          style: editPlayerStyle.trim(),
          type: editPlayerType
        };
      }
      return p;
    }));

    setIsEditingPlayer(false);
  };

  const handleInteractiveAddShot = (shot: Omit<ShotLocation, 'id'>) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerId) {
        const newShot: ShotLocation = {
          id: `shot-${Date.now()}`,
          ...shot
        };
        return {
          ...p,
          shots: [...p.shots, newShot]
        };
      }
      return p;
    }));
  };

  const handleInteractiveAddDelivery = (del: Omit<DeliveryLocation, 'id'>) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerId) {
        const newDel: DeliveryLocation = {
          id: `del-${Date.now()}`,
          ...del
        };
        return {
          ...p,
          deliveries: [...p.deliveries, newDel]
        };
      }
      return p;
    }));
  };

  // Aggregated score math
  const getOverallStats = (p: Player) => {
    if (!p || !p.matches) return null;
    const isBat = p.type === 'batsman';

    if (isBat) {
      const totMatches = p.matches.length;
      const totRuns = p.matches.reduce((acc, m) => acc + (Number(m.runs) || 0), 0);
      const ballsFaced = p.matches.reduce((acc, m) => acc + (Number(m.balls) || 0), 0);
      const Outs = p.matches.filter(m => Boolean(m.dismissed) && String(m.dismissed) !== 'false' && String(m.dismissed) !== 'no').length;
      const avg = Outs > 0 ? (totRuns / Outs).toFixed(2) : totRuns.toFixed(2);
      const sr = ballsFaced > 0 ? ((totRuns / ballsFaced) * 100).toFixed(1) : "0.0";
      const highscore = totMatches > 0 ? Math.max(...p.matches.map(m => Number(m.runs) || 0)) : 0;
      const fours = p.matches.reduce((acc, m) => acc + (Number(m.fours) || 0), 0);
      const sixes = p.matches.reduce((acc, m) => acc + (Number(m.sixes) || 0), 0);

      return { totMatches, totRuns, ballsFaced, avg, sr, highscore, fours, sixes };
    } else {
      const totMatches = p.matches.length;
      const oversBowled = p.matches.reduce((acc, m) => acc + (Number(m.overs) || 0), 0);
      const runsConceded = p.matches.reduce((acc, m) => acc + (Number(m.runsConceded) || Number(m.runs) || 0), 0);
      const wickets = p.matches.reduce((acc, m) => acc + (Number(m.wickets) || 0), 0);
      const econ = oversBowled > 0 ? (runsConceded / oversBowled).toFixed(2) : "0.00";
      const maidens = p.matches.reduce((acc, m) => acc + (Number(m.maidens) || 0), 0);
      const dots = p.matches.reduce((acc, m) => acc + (Number(m.dots) || 0), 0);
      const avg = wickets > 0 ? (runsConceded / wickets).toFixed(2) : "N/A";

      return { totMatches, oversBowled, runsConceded, wickets, econ, maidens, dots, avg };
    }
  };

  const summaryStats = selectedPlayer ? getOverallStats(selectedPlayer) : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-12 antialiased print:bg-white print:text-slate-950 print:pb-0">
      
      {/* ────────────────────────────────────────────────────────
          PRINT-ONLY ELEMENT : Fits pristine A4 PDF layout
          ──────────────────────────────────────────────────────── */}
      {selectedPlayer && summaryStats && (
        <div className="hidden print:block bg-white p-12 text-slate-950 font-sans min-h-screen leading-relaxed">
          <div className="flex justify-between items-center border-b-4 border-slate-900 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950">CRICKETER SCOUT PERFORMANCE REPORT</h1>
              <p className="text-xs text-slate-500 font-mono tracking-wider">OFFICIAL RECONNAISSANCE GRID • GENERATED RECORD SUMMARY</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 border border-slate-300 uppercase tracking-widest font-mono">
                {selectedPlayer.team}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Profile Details</span>
              <h2 className="text-2xl font-black text-slate-900">{selectedPlayer.name}</h2>
              <p className="text-sm font-semibold text-indigo-700 uppercase">Specialty: {selectedPlayer.role} ({selectedPlayer.style})</p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Aggregate Historical Averages</span>
              {selectedPlayer.type === 'batsman' ? (
                <div className="grid grid-cols-3 text-center">
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).totRuns}</div>
                    <div className="text-[10px] text-slate-500">runs</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).avg}</div>
                    <div className="text-[10px] text-slate-500">average</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).sr}</div>
                    <div className="text-[10px] text-slate-500">strike rate</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 text-center">
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).wickets}</div>
                    <div className="text-[10px] text-slate-500">wickets</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).econ}</div>
                    <div className="text-[10px] text-slate-500">economy</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900">{(summaryStats as any).avg}</div>
                    <div className="text-[10px] text-slate-500">bow avg</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historical Innings Log Table */}
          <div className="space-y-2 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b pb-1">INNINGS STATISTICS LOG SUMMARY</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2 px-3 font-mono font-bold">Opponent</th>
                  <th className="py-2 px-3 font-mono font-bold">Format</th>
                  <th className="py-2 px-3 font-mono font-bold">Date</th>
                  {selectedPlayer.type === 'batsman' ? (
                    <>
                      <th className="py-2 px-3 font-mono font-bold text-center">Runs</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Balls</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Strike Rate</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Dismissed</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 px-3 font-mono font-bold text-center">Overs</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Runs Conc</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Wickets</th>
                      <th className="py-2 px-3 font-mono font-bold text-center">Econ</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {selectedPlayer.matches.map((m) => (
                  <tr key={m.id} className="border-b border-slate-200">
                    <td className="py-2.5 px-3 font-semibold">{m.opponent}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{m.matchType || 'T20'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.date}</td>
                    {selectedPlayer.type === 'batsman' ? (
                      <>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{m.runs}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700">{m.balls}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">{m.balls ? ((m.runs! / m.balls!) * 100).toFixed(1) : '–'}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{m.dismissed ? 'Yes' : 'Not Out'}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{m.overs}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700">{m.runsConceded || m.runs}</td>
                        <td className="py-2.5 px-3 text-center font-black text-emerald-800">{m.wickets}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">{m.overs ? (((m.runsConceded || m.runs!) / m.overs!)).toFixed(2) : '–'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Radar details */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-300">
            <div>
              <p className="text-sm font-semibold text-slate-800">Scouting Intelligence Summary Reference</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This report converts historical batsman and bowler match score progressions. Pitch coordinates representing bowl line and length delivery coordinates or aggregated batting statistics represent comprehensive player performance parameters. Save or print this document in A4 layout directly to trace trends.
              </p>
            </div>
            <div className="border-l pl-6 space-y-1 text-xs">
              <p className="font-mono text-slate-700">REPORT COMPILE TIME: {new Date().toISOString().split('T')[0]}</p>
              <p className="font-mono text-slate-700">DATASET ORIGIN: PERSISTED COMPANION BOARD</p>
              <p className="font-mono text-indigo-700 font-bold">DIGITAL SIGNATURE CONFIRMED</p>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MAIN SCREEN UI
          ──────────────────────────────────────────────────────── */}
      <div className="print:hidden">
        
        {/* Main top sticky navbar menu */}
        <header className="sticky top-0 z-50 bg-[#1e293b]/90 border-b border-slate-700/80 shadow-md backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-505 to-indigo-700 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/10">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">CricViz Studio <span className="text-indigo-400 text-sm font-normal ml-1">v2.4.0</span></h1>
                <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">Professional Player Analytics</p>
              </div>
            </div>

            {/* Menu Buttons */}
            <nav className="flex items-center overflow-x-auto gap-1 gap-2 border-t pt-3 sm:pt-0 sm:border-t-0 border-slate-700/60 scrollbar-none font-semibold text-xs text-slate-300">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Playground
              </button>
              
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === 'compare' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Compare stats
              </button>

              <button
                onClick={() => setActiveTab('import')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === 'import' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV Bulk Import
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === 'manual' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Add profiles
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                  activeTab === 'guide' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                How to Use / Guide
              </button>
            </nav>
          </div>
        </header>

        {/* Global Dataset Utilities strip */}
        <section className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <span className="font-mono text-[10px] tracking-wider font-semibold">
              CURRENT LOAD: {players.length} CRICKETER DATASETS Persisted
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetToPreloaded}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Loads standard demo players if you cleared or edited them"
              >
                <FolderSync className="w-3.5 h-3.5" />
                Restore Preloaded Elite Datasets
              </button>
              <span className="text-slate-600 px-1">|</span>
              <button
                onClick={handleClearAllData}
                className="text-rose-400 hover:text-rose-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Preloaded Data & Wipe State
              </button>
            </div>
          </div>
        </section>

        {/* Main tabs containers */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          
          {activeTab === 'guide' && (
            <UserGuide />
          )}

          {activeTab === 'import' && (
            <CSVImport onImportComplete={handleImportCSVData} />
          )}

          {activeTab === 'manual' && (
            <ManualEntryForm
              players={players}
              onAddPlayer={handleAddPlayer}
              onAddMatch={handleAddMatch}
            />
          )}

          {activeTab === 'compare' && (
            <PlayerCompare players={players} />
          )}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* LEFT PROFILE SIDEBAR: Player selecter */}
              <div className="space-y-6">
                <div className="bg-[#1e293b] rounded-2xl border border-slate-700/80 p-4.5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 font-display">
                    Cricketer Profiles
                  </h3>

                  {players.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
                      No active players. Import via CSV or insert stats manually!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                      {players.map((p) => {
                        const active = p.id === selectedPlayerId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className={`group w-full p-3 rounded-xl text-left transition-all border flex justify-between items-center cursor-pointer ${
                              active
                                ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                                : 'bg-[#0f172a] border-slate-800/85 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <h4 className="text-sm font-bold truncate text-slate-100">{p.name}</h4>
                              <p className={`text-[10px] mt-0.5 uppercase tracking-wide flex items-center gap-1.5 ${
                                active ? 'text-indigo-200' : 'text-slate-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${p.type === 'batsman' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                {p.role} • {p.team}
                              </p>
                            </div>
                            
                            {/* Delete specific items */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmConfig({
                                  isOpen: true,
                                  title: "Delete Cricketer Profile",
                                  message: `Are you sure you want to delete ${p.name}'s profile from the system?`,
                                  onConfirm: () => {
                                    handleDeletePlayer(p.id);
                                    setConfirmConfig(null);
                                  }
                                });
                              }}
                              className={`p-1 rounded opacity-70 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-rose-850/30 hover:text-rose-400 transition-all cursor-pointer ${
                                active ? 'text-white/80 lg:group-hover:opacity-100 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:text-rose-400'
                              }`}
                              title="Delete player"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('manual')}
                    className="w-full py-2 bg-slate-900/60 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center border border-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register New Profile
                  </button>
                </div>
              </div>

              {/* RIGHT CONTENT DISPLAY: Selected Player Analytics */}
              <div className="lg:col-span-3 space-y-6">
                {!selectedPlayer ? (
                  <div className="bg-[#1e293b] rounded-3xl p-12 text-center text-slate-400 border border-slate-700/80 space-y-2">
                    <Users className="w-12 h-12 mx-auto text-slate-500" />
                    <p className="text-sm font-semibold">Cricketer List Empty</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Delete preloaded data has been triggered. Clear state to register your custom batsman or bowlers.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button onClick={handleResetToPreloaded} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold font-sans uppercase">
                        Load Demoplayers
                      </button>
                      <button onClick={() => setActiveTab('manual')} className="px-4 py-2 bg-slate-800 text-slate-205 hover:bg-slate-700 rounded-xl text-xs font-bold font-sans uppercase border border-slate-700">
                        Add Player
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* TOP Quick Instructions Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 border border-slate-700/80 px-5 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-350">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">💡</span>
                        <div>
                          <span className="font-bold text-slate-200 font-display">Need CSV blueprints or mapping guidance?</span> We have added a full instructions checklist!
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('guide')}
                        className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors text-right flex items-center gap-1 cursor-pointer whitespace-nowrap self-end sm:self-auto uppercase tracking-wider text-[10px]"
                      >
                        Open How to Use →
                      </button>
                    </div>
                    
                    {/* TOP Player Title banner with inline print triggers */}
                    <div className="bg-[#1e293b] rounded-2xl border border-slate-700/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold text-indigo-400 bg-indigo-950/45 border border-indigo-900/40 tracking-wider">
                            {selectedPlayer.team}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold text-slate-350 bg-slate-900 border border-slate-800 tracking-wider">
                            {selectedPlayer.type === 'batsman' ? 'BATSMAN DISCIPLINE' : 'BOWLER DISCIPLINE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black tracking-tight text-slate-100 font-sans uppercase">
                            {selectedPlayer.name}
                          </h2>
                          <button
                            onClick={handleStartEditPlayer}
                            className="p-1 px-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase"
                            title="Edit cricketer profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-400">
                          Specialty: {selectedPlayer.style} ({selectedPlayer.role})
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                          {/* Direct Print as PDF summary */}
                          <div className="relative group">
                            <button
                              onClick={() => window.print()}
                              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer bg-slate-900"
                            >
                              <Printer className="w-4 h-4 text-slate-400" />
                              Export PDF Summary
                            </button>
                            
                            {/* Hover Print Tip Assistance */}
                            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-slate-300 leading-relaxed font-sans">
                              <p className="font-bold text-indigo-400 mb-1">🖨️ PDF Export Guide</p>
                              If inside AI Studio's live frame preview, direct printing is blocked by browser policies. Open this page in a <strong className="text-white">new tab (standalone url)</strong> using the top-right button, then click export to save a clean, high-contrast, double-column A4 scout dossier!
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setActiveTab('compare')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-indigo-400/40"
                          >
                            <Share2 className="w-4 h-4" />
                            Compare head-to-head
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 italic">
                          *Iframe block? Open standalone url for full print compatibility.
                        </span>
                      </div>
                    </div>

                    {/* Overall statistical scorecard overview blocks */}
                    {summaryStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedPlayer.type === 'batsman' ? (
                          <>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Inning runs</span>
                              <span className="text-2xl font-black text-slate-100">{(summaryStats as any).totRuns}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{(summaryStats as any).ballsFaced} balls faced</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Batting Average</span>
                              <span className="text-2xl font-black text-indigo-400 font-mono">{(summaryStats as any).avg}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">runs/dismissal</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Strike Rate %</span>
                              <span className="text-2xl font-black text-slate-100">{(summaryStats as any).sr}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">runs/100 balls</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Boundaries</span>
                              <span className="text-xl font-black text-slate-100">{(summaryStats as any).fours} <span className="text-slate-450 text-xs">4s</span> • {(summaryStats as any).sixes} <span className="text-indigo-400 text-xs font-bold">6s</span></span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">High Score: {(summaryStats as any).highscore}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overs Bowled</span>
                              <span className="text-2xl font-black text-slate-100">{(summaryStats as any).oversBowled}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{(summaryStats as any).runsConceded} runs conceded</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wickets Taken</span>
                              <span className="text-2xl font-black text-emerald-400">{(summaryStats as any).wickets}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Bowling Avg: {(summaryStats as any).avg}</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Economy Rate</span>
                              <span className="text-2xl font-black text-indigo-400 font-mono">{(summaryStats as any).econ}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">runs conceded / over</span>
                            </div>
                            <div className="bg-[#1e293b] border border-slate-700/80 text-center p-4 rounded-xl shadow-sm">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dots & Maidens</span>
                              <span className="text-xl font-black text-slate-100">{(summaryStats as any).dots} d • {(summaryStats as any).maidens} m</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">dot pressure analysis</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Detailed Visualizations Tab switches */}
                    <div className="space-y-4">
                      
                      <div className="flex border-b border-slate-800 gap-1 text-sm font-semibold text-slate-400">
                        <button
                          onClick={() => setAnalyticSubTab('trends')}
                          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                            activeAnalyticTab === 'trends'
                              ? 'border-indigo-500 text-indigo-400 font-bold'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Performance Trend Analysis
                        </button>

                        <button
                          onClick={() => setAnalyticSubTab('scout')}
                          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                            activeAnalyticTab === 'scout'
                              ? 'border-indigo-500 text-indigo-400 font-bold'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          Scouting AI commentary
                        </button>
                      </div>

                      <div>
                        {activeAnalyticTab === 'scout' && (
                          <AIScoutingInsight player={selectedPlayer} />
                        )}

                        {activeAnalyticTab === 'trends' && (
                          <MatchTrends matches={selectedPlayer.matches} playerType={selectedPlayer.type} />
                        )}
                      </div>
                    </div>

                    {/* Innings Log history editor */}
                    <div className="bg-[#1e293b] rounded-2xl border border-slate-700/80 p-5 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 border-slate-700">
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5 font-display">
                            <History className="w-4 h-4 text-indigo-400" />
                            Historical Innings Database Logs
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            Logged scorecard statistics & formats
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Format:</span>
                          <select
                            value={dashboardMatchType}
                            onChange={(e) => setDashboardMatchType(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg text-xs py-1 px-2.5 text-slate-200 focus:outline-[#6366f1] font-bold cursor-pointer"
                          >
                            <option value="All">All Formats</option>
                            <option value="T20">T20</option>
                            <option value="ODI">ODI</option>
                            <option value="Test">Test Match</option>
                          </select>
                        </div>
                      </div>

                      {(() => {
                        const displayedMatches = selectedPlayer.matches.filter(m => {
                          if (dashboardMatchType === 'All') return true;
                          return m.matchType === dashboardMatchType;
                        });

                        return displayedMatches.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-500 italic">
                            No {dashboardMatchType !== 'All' ? `${dashboardMatchType} ` : ''}matches recorded on profile log yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto select-none">
                            <table className="w-full text-xs text-left text-slate-400 border-collapse">
                              <thead>
                                <tr className="border-b border-slate-700 uppercase font-bold text-slate-400 bg-slate-900/60 text-[10px]">
                                  <th className="py-2.5 px-3 text-slate-300">Opponent</th>
                                  <th className="py-2.5 px-3 text-slate-300 text-center">Format</th>
                                  <th className="py-2.5 px-3 text-slate-300">Date</th>
                                  {selectedPlayer.type === 'batsman' ? (
                                    <>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Runs</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Faced (b)</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Fours (4s)</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Sixes (6s)</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Out Status</th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Overs</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Runs Con</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Tickets (W)</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Maidens</th>
                                      <th className="py-2.5 px-3 text-center text-slate-300">Dots</th>
                                    </>
                                  )}
                                  <th className="py-2.5 px-3 text-center text-slate-300">Remove</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayedMatches.map((m) => (
                                  <tr key={m.id} className="border-b border-slate-700/60 hover:bg-slate-800/40 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-200 font-bold">{m.opponent}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/60 text-indigo-400 border border-slate-800">
                                        {m.matchType || 'T20'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{m.date}</td>
                                    {selectedPlayer.type === 'batsman' ? (
                                      <>
                                        <td className="py-2.5 px-3 text-center font-bold text-indigo-400">{m.runs}</td>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.balls}</td>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.fours}</td>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.sixes}</td>
                                        <td className="py-2.5 px-3 text-center">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            m.dismissed ? 'bg-rose-950/40 text-rose-400 border border-rose-900/10' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/10'
                                          }`}>
                                            {m.dismissed ? 'Dismissed' : 'Not out'}
                                          </span>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.overs}</td>
                                        <td className="py-2.5 px-3 text-center text-rose-400 font-semibold">{m.runsConceded || m.runs}</td>
                                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-400">{m.wickets}</td>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.maidens}</td>
                                        <td className="py-2.5 px-3 text-center text-slate-300">{m.dots}</td>
                                      </>
                                    )}
                                    <td className="py-2.5 px-3 text-center">
                                      <button
                                        onClick={() => handleDeleteMatchRow(m.id)}
                                        className="p-1 rounded text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all cursor-pointer"
                                        title="Delete Row Match"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {isEditingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-700/85 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-left">
            <button
              onClick={() => setIsEditingPlayer(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Cricketer Profile Info
              </h3>
              <p className="text-xs text-slate-400">
                Update name, country/team, and primary specialty for this loaded competitor.
              </p>
            </div>

            <form onSubmit={handleSaveEditPlayer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Player Name</label>
                <input
                  type="text"
                  required
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-500"
                  placeholder="e.g. Virat Kohli"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Team/Country Name</label>
                <input
                  type="text"
                  required
                  value={editPlayerTeam}
                  onChange={(e) => setEditPlayerTeam(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-500"
                  placeholder="e.g. India"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Discipline Type</label>
                  <select
                    value={editPlayerType}
                    onChange={(e) => setEditPlayerType(e.target.value as 'batsman' | 'bowler')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-550"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Cricketer Role</label>
                  <select
                    value={editPlayerRole}
                    onChange={(e) => setEditPlayerRole(e.target.value as 'batsman' | 'bowler' | 'allrounder')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-550"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="allrounder">All-Rounder</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Bowling / Batting Style</label>
                <input
                  type="text"
                  required
                  value={editPlayerStyle}
                  onChange={(e) => setEditPlayerStyle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-500"
                  placeholder="e.g. Right-hand Bat / Right-arm leg break"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPlayer(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-indigo-500/50 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmConfig?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#1e293b] border border-slate-700/85 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wide font-display border-b border-slate-800 pb-2">
              {confirmConfig.title}
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              {confirmConfig.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmConfig(null)}
                className="flex-1 px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmConfig.onConfirm();
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-indigo-550/50 cursor-pointer"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
