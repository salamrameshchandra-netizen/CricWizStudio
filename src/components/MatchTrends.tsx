import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { MatchLog } from '../types';

interface MatchTrendsProps {
  matches: MatchLog[];
  playerType: 'batsman' | 'bowler';
}

export default function MatchTrends({ matches, playerType }: MatchTrendsProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'cumulative'>('line');

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
        No matches recorded to trace trend curves.
      </div>
    );
  }

  // Pre-calculate batsman and bowler specific metrics for graphing
  const chartData = matches.map((m, index) => {
    const runs = Number(m.runs) || 0;
    const balls = Number(m.balls) || 0;
    const strikeRate = balls > 0 ? parseFloat(((runs / balls) * 100).toFixed(1)) : 0;
    
    const overs = Number(m.overs) || 0;
    const runsConceded = Number(m.runsConceded) || Number(m.runs) || 0;
    const wickets = Number(m.wickets) || 0;
    const economy = overs > 0 ? parseFloat((runsConceded / overs).toFixed(2)) : 0;

    return {
      matchNumber: `M${index + 1}`,
      opponent: m.opponent,
      date: m.date,
      // Batsman fields
      runs,
      balls,
      strikeRate,
      fours: m.fours || 0,
      sixes: m.sixes || 0,
      // Bowler fields
      overs,
      runsConceded,
      wickets,
      economy,
      dots: m.dots || 0
    };
  });

  // Calculate Cumulative Runs / Cumulative Wickets
  let runSum = 0;
  let wicketSum = 0;
  const cumulativeData = chartData.map((d) => {
    runSum += d.runs;
    wicketSum += d.wickets;
    return {
      ...d,
      cumulativeRuns: runSum,
      cumulativeWickets: wicketSum
    };
  });

  const renderBatsmanCharts = () => {
    if (chartType === 'line') {
      return (
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" label={{ value: 'Runs', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#818cf8', fontSize: 10 } }} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Strike Rate', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#22d3ee', fontSize: 10 } }} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="runs" name="Runs Scored" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="strikeRate" name="Strike Rate (%)" stroke="#0891b2" strokeWidth={2} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartType === 'bar') {
      return (
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="fours" name="Fours (4s)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sixes" name="Sixes (6s)" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Cumulative area chart
    return (
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="cumulativeRuns" name="Career Accumulation Runs" stroke="#4f46e5" fillOpacity={1} fill="url(#runsGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderBowlerCharts = () => {
    if (chartType === 'line') {
      return (
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" label={{ value: 'Wickets', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#34d399', fontSize: 10 } }} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Economy (Econ)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#fbbf24', fontSize: 10 } }} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="wickets" name="Wickets Taken" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="economy" name="Economy Rate (RPO)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="dots" name="Dot Deliveries" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="runsConceded" name="Runs Conceded" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Cumulative bowler wickets
    return (
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="wickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="cumulativeWickets" name="Cumulative Wicket Record" stroke="#10b981" fillOpacity={1} fill="url(#wickGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div id="match-trends" className="bg-[#1e293b] rounded-2xl border border-slate-700/80 p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 font-display">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Performance Trend Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace {playerType === 'batsman' ? 'scoring' : 'run containment'} across dates and matches.
          </p>
        </div>
        
        {/* Toggle between lines */}
        <div className="inline-flex bg-slate-900 p-0.5 rounded-lg text-xs self-start sm:self-auto border border-slate-800">
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              chartType === 'line' ? 'bg-[#1e293b] text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            Curves
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              chartType === 'bar' ? 'bg-[#1e293b] text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Distributions
          </button>
          <button
            onClick={() => setChartType('cumulative')}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              chartType === 'cumulative' ? 'bg-[#1e293b] text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cumulative
          </button>
        </div>
      </div>

      <div>
        {playerType === 'batsman' ? renderBatsmanCharts() : renderBowlerCharts()}
      </div>
    </div>
  );
}
