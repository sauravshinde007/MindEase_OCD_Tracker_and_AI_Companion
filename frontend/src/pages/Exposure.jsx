import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { List, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const Exposure = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [fearTheme, setFearTheme] = useState('');
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!fearTheme.trim()) return;

    setLoading(true);
    setError('');
    setHierarchy(null);

    try {
      const res = await axios.post(`${API_URL}/api/ai/generate-erp`, {
        fearTheme
      }, { withCredentials: true });
      setHierarchy(res.data.hierarchy);
    } catch (err) {
      console.error("ERP Generation Error:", err);
      setError("Failed to generate hierarchy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
          <List className="w-8 h-8" />
          Exposure Hierarchy Generator
        </h1>
        <p className="text-textSecondary">
          Create a custom Exposure and Response Prevention (ERP) ladder to gradually face your fears.
        </p>
      </header>

      <div className="bg-surface rounded-xl shadow-lg p-6 border border-secondary/20 mb-8">
        <form onSubmit={handleGenerate} className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            value={fearTheme}
            onChange={(e) => setFearTheme(e.target.value)}
            placeholder="e.g., Contamination, Harm OCD, Social Anxiety..."
            className="flex-1 px-4 py-3 rounded-lg border border-secondary/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading || !fearTheme.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Generating...' : 'Generate Ladder'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {hierarchy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-textMain mb-4">Your Custom ERP Ladder</h2>
          {hierarchy.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface p-5 rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-textMain">{step.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  step.difficulty <= 3 ? 'bg-green-100 text-green-700' :
                  step.difficulty <= 7 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Difficulty: {step.difficulty}/10
                </span>
              </div>
              <p className="text-textSecondary">{step.description}</p>
            </motion.div>
          ))}
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-8 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Start with the lowest difficulty items. Repeat each exposure until your anxiety drops by at least 50% before moving to the next step.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Exposure;
