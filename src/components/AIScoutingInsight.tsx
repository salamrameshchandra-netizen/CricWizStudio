import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertOctagon, HelpCircle, GraduationCap } from 'lucide-react';
import { Player, ScoutingInsight } from '../types';

interface AIScoutingInsightProps {
  player: Player;
}

export default function AIScoutingInsight({ player }: AIScoutingInsightProps) {
  const [insight, setInsight] = useState<ScoutingInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  
  // Rotating status comments during loading
  const [loaderMessage, setLoaderMessage] = useState('Syncing statistical score logs...');
  const loaderTexts = [
    'Transcribing boundary cartographies...',
    'Synthesizing pitch bounce landing heatmaps...',
    'Analyzing run rate progressions...',
    'Invoking Google Gemini 3.5 scouting algorithms...',
    'Generating predictive coaching adjustments...'
  ];

  useEffect(() => {
    // Clean preview insight when switching players
    setInsight(null);
    setErrorCode(null);
  }, [player.id]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      let step = 0;
      interval = setInterval(() => {
        setLoaderMessage(loaderTexts[step % loaderTexts.length]);
        step++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const requestInsight = async () => {
    setLoading(true);
    setErrorCode(null);
    try {
      const response = await fetch('/api/scouting-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player })
      });

      if (!response.ok) {
        throw new Error(`Server completed with code ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setInsight(data.result);
    } catch (err: any) {
      console.error("Scouting Error:", err);
      setErrorCode(err.message || 'Error formulating request to Gemini engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-xl p-6 text-slate-105 text-slate-100 space-y-6 relative overflow-hidden border border-slate-700/80">
      
      {/* Decorative vector background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl z-0" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl z-0" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/60 text-indigo-400 rounded-xl border border-indigo-900/40">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-white">AI Scouting Intelligence</h3>
            <p className="text-xs text-slate-400 font-sans">Coaching analytics generated via Google Gemini 3.5</p>
          </div>
        </div>

        {!insight && !loading && (
          <button
            onClick={requestInsight}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow hover:shadow-indigo-500/10 active:scale-95 cursor-pointer border border-indigo-500"
          >
            Compute Scout Assessment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-100 animate-fade-in">{loaderMessage}</p>
              <p className="text-xs text-indigo-400">Compiling professional cricket insights...</p>
            </div>
          </div>
        ) : errorCode ? (
          <div className="py-6 flex gap-3 items-start bg-[#2d1115] text-rose-200 border border-rose-900 rounded-2xl p-4">
            <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Failed to connect to AI server</p>
              <p className="text-xs text-rose-300/80 mt-1">{errorCode}</p>
              <button
                onClick={requestInsight}
                className="mt-3 px-3 py-1 bg-rose-900/60 hover:bg-rose-900/80 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Retry Search Connection
              </button>
            </div>
          </div>
        ) : insight ? (
          <div className="space-y-6 animate-fade-in">
            {/* Playing style and verdict banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-850 border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold font-display">Inferred Style</span>
                <span className="text-sm font-bold text-white font-mono">{insight.radarAnalysis}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between md:col-span-2 space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-display">Scouting Verdict</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{insight.summary}</p>
              </div>
            </div>

            {/* Strengths & Weaknesses block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2 font-display">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Key Strengths
                </h4>
                <ul className="space-y-2">
                  {insight.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-2 font-display">
                  <AlertOctagon className="w-4 h-4 text-rose-400" /> Tactical Vulnerabilities
                </h4>
                <ul className="space-y-2">
                  {insight.weaknesses.map((weak, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400 font-bold mt-0.5">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coach's tactical recommendation */}
            <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-2xl p-5 flex gap-4">
              <div className="flex-shrink-0 p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800 self-start font-display">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-display">Coach's Technical Advice</h5>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{insight.coachAdvice}"</p>
              </div>
            </div>

            {/* Refresh insight capability code */}
            <div className="flex justify-end pt-1">
              <button
                onClick={requestInsight}
                className="text-[10px] text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" /> Re-trigger Assessment
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-800">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">Scout Report Uncompiled</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Trigger Google Gemini to review {player.name}'s statistical profile logs.
              </p>
            </div>
            <button
              onClick={requestInsight}
              className="mt-2 px-4 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-colors border border-indigo-800 cursor-pointer"
            >
              Analyze Profile Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
