import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm MindEase AI. I'm here to support you with grounding techniques, reframing thoughts, or just to listen. How are you feeling right now?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat`, { message: userMessage.content });
      const botMessage = { role: 'assistant', content: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI Chat Error', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Help me reframe this thought",
    "Give me a grounding exercise",
    "Why do I feel anxious?",
    "Explain the OCD cycle"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-secondary/20 p-4 flex items-center gap-3 shadow-sm">
        <div className="bg-primary/10 p-2 rounded-full">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-textMain">AI Companion</h1>
          <p className="text-xs text-textSub">Supportive, non-medical guidance</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-surface border border-secondary/20 text-textMain rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-surface border border-secondary/20 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-secondary/20">
        {messages.length < 2 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-4 py-2 bg-background border border-secondary/30 rounded-full text-sm text-textSub hover:bg-primary/5 hover:border-primary/30 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 pl-4 pr-12 py-3 rounded-xl border border-secondary focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-textSub mt-2">
          MindEase AI provides general support and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
};

export default Chat;