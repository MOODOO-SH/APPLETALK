
import React from 'react';
import { CoachAnalysis } from '../types';

interface CoachPanelProps {
  analysis: CoachAnalysis | null;
  loading: boolean;
}

const CoachPanel: React.FC<CoachPanelProps> = ({ analysis, loading }) => {
  if (!analysis && !loading) return null;

  return (
    <div className="fixed bottom-24 right-4 w-72 md:w-80 bg-slate-900/90 border border-emerald-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md z-40 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">教练分析室</h3>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1 font-semibold uppercase text-xs">战局摘要</p>
            <p className="text-slate-200 leading-relaxed italic">"{analysis?.logicSummary}"</p>
          </div>

          <div>
            <p className="text-red-400 mb-1 font-semibold uppercase text-xs">对手破绽</p>
            <p className="text-slate-200">{analysis?.weakness}</p>
          </div>

          <div>
            <p className="text-emerald-400 mb-1 font-semibold uppercase text-xs">反击建议</p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {analysis?.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div>
            <p className="text-amber-400 mb-1 font-semibold uppercase text-xs">必杀金句</p>
            <div className="space-y-2">
              {analysis?.goldenQuotes.map((q, i) => (
                <div key={i} className="bg-slate-800 p-2 rounded border-l-2 border-amber-500 text-amber-100">
                  {q}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-purple-400 mb-1 font-semibold uppercase text-xs">整活/梗</p>
            <div className="flex flex-wrap gap-2">
              {analysis?.geng.map((g, i) => (
                <span key={i} className="bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded text-xs border border-purple-500/30">
                  #{g}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachPanel;
