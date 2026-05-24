import { BookOpen, Upload, FileSpreadsheet, PlusCircle, Sparkles, Sliders, Share2, Trash2 } from 'lucide-react';

export default function UserGuide() {
  return (
    <div id="user-guide" className="bg-[#1e293b] rounded-2xl shadow-sm border border-slate-700/80 p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-100 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-700 pb-5">
        <div className="p-3 bg-indigo-950/50 text-indigo-400 rounded-xl border border-indigo-800">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-display tracking-tight">Cricketer Stats Companion - User Guide</h2>
          <p className="text-sm text-slate-400">Master raw data conversions into visual scoreboards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual stats */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 flex items-center justify-center font-display">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">Manual Stat Registry</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Register a new profile (Batsman/Bowler) choosing their style. Append brand new match statistics in numerical grids, or tap directly on the vector panels to add custom boundaries or delivery dots.
            </p>
          </div>
        </div>

        {/* Bulk CSV stats */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 flex items-center justify-center font-display">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">Bulk CSV Processing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload formatted `.csv` logging grids containing several innings at once. Our engine safely parses variables and builds instant trend curves. Click the CSV templates tab to copy copyable samples.
            </p>
          </div>
        </div>

        {/* Pitch Heatmap */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/30 flex items-center justify-center font-display">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">Interactive Pitch Heatmap</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Explore delivery spatial pitch coordinates for bowlers. <strong>Pitch Map (Bowlers)</strong> represents line and length coordinates where balls bounced on the cricket pitch.
            </p>
          </div>
        </div>

        {/* AI Scouting */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-900/30 flex items-center justify-center font-display">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">AI Scouting Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trigger Google Gemini to conduct deep coaching analyses. Our AI evaluates strengths, identifies vulnerabilities, and delivers detailed tactical advice automatically.
            </p>
          </div>
        </div>

        {/* Multi-player compare */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-950/40 text-pink-400 border border-pink-900/30 flex items-center justify-center font-display">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">Head-to-Head Comparisons</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Select two players to view unified comparisons with dynamic bar spreads. Export beautiful social comparison trading cards optimized for digital sharing or copying.
            </p>
          </div>
        </div>

        {/* CSV syntax/delete */}
        <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/40 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/30 flex items-center justify-center font-display">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-base mb-1">Clean & Export PDF</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly wipe preloaded players to begin fresh datasets. Generate print-ready documents containing all match history, trends, and heatmaps tailored to be easily saved as PDF summaries.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-slate-200 flex items-center gap-2 font-display">
          <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          CSV Upload Blueprint Specification
        </h4>
        <p className="text-xs text-slate-400">
          Make sure your uploaded CSV has a header row. Choose the relative format matching your cricketer types:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#142030] p-3 border border-slate-800 rounded-lg shadow-sm">
            <div className="font-semibold text-indigo-400 mb-1">BATSMAN MATCH LOG CSV:</div>
            <pre className="text-slate-300 overflow-x-auto select-all">
{`Match,Opponent,Runs,Balls,Fours,Sixes,Dismissed
1,Australia,45,30,4,2,yes
2,Pakistan,82,53,6,4,no
3,England,12,18,1,0,no`}
            </pre>
          </div>

          <div className="bg-[#142030] p-3 border border-slate-800 rounded-lg shadow-sm">
            <div className="font-semibold text-emerald-400 mb-1">BOWLER MATCH LOG CSV:</div>
            <pre className="text-slate-300 overflow-x-auto select-all">
{`Match,Opponent,Overs,RunsConceded,Wickets,Maidens,Dots
1,Pakistan,4.0,14,3,1,16
2,England,10.0,32,4,2,42
3,Australia,8.0,28,2,0,28`}
            </pre>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          *Note: The parser automatically maps header variations (e.g. "opponent", "runs", "overs") dynamically.
        </p>
      </div>
    </div>
  );
}
