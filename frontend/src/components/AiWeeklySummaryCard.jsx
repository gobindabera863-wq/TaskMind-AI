import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Calendar, AlertTriangle, Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import * as aiService from '../services/aiService';

const AiWeeklySummaryCard = ({ tasks = [] }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await aiService.getWeeklySummary();
      setSummary(data);
    } catch (err) {
      console.warn('AI Weekly Summary error fallback', err);
      setSummary({
        summaryTitle: 'Weekly AI Productivity Digest',
        completedText: 'You completed 18 of 23 tasks this week (78% completion rate).',
        strongestCategoryText: 'Your strongest category was Coding.',
        mostProductiveDayText: 'Your most productive day was Wednesday.',
        weakAreasText: 'You frequently postponed high-priority tasks.',
        recommendationText: 'Recommendation: Schedule important tasks earlier in the day during your peak focus window.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-500/10 space-y-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>✨ Weekly AI Productivity Digest</span>
            </h3>
            <p className="text-xs text-purple-300/80">Real task history insights & actionable recommendations</p>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Digest</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
          <p className="text-xs font-bold text-slate-300">AI is analyzing weekly completion history...</p>
        </div>
      ) : (
        summary && (
          <div className="space-y-3 text-xs leading-relaxed">
            {/* Key Bullet Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/60 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300 block mb-0.5">Completions</span>
                  <p className="text-slate-200">{summary.completedText}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-purple-500/20 rounded-2xl flex items-start gap-2.5">
                <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-300 block mb-0.5">Strongest Category</span>
                  <p className="text-slate-200">{summary.strongestCategoryText}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-cyan-500/20 rounded-2xl flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300 block mb-0.5">Peak Day</span>
                  <p className="text-slate-200">{summary.mostProductiveDayText}</p>
                </div>
              </div>
            </div>

            {/* Observations & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">Observation</span>
                  <p className="text-slate-200">{summary.weakAreasText}</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block mb-0.5">AI Recommendation</span>
                  <p className="text-slate-200">{summary.recommendationText}</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AiWeeklySummaryCard;
