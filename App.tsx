
import React, { useState, useEffect, useRef } from 'react';
import { DebateSide, GameMode, DebaterProfile, Message, CoachAnalysis } from './types';
import { DEBATER_PROFILES, RANDOM_TOPICS } from './constants';
import { getAIDebateResponse, getCoachAnalysis } from './services/geminiService';
import DanmakuLayer from './components/DanmakuLayer';
import CoachPanel from './components/CoachPanel';

const App: React.FC = () => {
  const [step, setStep] = useState<'start' | 'mode' | 'topic' | 'side' | 'opponent' | 'playing'>('start');
  const [mode, setMode] = useState<GameMode>(GameMode.AI_CHALLENGE);
  const [topic, setTopic] = useState('');
  const [userSide, setUserSide] = useState<DebateSide>(DebateSide.PRO);
  const [opponent, setOpponent] = useState<DebaterProfile>(DEBATER_PROFILES[0]);
  const [history, setHistory] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachAnalysis, setCoachAnalysis] = useState<CoachAnalysis | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleStartGame = () => {
    setStep('mode');
  };

  const handleSelectMode = (m: GameMode) => {
    setMode(m);
    setStep('topic');
  };

  const handleSelectTopic = (t: string) => {
    setTopic(t);
    setStep('side');
  };

  const handleSelectSide = (s: DebateSide) => {
    setUserSide(s);
    if (mode === GameMode.AI_CHALLENGE) {
      setStep('opponent');
    } else {
      setStep('playing');
    }
  };

  const handleSelectOpponent = (p: DebaterProfile) => {
    setOpponent(p);
    setStep('playing');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: inputText,
      senderName: '你',
      timestamp: Date.now()
    };

    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInputText('');
    setIsLoading(true);
    setCoachLoading(true);

    try {
      // 1. Get Coach Feedback
      getCoachAnalysis(topic, newHistory, userSide).then(analysis => {
        setCoachAnalysis(analysis);
        setCoachLoading(false);
      });

      // 2. Get AI Opponent Response
      const aiSide = userSide === DebateSide.PRO ? DebateSide.CON : DebateSide.PRO;
      const aiContent = await getAIDebateResponse(topic, newHistory, opponent, aiSide);
      
      const aiMsg: Message = {
        role: 'ai',
        content: aiContent,
        senderName: opponent.name,
        timestamp: Date.now()
      };
      
      setHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: 'system',
        content: '对方辩友陷入了逻辑盲区，请稍后再试...',
        senderName: '系统',
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in px-4">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                辩论之魂
              </h1>
              <p className="absolute -bottom-2 right-0 text-emerald-500 font-mono text-xs md:text-sm uppercase tracking-widest">Soul of Debate v2.5</p>
            </div>
            <p className="text-slate-400 max-w-md text-lg leading-relaxed">
              在这个逻辑交锋的竞技场，你将面对顶尖辩手的挑战。
              准备好你的论点，迎接思想的碰撞。
            </p>
            <button
              onClick={handleStartGame}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              开启挑战
            </button>
          </div>
        );

      case 'mode':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in p-6">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">选择竞技模式</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button
                onClick={() => handleSelectMode(GameMode.AI_CHALLENGE)}
                className="group flex flex-col items-center p-8 bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 rounded-3xl transition-all"
              >
                <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-100">人机单挑</span>
                <p className="text-slate-500 text-sm mt-2 text-center">挑战AI镜像出的顶尖辩手，配备实时教练指导</p>
              </button>
              <button
                onClick={() => handleSelectMode(GameMode.TWO_PLAYERS)}
                className="group flex flex-col items-center p-8 bg-slate-900 border-2 border-slate-800 hover:border-cyan-500 rounded-3xl transition-all"
              >
                <div className="w-16 h-16 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-100">双人对决</span>
                <p className="text-slate-500 text-sm mt-2 text-center">本地轮流发言模式，适合线下与好友切磋</p>
              </button>
            </div>
          </div>
        );

      case 'topic':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in p-6 w-full max-w-3xl mx-auto overflow-y-auto">
            <h2 className="text-3xl font-bold text-slate-100">选定辩题</h2>
            <div className="w-full grid grid-cols-1 gap-3">
              {RANDOM_TOPICS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTopic(t)}
                  className="w-full p-4 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all"
                >
                  <span className="text-slate-400 mr-2 font-mono italic">#{idx+1}</span>
                  <span className="text-slate-100">{t}</span>
                </button>
              ))}
              <div className="mt-4 p-4 bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 mb-2 text-sm font-bold uppercase">或由你出题：</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="在这里输入你想辩论的主题..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectTopic((e.target as HTMLInputElement).value);
                    }}
                  />
                  <button
                    className="px-4 py-2 bg-emerald-600 rounded-lg text-white"
                    onClick={() => {
                      const val = (document.querySelector('input') as HTMLInputElement).value;
                      if (val) handleSelectTopic(val);
                    }}
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'side':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in p-6">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">选择你的立场</h2>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl">
              <button
                onClick={() => handleSelectSide(DebateSide.PRO)}
                className="flex-1 p-8 bg-red-900/20 border-2 border-red-900/50 hover:bg-red-900/30 hover:border-red-500 rounded-3xl transition-all"
              >
                <span className="text-3xl font-black text-red-400">正方</span>
                <p className="text-slate-500 mt-2">支持辩题观点</p>
              </button>
              <button
                onClick={() => handleSelectSide(DebateSide.CON)}
                className="flex-1 p-8 bg-blue-900/20 border-2 border-blue-900/50 hover:bg-blue-900/30 hover:border-blue-500 rounded-3xl transition-all"
              >
                <span className="text-3xl font-black text-blue-400">反方</span>
                <p className="text-slate-500 mt-2">反对辩题观点</p>
              </button>
            </div>
          </div>
        );

      case 'opponent':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in p-6 w-full max-w-4xl mx-auto overflow-y-auto">
            <h2 className="text-3xl font-bold text-slate-100">选择对手 (AI)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {DEBATER_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectOpponent(p)}
                  className="flex flex-col p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl transition-all group"
                >
                  <img src={p.avatar} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-3 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-emerald-400">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">{p.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-3">{p.style}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'playing':
        return (
          <div className="relative flex flex-col h-full w-full max-w-4xl mx-auto pb-24">
            {/* Header */}
            <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-emerald-400 font-bold text-sm uppercase">当前辩题</h2>
                <p className="text-slate-200 font-medium">{topic}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${userSide === DebateSide.PRO ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                  你：{userSide}
                </span>
              </div>
            </header>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
            >
              {history.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  辩论即将开始，请由你发起第一轮立论...
                </div>
              )}
              {history.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-message-in`}
                >
                  <span className="text-xs font-bold text-slate-500 mb-1 px-2 uppercase tracking-tighter">
                    {msg.senderName}
                  </span>
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-[4px_4px_0px_rgba(16,185,129,0.2)]' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start animate-pulse">
                  <span className="text-xs font-bold text-slate-500 mb-1 px-2 uppercase">{opponent.name} 思考中...</span>
                  <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none w-32 h-12 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入你的辩词..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[50px] max-h-[150px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="p-3 bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white shadow-lg hover:bg-emerald-500 transition-all flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Coach Panel */}
            {mode === GameMode.AI_CHALLENGE && (
              <CoachPanel analysis={coachAnalysis} loading={coachLoading} />
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden font-sans">
      <DanmakuLayer />
      <main className="flex-1 relative z-10 h-full overflow-hidden">
        {renderStep()}
      </main>

      {/* Persistent Nav (Reset button) */}
      {step !== 'start' && (
        <button 
          onClick={() => window.location.reload()}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
          title="退出辩论"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        </button>
      )}

      {/* Ambient Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes message-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-message-in { animation: message-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
