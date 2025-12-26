import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Lock, Unlock, Calendar as CalendarIcon, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CryptoJS from 'crypto-js';
import { format, isSameDay, parseISO } from 'date-fns';

const SECRET_KEY = 'MINDEASE_CLIENT_SECRET'; // In prod, this should be user-defined

const Journal = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/journal`);
      setEntries(res.data);
    } catch (error) {
      console.error('Error fetching journal', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalContent = content;
      if (isPrivate) {
        finalContent = CryptoJS.AES.encrypt(content, SECRET_KEY).toString();
      }
      
      await axios.post(`${API_URL}/api/journal`, {
        title,
        content: finalContent,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        isPrivate
      });
      fetchEntries();
      resetForm();
    } catch (error) {
      console.error('Error creating entry', error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/journal/${id}`);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
    setIsPrivate(false);
    setShowForm(false);
  };

  const getDecryptedContent = (encryptedContent) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return 'Error decrypting content';
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter 
      ? isSameDay(parseISO(entry.createdAt), parseISO(dateFilter))
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">OCD Journal</h1>
          <p className="text-textSub">Safe space for your thoughts and reflections.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSub w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search title or tags..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date Filter */}
          <div className="relative">
             <input 
              type="date" 
              className="pl-4 pr-4 py-2 rounded-lg border border-secondary focus:outline-none focus:ring-2 focus:ring-primary text-textSub"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white p-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 px-4 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">New Entry</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-secondary/20"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Title (e.g., Morning Anxiety)" 
                className="w-full text-xl font-bold border-b border-secondary/20 pb-2 focus:outline-none focus:border-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea 
                placeholder="Write your thoughts here... (Markdown supported)" 
                className="w-full h-40 p-4 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-4">
                <input 
                  type="text" 
                  placeholder="Tags (comma separated)" 
                  className="flex-1 px-4 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isPrivate ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {isPrivate ? 'Private' : 'Public'}
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-2 rounded-lg text-textSub hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <motion.div 
            key={entry._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20 hover:shadow-md transition-shadow relative group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-textMain">{entry.title}</h3>
              {entry.isPrivate && <Lock className="w-4 h-4 text-indigo-400" />}
            </div>
            
            <div className="text-sm text-textSub mb-4">
              {format(parseISO(entry.createdAt), 'MMM d, yyyy • h:mm a')}
            </div>

            <div className="prose prose-sm prose-indigo mb-4 max-h-40 overflow-hidden text-textMain/80">
              {entry.isPrivate ? (
                <div className="italic text-gray-400 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Encrypted Content
                </div>
              ) : (
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              )}
            </div>

            {/* Private Content Reveal - Simple Toggle for UX */}
            {entry.isPrivate && (
              <details className="mb-4 text-sm text-indigo-600 cursor-pointer">
                <summary>Click to reveal (Decrypted)</summary>
                <div className="mt-2 p-3 bg-indigo-50 rounded-lg text-textMain prose prose-sm">
                  <ReactMarkdown>{getDecryptedContent(entry.content)}</ReactMarkdown>
                </div>
              </details>
            )}

            <div className="flex flex-wrap gap-2 mt-auto">
              {entry.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>

            <button 
              onClick={() => handleDelete(entry._id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all bg-white rounded-full shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
      
      {filteredEntries.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <p>No entries found. Start writing your journey.</p>
        </div>
      )}
    </div>
  );
};

export default Journal;