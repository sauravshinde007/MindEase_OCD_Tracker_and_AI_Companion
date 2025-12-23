import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, Circle, Plus, Trash2, TrendingUp, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const Analytics = () => {
  const [moodLogs, setMoodLogs] = useState([]);
  const [erpTasks, setErpTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Task State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [difficulty, setDifficulty] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moodRes, erpRes] = await Promise.all([
        axios.get('http://localhost:5000/api/moods'),
        axios.get('http://localhost:5000/api/erp')
      ]);
      setMoodLogs(moodRes.data);
      setErpTasks(erpRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/erp', {
        title: taskTitle,
        difficultyLevel: difficulty
      });
      setTaskTitle('');
      setDifficulty(5);
      setShowTaskForm(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const toggleTask = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/erp/${id}/toggle`);
      setErpTasks(prev => prev.map(t => 
        t._id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ));
    } catch (error) {
      console.error('Error toggling task', error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/erp/${id}`);
      setErpTasks(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  // Prepare Chart Data (Last 7 days)
  const chartData = moodLogs
    .slice(0, 7)
    .reverse()
    .map(log => ({
      date: format(parseISO(log.createdAt), 'MMM d'),
      anxiety: log.anxietyScore
    }));

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Progress & Exposure</h1>
        <p className="text-textSub">Track your anxiety trends and manage your ERP goals.</p>
      </header>

      {/* Charts Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-textMain">Anxiety Trends</h2>
        </div>
        
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="anxiety" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-textSub bg-aliceBlue rounded-xl">
              No mood data yet. Check in on the Dashboard!
            </div>
          )}
        </div>
      </section>

      {/* ERP Goals Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain">Exposure Goals (ERP)</h2>
              <p className="text-sm text-textSub">Face your fears gradually.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        </div>

        <AnimatePresence>
          {showTaskForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateTask}
              className="mb-6 p-4 bg-aliceBlue rounded-xl space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Challenge / Exposure</label>
                <input 
                  type="text" 
                  placeholder="e.g., Touch doorknob without washing hands" 
                  className="w-full px-4 py-2 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Difficulty (1-10)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  className="w-full accent-primary"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                />
                <div className="text-right text-sm text-primary font-bold">{difficulty}/10</div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-textSub hover:bg-white rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">Save Goal</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {erpTasks.map((task) => (
            <motion.div 
              key={task._id}
              layout
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                task.isCompleted ? 'bg-green-50 border-green-100' : 'bg-white border-secondary/10 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleTask(task._id)}
                  className={`transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-primary'}`}
                >
                  {task.isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <div>
                  <h3 className={`font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-textMain'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.difficultyLevel > 7 ? 'bg-red-100 text-red-600' : 
                      task.difficultyLevel > 4 ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      Level {task.difficultyLevel}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteTask(task._id)}
                className="p-2 text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          
          {erpTasks.length === 0 && !showTaskForm && (
            <div className="text-center py-10 text-gray-400">
              No exposure goals set yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Analytics;