'use client';

import { useState } from 'react';
import { CLAIMS, formatCurrency, getTotalAtRisk } from '@/lib/claims';
import ClaimDetail from './claim/ClaimDetail';

export default function Dashboard() {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const selectedClaim = CLAIMS.find(c => c.id === selectedClaimId);

  if (selectedClaim) {
    return <ClaimDetail claim={selectedClaim} onBack={() => setSelectedClaimId(null)} />;
  }

  const totalAtRisk = getTotalAtRisk();
  const criticalCount = CLAIMS.filter(c => c.priority === 'critical').length;
  const highCount = CLAIMS.filter(c => c.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-navy-600 flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">Denials AI Copilot</h1>
                <p className="text-xs text-sky-300/70 font-medium">AI-powered denial analysis & appeal generation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                AI Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Open Denials', value: CLAIMS.length.toString(), sub: 'Awaiting action', color: 'text-white', bg: 'from-navy-700 to-navy-600' },
            { label: 'Revenue at Risk', value: formatCurrency(totalAtRisk), sub: 'Across all claims', color: 'text-red-400', bg: 'from-red-950/40 to-navy-700' },
            { label: 'Critical Priority', value: criticalCount.toString(), sub: `${highCount} high priority`, color: 'text-orange-400', bg: 'from-orange-950/30 to-navy-700' },
            { label: 'Avg Overturn Rate', value: '68%', sub: 'AI-assisted appeals', color: 'text-emerald-400', bg: 'from-emerald-950/30 to-navy-700' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.bg} border border-white/5 p-5`}>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">{stat.label}</div>
              <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Denials Queue */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Denials Queue</h2>
          <span className="text-xs text-slate-500">Click a claim to run AI analysis</span>
        </div>

        <div className="flex flex-col gap-3">
          {CLAIMS.map((claim, i) => (
            <button
              key={claim.id}
              onClick={() => setSelectedClaimId(claim.id)}
              className="w-full text-left rounded-xl bg-navy-800/60 border border-white/5 hover:border-sky-500/30 hover:bg-navy-700/60 transition-all duration-200 p-5 group animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {claim.patient}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{claim.claimId}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      claim.priority === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      claim.priority === 'high' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                      'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                      {claim.priority}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300 mb-1">{claim.procedure}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{claim.denialReason}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-extrabold text-white">{formatCurrency(claim.chargeAmount)}</div>
                  <div className="text-xs text-slate-500 mt-1">{claim.payer}</div>
                  <div className={`text-xs mt-1 font-semibold ${claim.daysRemaining <= 45 ? 'text-red-400' : 'text-slate-400'}`}>
                    {claim.daysRemaining} days to deadline
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-slate-500"><strong className="text-slate-400">Denial Code:</strong> {claim.denialCode}</span>
                <span className="text-xs text-slate-500"><strong className="text-slate-400">Provider:</strong> {claim.provider}</span>
                <span className="text-xs text-slate-500"><strong className="text-slate-400">DOS:</strong> {claim.dateOfService}</span>
                <span className="ml-auto text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                  Analyze with AI →
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <p className="text-xs text-slate-600">
            Prototype Demo — Hardik Sodhani | Associate Product Lead | Qualified Health
          </p>
        </div>
      </footer>
    </div>
  );
}
