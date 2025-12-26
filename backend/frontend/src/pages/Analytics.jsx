import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CheckCircle, Circle, Plus, Trash2, TrendingUp, ShieldAlert, Bot, Loader2, Save, Activity, Award, Wind, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const Analytics = () => {
  const [moodLogs, setMoodLogs] = useState([]);
  const [erpTasks, setErpTasks] = useState([]);
  const [compulsions, setCompulsions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New Task State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [difficulty, setDifficulty] = useState(5);

  // AI Generation State
  const [showAiGen, setShowAiGen] = useState(false);
  const [fearTheme, setFearTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHierarchy, setGeneratedHierarchy] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moodRes, erpRes, compRes, insightRes] = await Promise.all([
        axios.get('http://localhost:5000/api/moods', { withCredentials: true }),
        axios.get('http://localhost:5000/api/erp', { withCredentials: true }),
        axios.get('http://localhost:5000/api/compulsions', { withCredentials: true }),
        axios.get('http://localhost:5000/api/analytics/insights', { withCredentials: true })
      ]);
      setMoodLogs(moodRes.data);
      setErpTasks(erpRes.data);
      setCompulsions(compRes.data);
      setInsights(insightRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await saveTask(taskTitle, difficulty);
    setTaskTitle('');
    setDifficulty(5);
    setShowTaskForm(false);
  };

  const saveTask = async (title, level) => {
    try {
      await axios.post('http://localhost:5000/api/erp', {
        title,
        difficultyLevel: level
      }, { withCredentials: true });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleGenerateHierarchy = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-erp', {
        fearTheme
      }, { withCredentials: true });
      setGeneratedHierarchy(res.data.hierarchy);
    } catch (error) {
      console.error('Error generating hierarchy', error);
      alert('Failed to generate hierarchy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedTask = async (task) => {
    await saveTask(task.title, task.difficulty);
    // Remove from generated list
    setGeneratedHierarchy(prev => prev.filter(t => t.title !== task.title));
  };

  const toggleTask = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/erp/${id}/toggle`, {}, { withCredentials: true });
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
      await axios.delete(`http://localhost:5000/api/erp/${id}`, { withCredentials: true });
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

  // Compulsion/Trigger Data for Heatmap (Pie/Bar)
  const compulsionCounts = compulsions.reduce((acc, curr) => {
      const name = curr.compulsionName || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
  }, {});

  const compulsionData = Object.keys(compulsionCounts).map(key => ({
      name: key,
      value: compulsionCounts[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Theme Data for Radar Chart
  const themeData = insights?.themes 
    ? Object.keys(insights.themes).map(key => ({
        subject: key,
        A: insights.themes[key],
        fullMark: 100
      }))
    : [];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Progress & Insights</h1>
        <p className="text-textSub">Visualize your recovery journey.</p>
      </header>
      
      {/* Tiny Wins & Drift Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Tiny Wins */}
         <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-yellow-100"
         >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-200 rounded-lg text-yellow-700">
                    <Award className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-yellow-800">Tiny Wins</h2>
            </div>
            {insights?.tinyWins?.length > 0 ? (
                <ul className="space-y-3">
                    {insights.tinyWins.map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-yellow-900 bg-white/60 p-3 rounded-lg">
                            <span className="text-xl">🎉</span>
                            <span>{win}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-yellow-700 opacity-70 italic">Keep tracking to unlock tiny wins!</p>
            )}
         </motion.section>

         {/* Symptom Drift */}
         <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100"
         >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-200 rounded-lg text-indigo-700">
                    <Wind className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-indigo-900">Symptom Drift</h2>
            </div>
            {insights?.drift?.length > 0 ? (
                <ul className="space-y-3">
                    {insights.drift.map((drift, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-indigo-900 bg-white/60 p-3 rounded-lg">
                            <span className="text-xl">🌊</span>
                            <span>{drift}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-indigo-700 opacity-70 italic">Not enough data for pattern detection yet.</p>
            )}
         </motion.section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                No mood data yet.
                </div>
            )}
            </div>
        </section>

        {/* Themes Radar Chart */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20">
            <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-textMain">Theme Analyzer</h2>
            </div>
            
            <div className="h-64 w-full flex items-center justify-center">
            {themeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={themeData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Intensity" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex items-center justify-center text-textSub bg-aliceBlue rounded-xl">
                Not enough data to analyze themes.
                </div>
            )}
            </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trigger Heatmap / Compulsion Frequency */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20">
            <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-textMain">Trigger Patterns</h2>
            </div>
            
            <div className="h-64 w-full flex items-center justify-center">
            {compulsionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={compulsionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {compulsionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex items-center justify-center text-textSub bg-aliceBlue rounded-xl">
                No compulsion logs yet.
                </div>
            )}
            </div>
            {compulsionData.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                    {compulsionData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-textMain">{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </div>

      {/* ERP Goals Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain">Exposure Goals (ERP)</h2>
              <p className="text-sm text-textSub">Face your fears gradually.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
              onClick={() => { setShowAiGen(!showAiGen); setShowTaskForm(false); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Generator</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button 
              onClick={() => { setShowTaskForm(!showTaskForm); setShowAiGen(false); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Goal</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* AI Generator Panel */}
        <AnimatePresence>
            {showAiGen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                >
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 mb-2">Generate ERP Hierarchy with AI</h3>
                        <form onSubmit={handleGenerateHierarchy} className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="What is your main fear? (e.g., Contamination, Harm, Perfectionism)"
                                className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={fearTheme}
                                onChange={(e) => setFearTheme(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={isGenerating || !fearTheme}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                Generate
                            </button>
                        </form>

                        {generatedHierarchy.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-indigo-800 mb-2">Suggested Hierarchy (Click to Save):</h4>
                                {generatedHierarchy.map((task, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 transition-colors group">
                                        <div>
                                            <p className="font-medium text-textMain">{task.title}</p>
                                            <p className="text-xs text-textSub">{task.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-indigo-400">Lvl {task.difficulty}</span>
                                            <button 
                                                onClick={() => saveGeneratedTask(task)}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Save to My Goals"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

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
