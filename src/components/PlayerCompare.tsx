import { useState } from 'react';
import { Share2, Users, Trophy, Percent, Swords, Check, Copy, BarChart3, Star, Zap } from 'lucide-react';
import { Player } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PlayerCompareProps {
  players: Player[];
}

export default function PlayerCompare({ players }: PlayerCompareProps) {
  const [player1Id, setPlayer1Id] = useState(players[0]?.id || '');
  const [player2Id, setPlayer2Id] = useState(players[1]?.id || '');
  const [shareFeedback, setShareFeedback] = useState(false);
  const [chartMode, setChartMode] = useState<'runs' | 'rates' | 'boundaries' | 'bowling'>('runs');

  const player1 = players.find(p => p.id === player1Id);
  const player2 = players.find(p => p.id === player2Id);

  if (players.length < 2) {
    return (
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 text-center text-slate-450 text-slate-400 font-sans">
        Register at least two player profile cards to trigger head-to-head comparison parameters.
      </div>
    );
  }

  // Calculate Batting aggregate indices
  const getBattingSummary = (p: Player) => {
    const totalRuns = p.matches.reduce((acc, m) => acc + (Number(m.runs) || 0), 0);
    const totalBalls = p.matches.reduce((acc, m) => acc + (Number(m.balls) || 0), 0);
    const outs = p.matches.filter(m => Boolean(m.dismissed) && String(m.dismissed) !== 'false' && String(m.dismissed) !== 'no').length;
    const battingAvg = outs > 0 ? parseFloat((totalRuns / outs).toFixed(2)) : totalRuns;
    const strikeRate = totalBalls > 0 ? parseFloat(((totalRuns / totalBalls) * 100).toFixed(1)) : 0;
    const highscore = p.matches.length > 0 ? Math.max(...p.matches.map(m => Number(m.runs) || 0)) : 0;
    const fours = p.matches.reduce((acc, m) => acc + (Number(m.fours) || 0), 0);
    const sixes = p.matches.reduce((acc, m) => acc + (Number(m.sixes) || 0), 0);

    return { totalRuns, battingAvg, strikeRate, highscore, fours, sixes, outs };
  };

  // Calculate Bowling aggregate indices
  const getBowlingSummary = (p: Player) => {
    const totalOvers = p.matches.reduce((acc, m) => acc + (Number(m.overs) || 0), 0);
    const runsConceded = p.matches.reduce((acc, m) => acc + (Number(m.runsConceded) || Number(m.runs) || 0), 0);
    const totalWickets = p.matches.reduce((acc, m) => acc + (Number(m.wickets) || 0), 0);
    const economy = totalOvers > 0 ? parseFloat((runsConceded / totalOvers).toFixed(2)) : 0;
    const maidens = p.matches.reduce((acc, m) => acc + (Number(m.maidens) || 0), 0);
    const dots = p.matches.reduce((acc, m) => acc + (Number(m.dots) || 0), 0);
    const bowlingAvg = totalWickets > 0 ? parseFloat((runsConceded / totalWickets).toFixed(2)) : 0;

    return { totalOvers, runsConceded, totalWickets, economy, maidens, dots, bowlingAvg };
  };

  const p1Bat = player1 ? getBattingSummary(player1) : null;
  const p2Bat = player2 ? getBattingSummary(player2) : null;
  
  const p1Bowl = player1 ? getBowlingSummary(player1) : null;
  const p2Bowl = player2 ? getBowlingSummary(player2) : null;

  const getChartData = () => {
    if (!player1 || !player2 || !p1Bat || !p2Bat || !p1Bowl || !p2Bowl) return [];
    
    switch (chartMode) {
      case 'runs':
        return [
          { metric: 'Total Runs', [player1.name]: p1Bat.totalRuns, [player2.name]: p2Bat.totalRuns },
          { metric: 'High Score', [player1.name]: p1Bat.highscore, [player2.name]: p2Bat.highscore }
        ];
      case 'rates':
        return [
          { metric: 'Batting Avg', [player1.name]: p1Bat.battingAvg, [player2.name]: p2Bat.battingAvg },
          { metric: 'Strike Rate', [player1.name]: p1Bat.strikeRate, [player2.name]: p2Bat.strikeRate }
        ];
      case 'boundaries':
        return [
          { metric: 'Fours (4s)', [player1.name]: p1Bat.fours, [player2.name]: p2Bat.fours },
          { metric: 'Sixes (6s)', [player1.name]: p1Bat.sixes, [player2.name]: p2Bat.sixes }
        ];
      case 'bowling':
        return [
          { metric: 'Overs Bowled', [player1.name]: p1Bowl.totalOvers, [player2.name]: p2Bowl.totalOvers },
          { metric: 'Wickets Taken', [player1.name]: p1Bowl.totalWickets, [player2.name]: p2Bowl.totalWickets },
          { metric: 'Economy Rate', [player1.name]: p1Bowl.economy, [player2.name]: p2Bowl.economy },
          { metric: 'Maiden Overs', [player1.name]: p1Bowl.maidens, [player2.name]: p2Bowl.maidens }
        ];
      default:
        return [];
    }
  };

  // Comparison progress bars
  const renderCompareRow = (label: string, val1: number, val2: number, higherIsBetter: boolean = true) => {
    const total = val1 + val2;
    const pct1 = total > 0 ? (val1 / total) * 100 : 50;
    const pct2 = total > 0 ? (val2 / total) * 100 : 50;

    const is1Better = higherIsBetter ? val1 > val2 : val1 < val2;
    const is2Better = higherIsBetter ? val2 > val1 : val2 < val1;

    return (
      <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs font-semibold px-1 text-slate-400">
          <span className={is1Better ? 'text-indigo-400 font-bold' : ''}>{val1}</span>
          <span className="text-slate-300 uppercase tracking-wider text-[10px]">{label}</span>
          <span className={is2Better ? 'text-emerald-400 font-bold' : ''}>{val2}</span>
        </div>
        <div className="h-2 flex rounded-lg overflow-hidden bg-slate-800">
          <div
            style={{ width: `${pct1}%` }}
            className={`transition-all duration-500 ${is1Better ? 'bg-indigo-500' : 'bg-indigo-600/40'}`}
          />
          <div
            style={{ width: `${pct2}%` }}
            className={`transition-all duration-500 ${is2Better ? 'bg-emerald-400' : 'bg-emerald-600/40'}`}
          />
        </div>
      </div>
    );
  };

  const executeSocialShare = () => {
    if (!player1 || !player2) return;
    
    // Create copy summary details representation to clipboards
    const shareText = `🏏 *Cricket Head-to-Head Stats Battle Card* 🏏
🔥 ${player1.name} (Team: ${player1.team})  vs  ⚡ ${player2.name} (Team: ${player2.team})

📊 BATTING SUMMARY:
- Runs: ${p1Bat?.totalRuns} vs ${p2Bat?.totalRuns}
- Average: ${p1Bat?.battingAvg} vs ${p2Bat?.battingAvg}
- Strike Rate: ${p1Bat?.strikeRate}% vs ${p2Bat?.strikeRate}%

🎯 BOWLING SUMMARY:
- Wickets: ${p1Bowl?.totalWickets} vs ${p2Bowl?.totalWickets}
- Economy: ${p1Bowl?.economy} vs ${p2Bowl?.economy}

Created on Cricket Stats Viz Playground. Compare your custom stats or bulk upload sheets interactively!`;

    navigator.clipboard.writeText(shareText);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 3000);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-sm border border-slate-700/80 p-6 md:p-8 space-y-8 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display tracking-tight flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-400" />
            Head-to-Head Comparison
          </h2>
          <p className="text-sm text-slate-405 text-slate-400 mt-0.5 font-sans">
            Select any two profiles side-by-side to contrast batting, bowling averages, and metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={player1Id}
            onChange={(e) => setPlayer1Id(e.target.value)}
            className="px-3 py-1.5 border border-slate-700 rounded-xl text-xs font-bold text-indigo-400 bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {players.map(p => (
              <option key={p.id} value={p.id} disabled={p.id === player2Id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>

          <span className="flex items-center text-slate-500 font-bold text-xs uppercase px-1">vs</span>

          <select
            value={player2Id}
            onChange={(e) => setPlayer2Id(e.target.value)}
            className="px-3 py-1.5 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {players.map(p => (
              <option key={p.id} value={p.id} disabled={p.id === player1Id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {player1 && player2 && p1Bat && p2Bat && p1Bowl && p2Bowl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Detailed Comparer Lists */}
          <div className="lg:col-span-2 space-y-6">

            {/* Visual Analytics Comparison Graph */}
            <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl p-5 sm:p-6 space-y-5 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Interactive Matchup Analytics
                  </h4>
                  <p className="text-xs text-slate-400 leading-snug">
                    Visualize comparison statistics. Click categories below to switch modes:
                  </p>
                </div>
                
                {/* Metric Selector Tabs with premium dark slate pills */}
                <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartMode('runs')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      chartMode === 'runs'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    Runs
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('rates')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      chartMode === 'rates'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    Efficiencies
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('boundaries')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      chartMode === 'boundaries'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    Boundaries
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('bowling')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      chartMode === 'bowling'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    Bowling
                  </button>
                </div>
              </div>

              {/* Dynamic Recharts Bar Chart */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                    <XAxis
                      dataKey="metric"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    />
                    <Bar
                      dataKey={player1.name}
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey={player2.name}
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Interactive legend elements */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-550 bg-indigo-500 shadow-[0_0_8px_#6366f1] block" />
                  <span className="font-semibold text-slate-200">{player1.name} ({player1.team})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] block" />
                  <span className="font-semibold text-slate-200">{player2.name} ({player2.team})</span>
                </div>
              </div>
            </div>

            {/* Batting Attributes Comparative */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-700 pb-1 font-display">
                <Trophy className="w-4 h-4 text-indigo-400" />
                Batting Stats Comparisons
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderCompareRow("Runs Scored", p1Bat.totalRuns, p2Bat.totalRuns)}
                {renderCompareRow("Batting Average", p1Bat.battingAvg, p2Bat.battingAvg)}
                {renderCompareRow("Strike Rate (%)", p1Bat.strikeRate, p2Bat.strikeRate)}
                {renderCompareRow("High Score", p1Bat.highscore, p2Bat.highscore)}
                {renderCompareRow("Fours (4s)", p1Bat.fours, p2Bat.fours)}
                {renderCompareRow("Sixes (6s)", p1Bat.sixes, p2Bat.sixes)}
              </div>
            </div>

            {/* Bowling Attributes Comparative */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-700 pb-1 font-display">
                <Percent className="w-4 h-4 text-emerald-400" />
                Bowling Stats Comparisons
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderCompareRow("Overs Bowled", p1Bowl.totalOvers, p2Bowl.totalOvers)}
                {renderCompareRow("Wickets Taken", p1Bowl.totalWickets, p2Bowl.totalWickets)}
                {renderCompareRow("Economy (Econ)", p1Bowl.economy, p2Bowl.economy, false)}
                {renderCompareRow("Maiden Overs", p1Bowl.maidens, p2Bowl.maidens)}
                {renderCompareRow("Bowling Average", p1Bowl.bowlingAvg || 0, p2Bowl.bowlingAvg || 0, false)}
                {renderCompareRow("Dot Deliveries", p1Bowl.dots, p2Bowl.dots)}
              </div>
            </div>
          </div>

          {/* Social Trading Card Widget (Right Side Column) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-display">
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              Social Comparison Trading Card
            </h3>

            {/* Visual Digital Card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 p-5 shadow-lg text-white border border-slate-800 space-y-4 relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-550/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-550/10 rounded-full blur-xl" />

              <div className="text-center z-10 w-full">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] uppercase font-bold text-indigo-300 border border-white/5 tracking-widest">
                  Fierce Matchup
                </span>
                <p className="text-xs text-slate-400 mt-1 font-mono">Head-to-Head Arena Comparison</p>
              </div>

              {/* Split layout representation of players */}
              <div className="grid grid-cols-2 gap-4 w-full relative z-10 py-2 border-y border-white/10">
                <div className="text-center border-r border-white/10 pr-2">
                  <span className="text-[10px] uppercase font-bold font-mono text-indigo-400">{player1.team}</span>
                  <h4 className="text-sm font-bold truncate text-white mt-1">{player1.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 bg-indigo-550/10 inline-block px-1.5 py-0.5 rounded uppercase">
                    {player1.type}
                  </p>
                  <div className="mt-3 text-xs">
                    <div className="font-mono text-indigo-200">RUNS: <span className="font-bold text-white">{p1Bat.totalRuns}</span></div>
                    <div className="font-mono text-indigo-200">WKTS: <span className="font-bold text-white">{p1Bowl.totalWickets}</span></div>
                  </div>
                </div>

                <div className="text-center pl-2">
                  <span className="text-[10px] uppercase font-bold font-mono text-emerald-400">{player2.team}</span>
                  <h4 className="text-sm font-bold truncate text-white mt-1">{player2.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 bg-emerald-555/15 inline-block px-1.5 py-0.5 rounded uppercase">
                    {player2.type}
                  </p>
                  <div className="mt-3 text-xs">
                    <div className="font-mono text-emerald-200">RUNS: <span className="font-bold text-white">{p2Bat.totalRuns}</span></div>
                    <div className="font-mono text-emerald-200">WKTS: <span className="font-bold text-white">{p2Bowl.totalWickets}</span></div>
                  </div>
                </div>
              </div>

              {/* Trading Card Metric Comparison Rows */}
              <div className="w-full space-y-2 text-[11px] font-mono z-10 text-slate-300">
                <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded">
                  <span>Bat Avg:</span>
                  <span className="font-bold text-white">{p1Bat.battingAvg} vs {p2Bat.battingAvg}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded">
                  <span>Bow Wkts:</span>
                  <span className="font-bold text-white">{p1Bowl.totalWickets} vs {p2Bowl.totalWickets}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded">
                  <span>Bowl Econ:</span>
                  <span className="font-bold text-white">{p1Bowl.economy} vs {p2Bowl.economy}</span>
                </div>
              </div>

              {/* Copy invite button representation */}
              <button
                onClick={executeSocialShare}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all shadow hover:shadow-indigo-500/20 active:scale-95 cursor-pointer border border-indigo-400/30 z-10 mt-2"
              >
                {shareFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied Summary Payload!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Share Card Payload
                  </>
                )}
              </button>

              <span className="text-[9px] text-slate-400 italic text-center text-opacity-80">
                *Click to copy a beautifully formatted Markdown & text summary comparing batsman/bowler stats.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
