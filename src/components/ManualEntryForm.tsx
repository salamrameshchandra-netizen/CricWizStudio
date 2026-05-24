import React, { useState } from 'react';
import { PlusCircle, ListPlus, Sparkles, Check, HelpCircle } from 'lucide-react';
import { Player, MatchLog } from '../types';

interface ManualEntryFormProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'shots' | 'deliveries'>) => void;
  onAddMatch: (playerId: string, match: MatchLog) => void;
}

export default function ManualEntryForm({ players, onAddPlayer, onAddMatch }: ManualEntryFormProps) {
  const [activeForm, setActiveForm] = useState<'player' | 'match'>('player');

  // New Player state
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('My Local Club');
  const [playerType, setPlayerType] = useState<'batsman' | 'bowler'>('batsman');
  const [playerStyle, setPlayerStyle] = useState('Right-hand Bat');
  const [playerRole, setPlayerRole] = useState<'batsman' | 'bowler' | 'allrounder'>('batsman');
  const [successMsg, setSuccessMsg] = useState('');

  // New Match Log state
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || '');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchType, setMatchType] = useState<'T20' | 'ODI' | 'Test' | string>('T20');
  
  // Batsman score state
  const [batRuns, setBatRuns] = useState<number | ''>('');
  const [batBalls, setBatBalls] = useState<number | ''>('');
  const [batFours, setBatFours] = useState<number | ''>('');
  const [batSixes, setBatSixes] = useState<number | ''>('');
  const [batDismissed, setBatDismissed] = useState<boolean>(true);

  // Bowler score state
  const [bowlOvers, setBowlOvers] = useState<number | ''>('');
  const [bowlRunsConceded, setBowlRunsConceded] = useState<number | ''>('');
  const [bowlWickets, setBowlWickets] = useState<number | ''>('');
  const [bowlMaidens, setBowlMaidens] = useState<number | ''>('');
  const [bowlDots, setBowlDots] = useState<number | ''>('');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    onAddPlayer({
      id: `p-${Date.now()}`,
      name: playerName.trim(),
      team: playerTeam.trim() || 'Local Club',
      role: playerRole,
      style: playerStyle,
      type: playerType,
      matches: []
    });

    setPlayerName('');
    showSuccess(`Registered ${playerName.trim()}! Go to the "Add Match" tab to insert scores.`);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || !opponent.trim()) return;

    const matchObj: any = {
      id: `m-${Date.now()}`,
      opponent: opponent.trim(),
      date,
      matchType,
    };

    if (selectedPlayer?.type === 'batsman') {
      matchObj.runs = Number(batRuns) || 0;
      matchObj.balls = Number(batBalls) || 0;
      matchObj.fours = Number(batFours) || 0;
      matchObj.sixes = Number(batSixes) || 0;
      matchObj.dismissed = batDismissed;
    } else {
      matchObj.overs = Number(bowlOvers) || 0;
      matchObj.runsConceded = Number(bowlRunsConceded) || 0;
      matchObj.wickets = Number(bowlWickets) || 0;
      matchObj.maidens = Number(bowlMaidens) || 0;
      matchObj.dots = Number(bowlDots) || 0;
    }

    onAddMatch(selectedPlayerId, matchObj as MatchLog);

    // Reset match inputs
    setOpponent('');
    setBatRuns('');
    setBatBalls('');
    setBatFours('');
    setBatSixes('');
    setBowlOvers('');
    setBowlRunsConceded('');
    setBowlWickets('');
    setBowlMaidens('');
    setBowlDots('');

    showSuccess(`Saved score metrics for ${selectedPlayer?.name}!`);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-sm border border-slate-700/80 p-6 md:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display tracking-tight flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            Manual Stat Registry
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Add new player profiles or append historical match scorecard information manually.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex bg-slate-900 p-0.5 rounded-lg text-xs self-start md:self-auto border border-slate-800">
          <button
            onClick={() => setActiveForm('player')}
            className={`px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeForm === 'player' ? 'bg-[#1e293b] text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Player
          </button>
          <button
            onClick={() => {
              setActiveForm('match');
              if (players.length > 0 && !selectedPlayerId) {
                setSelectedPlayerId(players[0].id);
              }
            }}
            className={`px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeForm === 'match' ? 'bg-[#1e293b] text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            Append Match Score
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/45 border border-emerald-900/40 text-emerald-400 rounded-xl p-4 flex items-center gap-2 text-sm animate-fade-in font-medium">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeForm === 'player' ? (
        /* Form 1: Create Player Profile */
        <form onSubmit={handleCreatePlayer} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Player Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jasprit Bumrah"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-500 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Club / Country Team</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-500 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cricketer Specialty Type</label>
              <select
                value={playerType}
                onChange={(e) => {
                  const val = e.target.value as 'batsman' | 'bowler';
                  setPlayerType(val);
                  setPlayerStyle(val === 'batsman' ? 'Right-hand Bat' : 'Right-arm Fast');
                  setPlayerRole(val === 'batsman' ? 'batsman' : 'bowler');
                }}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              >
                <option value="batsman">Batsman (Boundary and runs analysis)</option>
                <option value="bowler">Bowler (Bounce lengths / Pitch landing heatmaps)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Overall Team Role</label>
              <select
                value={playerRole}
                onChange={(e: any) => setPlayerRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-Rounder</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Batting / Bowling Stance Style</label>
              {playerType === 'batsman' ? (
                <select
                  value={playerStyle}
                  onChange={(e) => setPlayerStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
                >
                  <option value="Right-hand Bat">Right-hand Bat</option>
                  <option value="Left-hand Bat">Left-hand Bat</option>
                </select>
              ) : (
                <select
                  value={playerStyle}
                  onChange={(e) => setPlayerStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
                >
                  <option value="Right-arm Fast">Right-arm Fast</option>
                  <option value="Right-arm Fast Medium">Right-arm Fast Medium</option>
                  <option value="Right-arm Leg Spin">Right-arm Leg Spin</option>
                  <option value="Right-arm Off Spin">Right-arm Off Spin</option>
                  <option value="Left-arm Fast">Left-arm Fast</option>
                  <option value="Left-arm Orthodox Spin">Left-arm Orthodox Spin</option>
                  <option value="Left-arm Chinaman Spin">Left-arm Chinaman Spin</option>
                </select>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow hover:shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Save Profile Card
          </button>
        </form>
      ) : (
        /* Form 2: Append Match Scorecard */
        <form onSubmit={handleCreateMatch} className="space-y-6">
          {players.length === 0 ? (
            <div className="p-6 text-center border rounded-xl bg-slate-900 border-slate-850 border-slate-800 text-slate-500">
              Please register a player profile card before appending statistical matchups.
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Player</label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 font-semibold"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Opponent Team</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-500 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Match Type</label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 font-semibold"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test Match</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Match Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-100"
                  />
                </div>
              </div>

              {selectedPlayer?.type === 'batsman' ? (
                /* Batsman match input metrics */
                <div className="space-y-4">
                  <h4 className="font-semibold text-indigo-400 text-xs uppercase tracking-wider pb-1 border-b border-slate-700">
                    Batting Score Details (Runs / boundary count)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Runs Scored</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 56"
                        value={batRuns}
                        onChange={(e) => setBatRuns(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Balls Faced</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 40"
                        value={batBalls}
                        onChange={(e) => setBatBalls(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Fours (4s)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="4"
                        value={batFours}
                        onChange={(e) => setBatFours(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Sixes (6s)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="1"
                        value={batSixes}
                        onChange={(e) => setBatSixes(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="dismissed"
                      checked={batDismissed}
                      onChange={(e) => setBatDismissed(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-700 bg-slate-900"
                    />
                    <label htmlFor="dismissed" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Batsman was dismissed (used to calculate average accurately)
                    </label>
                  </div>
                </div>
              ) : (
                /* Bowler match input metrics */
                <div className="space-y-4">
                  <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider pb-1 border-b border-slate-700">
                    Bowling Score Details (Runs / wickets economy)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Overs Bowled</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="4.0"
                        value={bowlOvers}
                        onChange={(e) => setBowlOvers(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Runs Conceded</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="24"
                        value={bowlRunsConceded}
                        onChange={(e) => setBowlRunsConceded(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Wickets Taken</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="2"
                        value={bowlWickets}
                        onChange={(e) => setBowlWickets(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Maidens Bowled</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={bowlMaidens}
                        onChange={(e) => setBowlMaidens(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Dot Deliveries</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="12"
                        value={bowlDots}
                        onChange={(e) => setBowlDots(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow hover:shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Commit Match Statistics
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
