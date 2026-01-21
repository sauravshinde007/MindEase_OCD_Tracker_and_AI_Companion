import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Timer, Zap, AlertTriangle, Play, Square, Check, XCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moodLogs, setMoodLogs] = useState([]);
  const [anxietyScore, setAnxietyScore] = useState(5);
  const [note, setNote] = useState('');

  // Compulsion Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [compulsionName, setCompulsionName] = useState('');
  const [showTimerForm, setShowTimerForm] = useState(false);

  useEffect(() => {
    fetchMoodLogs();
  }, []);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchMoodLogs = async () => {
    try {
      const res = await api.get('/api/moods');
      setMoodLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs', error);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/moods', {
        anxietyScore,
        note,
        moodLabel: anxietyScore > 7 ? 'High Anxiety' : anxietyScore > 4 ? 'Moderate' : 'Calm'
      });
      fetchMoodLogs();
      setNote('');
    } catch (error) {
      console.error('Error submitting log', error);
    }
  };

  const handleStartTimer = () => {
    if (!compulsionName.trim()) return alert("Please name the urge first.");
    setTimerRunning(true);
  };

  const handleStopTimer = async (didResist) => {
    setTimerRunning(false);
    
    // Calculate Score: 10 points per minute resisted
    const points = Math.floor(timerSeconds / 60) * 10 + (didResist ? 50 : 0);
    const resistanceMinutes = Math.floor(timerSeconds / 60);

    const newEntry = { 
        duration: formatTime(timerSeconds), 
        date: new Date().toLocaleDateString(), 
        time: new Date().toLocaleTimeString(),
        didResist 
    };
    const history = JSON.parse(localStorage.getItem('delayTimerHistory') || '[]');
    localStorage.setItem('delayTimerHistory', JSON.stringify([newEntry, ...history]));

    try {
      await api.post('/api/compulsions', {
        compulsionName,
        durationMinutes: 0, // Assuming duration of act is 0 for now
        resistanceDuration: resistanceMinutes,
        didResist,
        anxietyLevelBefore: 5, // Default for now
        notes: `Resistance Score: ${points}`
      });

      alert(didResist 
        ? `Amazing! You resisted for ${formatTime(timerSeconds)} and earned ${points} points!` 
        : `Good try! You delayed for ${formatTime(timerSeconds)}. Keep going!`);
      
      setTimerSeconds(0);
      setCompulsionName('');
      setShowTimerForm(false);
    } catch (error) {
      console.error("Error logging compulsion", error);
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Prepare chart data (last 7 entries reversed)
  const chartData = moodLogs.slice(0, 7).reverse().map(log => {
    let dateStr = '';
    try {
        dateStr = new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'short' });
    } catch (e) {
        dateStr = 'N/A';
    }
    return {
        date: dateStr,
        anxiety: log.anxietyScore
    };
  });

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hello, {user?.name}</h1>
          <p className="text-textSub">Let's track your progress today.</p>
        </div>
        <div className="flex items-center gap-4">
            <Link 
                to="/episode-mode"
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 animate-pulse"
            >
                <Zap className="w-5 h-5" />
                <span className="font-bold">Episode Mode</span>
            </Link>
            <button onClick={logout} className="text-textSub hover:text-red-500 transition-colors">Logout</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compulsion Resistance Timer (New) */}
        <div className="lg:col-span-1">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800 h-full relative overflow-hidden"
             >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Timer className="w-6 h-6 text-indigo-300" />
                        <h2 className="text-xl font-semibold">Compulsion Timer</h2>
                    </div>

                    {!timerRunning ? (
                        <div className="space-y-4">
                            <p className="text-indigo-200 text-sm">Feeling an urge? Delay it to build resistance strength.</p>
                            {!showTimerForm ? (
                                <button 
                                    onClick={() => setShowTimerForm(true)}
                                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5" /> I feel an urge
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="What is the urge?" 
                                        className="w-full px-4 py-2 rounded-lg bg-indigo-950/50 border border-indigo-700 text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-500"
                                        value={compulsionName}
                                        onChange={(e) => setCompulsionName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setShowTimerForm(false)}
                                            className="flex-1 py-2 bg-transparent hover:bg-indigo-800 rounded-lg text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleStartTimer}
                                            className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg font-medium"
                                        >
                                            Start Timer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-indigo-300 mb-2">Resisting: {compulsionName}</p>
                            <div className="text-5xl font-mono font-bold mb-6 tabular-nums tracking-wider">
                                {formatTime(timerSeconds)}
                            </div>
                            <div className="flex gap-3 flex-col sm:flex-row">
                                <button 
                                    onClick={() => handleStopTimer(false)}
                                    className="flex-1 py-2 px-4 bg-red-500/20 text-red-200 hover:bg-red-500/30 rounded-lg flex items-center justify-center gap-2 border border-red-500/30"
                                >
                                    <XCircle className="w-4 h-4" /> Gave In
                                </button>
                                <button 
                                    onClick={() => handleStopTimer(true)}
                                    className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-400 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    <Check className="w-4 h-4" /> Resisted!
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl -ml-10 -mb-10"></div>
             </motion.div>
        </div>

        {/* Daily Check-in Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface p-6 rounded-2xl shadow-sm border border-secondary/20 h-full"
          >
            <h2 className="text-xl font-semibold mb-4 text-textMain">Check-in</h2>
            <p className="text-sm text-textSub mb-4">How are you feeling right now?</p>
              <form onSubmit={handleCheckIn}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-textSub mb-2">
                    Anxiety Level: {anxietyScore}
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={anxietyScore} 
                    onChange={(e) => setAnxietyScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-textSub mt-1">
                    <span>Calm</span>
                    <span>Panic</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-textSub mb-2">Quick Note</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-lg border border-secondary focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    placeholder="How are you feeling?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Save Check-in
                </button>
              </form>
          </motion.div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface p-6 rounded-2xl shadow-sm border border-secondary/20 h-full"
          >
            <h2 className="text-xl font-semibold mb-4 text-textMain">Anxiety Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" domain={[0, 10]} fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="anxiety" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    dot={{ fill: '#818cf8', strokeWidth: 2 }}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Recent Logs List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-textMain">Recent Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moodLogs.slice(0, 3).map((log) => (
            <div key={log._id} className="bg-white p-4 rounded-xl shadow-sm border border-secondary/10">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  log.anxietyScore > 7 ? 'bg-red-100 text-red-600' : 
                  log.anxietyScore > 4 ? 'bg-yellow-100 text-yellow-600' : 
                  'bg-green-100 text-green-600'
                }`}>
                  Anxiety: {log.anxietyScore}
                </span>
                <span className="text-xs text-textSub">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-textMain">{log.note || 'No note added.'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
