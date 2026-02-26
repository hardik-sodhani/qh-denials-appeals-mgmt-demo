'use client';

import { useState, useRef, useEffect } from 'react';
import { Claim, formatCurrency } from '@/lib/claims';

interface Analysis {
  denialCategory: { value: string; confidence: number };
  rootCause: { value: string; confidence: number };
  payerPolicyMatch: { value: string; confidence: number };
  historicalOverturnRate: { value: string; confidence: number };
  priorityScore: { value: string; confidence: null };
  keyFindings: string[];
  recommendedActions: string[];
  missingDocumentation: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ClaimDetail({ claim, onBack }: { claim: Claim; onBack: () => void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [appealLetter, setAppealLetter] = useState('');
  const [generatingAppeal, setGeneratingAppeal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'appeal'>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const appealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (appealRef.current && generatingAppeal) {
      appealRef.current.scrollTop = appealRef.current.scrollHeight;
    }
  }, [appealLetter, generatingAppeal]);

  async function runAnalysis() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });
      if (!res.ok) throw new Error('Analysis request failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateAppeal() {
    if (!analysis) return;
    setGeneratingAppeal(true);
    setAppealLetter('');
    setActiveTab('appeal');
    setError(null);
    try {
      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, analysis }),
      });
      if (!res.ok) throw new Error('Appeal request failed');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            setAppealLetter(prev => prev + parsed.text);
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingAppeal(false);
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatStreaming(true);

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setChatMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim,
          analysis,
          appealLetter: appealLetter || null,
          messages: newMessages,
        }),
      });
      if (!res.ok) throw new Error('Chat request failed');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.text;
            setChatMessages([...newMessages, { role: 'assistant', content: accumulated }]);
          } catch {}
        }
      }
    } catch (err: any) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatStreaming(false);
    }
  }

  const confidenceBar = (value: number, color: string) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-bold font-mono" style={{ color }}>{value}%</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                ← Back to Queue
              </button>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-navy-600 flex items-center justify-center text-sm">⚡</div>
                <span className="text-sm font-bold">Denials AI Copilot</span>
              </div>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                showChat
                  ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              💬 AI Copilot {showChat ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${showChat ? 'mr-0' : ''}`}>
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Claim Header Card */}
            <div className="rounded-xl bg-navy-800/60 border border-white/5 p-5 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-extrabold">{claim.patient}</h2>
                    <span className="text-xs text-slate-500 font-mono">{claim.patientAge}{claim.patientSex} · {claim.mrn}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      claim.priority === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      claim.priority === 'high' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                      'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                    }`}>{claim.priority}</span>
                  </div>
                  <p className="text-sm text-slate-300">{claim.procedure} <span className="text-slate-500">· CPT {claim.cptCode}</span></p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">{formatCurrency(claim.chargeAmount)}</div>
                  <div className={`text-xs font-semibold mt-1 ${claim.daysRemaining <= 45 ? 'text-red-400' : 'text-slate-400'}`}>
                    {claim.daysRemaining} days to filing deadline
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-4">
                <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">
                  Denial — Code {claim.denialCode}
                </div>
                <p className="text-xs text-red-300/80 leading-relaxed">{claim.denialReason}</p>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                {[
                  ['Provider', claim.provider],
                  ['Payer', claim.payer],
                  ['Date of Service', claim.dateOfService],
                  ['Denial Date', claim.denialDate],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</div>
                    <div className="text-slate-300 mt-0.5 font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing with AI...
                  </span>
                ) : analysis ? '🔍 Re-run AI Analysis' : '🔍 Run AI Analysis'}
              </button>
              <button
                onClick={generateAppeal}
                disabled={!analysis || generatingAppeal}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {generatingAppeal ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Appeal...
                  </span>
                ) : '✉️ Generate Appeal Letter'}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-navy-800/40 rounded-lg p-1 border border-white/5">
              {[
                { id: 'overview' as const, label: '📋 Clinical Notes' },
                { id: 'analysis' as const, label: '🔍 AI Analysis', disabled: !analysis },
                { id: 'appeal' as const, label: '✉️ Appeal Letter', disabled: !appealLetter },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-navy-600 text-white shadow-md'
                      : tab.disabled
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-xl bg-navy-800/40 border border-white/5 overflow-hidden">
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Clinical Documentation</h3>
                  <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{claim.clinicalNotes}</pre>
                </div>
              )}

              {activeTab === 'analysis' && analysis && (
                <div className="p-6 space-y-4 animate-fade-in-up">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">AI Denial Analysis</h3>

                  {/* Analysis Items */}
                  {[
                    { label: 'Denial Category', data: analysis.denialCategory, color: '#ef4444', icon: '🏷️' },
                    { label: 'Root Cause', data: analysis.rootCause, color: '#f97316', icon: '🔎' },
                    { label: 'Payer Policy Match', data: analysis.payerPolicyMatch, color: '#3b82f6', icon: '📑' },
                    { label: 'Historical Overturn Rate', data: analysis.historicalOverturnRate, color: '#22c55e', icon: '📊' },
                  ].map((item) => (
                    <div key={item.label} className="bg-navy-900/50 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.icon} {item.label}</span>
                        {confidenceBar(item.data.confidence, item.color)}
                      </div>
                      <p className="text-sm text-white font-semibold">{item.data.value}</p>
                    </div>
                  ))}

                  {/* Priority Score */}
                  <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg p-4 border border-violet-500/20">
                    <span className="text-[10px] uppercase tracking-widest text-violet-400 font-bold">⚡ Priority Score</span>
                    <p className="text-sm text-white font-bold mt-1">{analysis.priorityScore.value}</p>
                  </div>

                  {/* Key Findings */}
                  {analysis.keyFindings?.length > 0 && (
                    <div className="bg-navy-900/50 rounded-lg p-4 border border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">Key Findings</span>
                      <ul className="mt-2 space-y-1.5">
                        {analysis.keyFindings.map((f, i) => (
                          <li key={i} className="text-sm text-slate-300 flex gap-2">
                            <span className="text-sky-400 mt-0.5">•</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {analysis.recommendedActions?.length > 0 && (
                    <div className="bg-navy-900/50 rounded-lg p-4 border border-emerald-500/10">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Recommended Actions</span>
                      <ul className="mt-2 space-y-1.5">
                        {analysis.recommendedActions.map((a, i) => (
                          <li key={i} className="text-sm text-slate-300 flex gap-2">
                            <span className="text-emerald-400 mt-0.5">→</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Documentation */}
                  {analysis.missingDocumentation?.length > 0 && (
                    <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/10">
                      <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">⚠ Documentation Gaps</span>
                      <ul className="mt-2 space-y-1.5">
                        {analysis.missingDocumentation.map((d, i) => (
                          <li key={i} className="text-sm text-orange-300/80 flex gap-2">
                            <span className="text-orange-400 mt-0.5">!</span>{d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appeal' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Generated Appeal Letter</h3>
                    {!generatingAppeal && appealLetter && (
                      <button
                        onClick={() => navigator.clipboard.writeText(appealLetter)}
                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                      >
                        📋 Copy to Clipboard
                      </button>
                    )}
                  </div>
                  <div
                    ref={appealRef}
                    className="bg-white rounded-lg p-6 max-h-[500px] overflow-y-auto custom-scrollbar"
                  >
                    <pre className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                      {appealLetter}
                      {generatingAppeal && <span className="typewriter-cursor text-violet-600 font-bold">▌</span>}
                    </pre>
                  </div>
                  {!generatingAppeal && appealLetter && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[
                        { label: 'Generation Time', value: 'AI-assisted', color: 'text-sky-400' },
                        { label: 'Revenue at Risk', value: formatCurrency(claim.chargeAmount), color: 'text-red-400' },
                        { label: 'Filing Deadline', value: `${claim.daysRemaining} days`, color: claim.daysRemaining <= 45 ? 'text-red-400' : 'text-emerald-400' },
                      ].map(m => (
                        <div key={m.label} className="bg-navy-900/50 rounded-lg p-3 border border-white/5 text-center">
                          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{m.label}</div>
                          <div className={`text-lg font-extrabold mt-1 ${m.color}`}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-[380px] border-l border-white/10 bg-navy-900/90 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Copilot
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Ask questions about this denial, payer policies, or appeal strategy</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-3">Try asking:</p>
                  {[
                    "What's the strongest argument for this appeal?",
                    "What documentation is missing?",
                    "What's Aetna's typical review process for this denial type?",
                    "How can we improve the overturn probability?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setChatInput(suggestion); }}
                      className="w-full text-left text-xs text-slate-400 hover:text-sky-300 bg-white/5 hover:bg-sky-500/10 rounded-lg p-2.5 transition-all border border-white/5 hover:border-sky-500/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-white/5 text-slate-300 border border-white/5'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans text-xs">{msg.content}{msg.role === 'assistant' && chatStreaming && i === chatMessages.length - 1 && <span className="typewriter-cursor text-sky-400">▌</span>}</pre>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask about this denial..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || chatStreaming}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
