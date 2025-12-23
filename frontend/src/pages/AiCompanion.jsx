import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AiCompanion = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      content: "Hello. I'm MindEase AI. I'm here to support you through difficult moments with CBT and ERP-based techniques. How are you feeling right now?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: userMsg.content });
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message', error);
      const errorMsg = { id: Date.now() + 1, role: 'ai', content: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] md:h-screen flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">AI Companion</h1>
          <p className="text-textSub text-sm">Always here to listen and guide (Not medical advice).</p>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-secondary/20 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-aliceBlue text-textMain rounded-bl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  <span>{msg.role === 'user' ? 'You' : 'MindEase AI'}</span>
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
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-secondary/20 bg-gray-50 flex gap-2">
          <input 
            type="text" 
            placeholder="Type your message here..." 
            className="flex-1 px-4 py-3 rounded-xl border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-primary text-white p-3 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCompanion;