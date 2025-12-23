import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [moodLogs, setMoodLogs] = useState([]);
  const [todayLogged, setTodayLogged] = useState(false);
  const [anxietyScore, setAnxietyScore] = useState(5);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchMoodLogs();
  }, []);

  const fetchMoodLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/moods');
      setMoodLogs(res.data);
      checkIfLoggedToday(res.data);
    } catch (error) {
      console.error('Error fetching logs', error);
    }
  };

  const checkIfLoggedToday = (logs) => {
    if (logs.length > 0) {
      const lastLogDate = new Date(logs[0].createdAt).toDateString();
      const today = new Date().toDateString();
      if (lastLogDate === today) {
        setTodayLogged(true);
      }
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/moods', {
        anxietyScore,
        note,
        moodLabel: anxietyScore > 7 ? 'High Anxiety' : anxietyScore > 4 ? 'Moderate' : 'Calm'
      });
      fetchMoodLogs();
      setTodayLogged(true);
      setNote('');
    } catch (error) {
      console.error('Error submitting log', error);
    }
  };

  // Prepare chart data (last 7 entries reversed)
  const chartData = moodLogs.slice(0, 7).reverse().map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'short' }),
    anxiety: log.anxietyScore
  }));

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hello, {user?.name}</h1>
          <p className="text-textSub">Let's track your progress today.</p>
        </div>
        <button onClick={logout} className="text-textSub hover:text-red-500 transition-colors">Logout</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface p-6 rounded-2xl shadow-sm border border-secondary/20"
          >
            <h2 className="text-xl font-semibold mb-4 text-textMain">Daily Check-in</h2>
            {todayLogged ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-green-600 font-medium">You've checked in today!</p>
                <p className="text-sm text-textSub mt-2">Great job keeping track.</p>
              </div>
            ) : (
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
            )}
          </motion.div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface p-6 rounded-2xl shadow-sm border border-secondary/20 h-full"
          >
            <h2 className="text-xl font-semibold mb-4 text-textMain">Anxiety Trends (Last 7 Logs)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" domain={[0, 10]} fontSize={12} />
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