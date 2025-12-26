import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, RefreshCw, BrainCircuit, MessageSquare, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const AiCompanion = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [mode, setMode] = useState('chat'); // 'chat' | 'deconstruct' | 'check-in'
  
  // Chat State
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      content: "Hello. I'm MindEase AI. I'm here to support you through difficult moments with CBT and ERP-based techniques. How are you feeling right now?" 
    }
  ]);
  const [input, setInput] = useState('');
  
  // Check-in State
  const [checkInMessages, setCheckInMessages] = useState([
    {
        id: 1,
        role: 'ai',
        content: "Hi there. I'm your Check-in Coach. Instead of just picking a number, tell me how you're feeling today? What's weighing on your mind?"
    }
  ]);
  const [checkInInput, setCheckInInput] = useState('');

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const checkInEndRef = useRef(null);

  // Deconstruction State
  const [thoughtInput, setThoughtInput] = useState('');
  const [deconstructionResult, setDeconstructionResult] = useState(null);
  const [isDeconstructing, setIsDeconstructing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    checkInEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, checkInMessages, mode]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat`, { message: userMsg.content }, { withCredentials: true });
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message', error);
      if (error.response && error.response.status === 401) {
          // Handled by AuthContext interceptor (redirects to login)
          return;
      }
      const errorMsg = { id: Date.now() + 1, role: 'ai', content: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sendCheckInMessage = async (e) => {
    e.preventDefault();
    if (!checkInInput.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: checkInInput };
    setCheckInMessages(prev => [...prev, userMsg]);
    setCheckInInput('');
    setLoading(true);

    try {
        const res = await axios.post(`${API_URL}/api/ai/check-in`, { 
            message: userMsg.content,
            history: checkInMessages.map(m => ({ sender: m.role, text: m.content }))
        }, { withCredentials: true });
        
        const aiMsg = { id: Date.now() + 1, role: 'ai', content: res.data.reply };
        setCheckInMessages(prev => [...prev, aiMsg]);
        
        if (res.data.analysis) {
             // Visual feedback for logged mood
             const logMsg = { 
                 id: Date.now() + 2, 
                 role: 'system', 
                 content: `✨ Mood Logged: ${res.data.analysis.moodLabel} (Anxiety: ${res.data.analysis.anxietyScore}/10)` 
             };
             setCheckInMessages(prev => [...prev, logMsg]);
        }
    } catch (error) {
      console.error('Error sending check-in', error);
      if (error.response && error.response.status === 401) {
          return;
      }
      const errorMsg = { id: Date.now() + 1, role: 'ai', content: "I'm having trouble connecting right now." };
      setCheckInMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeconstruct = async (e) => {
    e.preventDefault();
    if (!thoughtInput.trim()) return;

    setIsDeconstructing(true);
    setDeconstructionResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/ai/deconstruct-thought`, { 
        thought: thoughtInput 
      }, { withCredentials: true });
      setDeconstructionResult(res.data.analysis);
    } catch (error) {
      console.error("Deconstruction error", error);
      alert("Failed to analyze thought.");
    } finally {
      setIsDeconstructing(false);
    }
  };

  const renderChatInterface = (msgs, inputVal, setInputVal, submitHandler, endRef) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-secondary/20 overflow-hidden flex flex-col"
    >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((msg) => (
            <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
            <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : msg.role === 'system'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-aliceBlue text-textMain rounded-bl-none'
            }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : msg.role === 'system' ? <HeartPulse className="w-3 h-3"/> : <Bot className="w-3 h-3" />}
                <span>{msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'MindEase AI'}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
            </motion.div>
        ))}
        {loading && (
            <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex justify-start"
            >
            <div className="bg-aliceBlue p-4 rounded-2xl rounded-bl-none flex items-center gap-2 text-textSub">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Thinking...
            </div>
            </motion.div>
        )}
        <div ref={endRef} />
        </div>

        <form onSubmit={submitHandler} className="p-4 border-t border-secondary/20 bg-gray-50 flex gap-2">
        <input 
            type="text" 
            placeholder="Type your message here..." 
            className="flex-1 px-4 py-3 rounded-xl border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
        />
        <button 
            type="submit" 
            disabled={loading || !inputVal.trim()}
            className="bg-primary text-white p-3 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Send className="w-5 h-5" />
        </button>
        </form>
    </motion.div>
  );

  return (
    <div className="h-[calc(100vh-2rem)] md:h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">AI Companion</h1>
            <p className="text-textSub text-sm">CBT & ERP Support Assistant</p>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="bg-white p-1 rounded-xl border border-secondary/20 flex shadow-sm">
            <button 
                onClick={() => setMode('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${mode === 'chat' ? 'bg-primary text-white shadow-md' : 'text-textSub hover:bg-gray-50'}`}
            >
                <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button 
                onClick={() => setMode('check-in')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${mode === 'check-in' ? 'bg-green-600 text-white shadow-md' : 'text-textSub hover:bg-gray-50'}`}
            >
                <HeartPulse className="w-4 h-4" /> Check-in Coach
            </button>
            <button 
                onClick={() => setMode('deconstruct')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${mode === 'deconstruct' ? 'bg-indigo-600 text-white shadow-md' : 'text-textSub hover:bg-gray-50'}`}
            >
                <BrainCircuit className="w-4 h-4" /> Deconstruct
            </button>
        </div>
      </header>

      {mode === 'chat' && renderChatInterface(messages, input, setInput, sendMessage, messagesEndRef)}
      {mode === 'check-in' && renderChatInterface(checkInMessages, checkInInput, setCheckInInput, sendCheckInMessage, checkInEndRef)}
      
      {mode === 'deconstruct' && (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white rounded-2xl shadow-sm border border-secondary/20 overflow-hidden flex flex-col p-6 overflow-y-auto"
        >
            <div className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-indigo-900 mb-2">Thought Deconstruction</h2>
                    <p className="text-textSub">Break down intrusive thoughts using CBT principles. Identify distortions and reframe.</p>
                </div>

                <form onSubmit={handleDeconstruct} className="mb-8">
                    <label className="block text-sm font-medium text-textMain mb-2">What is the intrusive thought?</label>
                    <div className="flex gap-2">
                        <textarea 
                            className="flex-1 p-4 rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50 resize-none h-32"
                            placeholder="e.g., If I don't check the lock 5 times, someone will break in."
                            value={thoughtInput}
                            onChange={(e) => setThoughtInput(e.target.value)}
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isDeconstructing || !thoughtInput.trim()}
                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeconstructing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                        Deconstruct Thought
                    </button>
                </form>

                {deconstructionResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100"
                    >
                        <h3 className="font-bold text-indigo-900 mb-4">Analysis Result</h3>
                        <div className="space-y-4">
                            {typeof deconstructionResult === 'string' ? (
                                <p>{deconstructionResult}</p>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">Cognitive Distortion</h4>
                                        <p className="text-indigo-900">{deconstructionResult.analysis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">Challenge Question</h4>
                                        <p className="text-indigo-900 italic">"{deconstructionResult.challenge}"</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">Reframed Thought</h4>
                                        <p className="text-green-700 font-medium bg-green-50 p-3 rounded-lg border border-green-100">
                                            {deconstructionResult.reframe}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
      )}
    </div>
  );
};

export default AiCompanion;
