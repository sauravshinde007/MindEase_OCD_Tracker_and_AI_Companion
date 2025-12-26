import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Heart, Lock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aliceBlue to-white flex flex-col">
      <nav className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">MindEase</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-textSub hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-indigo-100 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6 inline-block">
            Your Companion for OCD Recovery
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-textMain mb-6 leading-tight">
            Find Calm in the <span className="text-primary">Chaos</span>
          </h2>
          <p className="text-xl text-textSub mb-10 max-w-2xl mx-auto leading-relaxed">
            A safe, private space to track your journey, manage triggers, and find support through AI-guided cognitive behavioral techniques.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-white text-textMain border border-secondary/20 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all">
              I have an account
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/10"
          >
            <div className="p-3 bg-red-50 rounded-xl w-fit mb-4">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compassionate AI</h3>
            <p className="text-textSub">24/7 support grounded in CBT and ERP principles to help you through difficult moments.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/10"
          >
            <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-textSub">Monitor your anxiety levels, identify triggers, and celebrate your victories over time.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/10"
          >
            <div className="p-3 bg-green-50 rounded-xl w-fit mb-4">
              <Lock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Private & Secure</h3>
            <p className="text-textSub">Your thoughts are yours alone. We prioritize privacy with client-side encryption options.</p>
          </motion.div>
        </div>
      </main>
      
      <footer className="p-6 text-center text-textSub text-sm">
        © 2024 MindEase. Not a replacement for professional therapy.
      </footer>
    </div>
  );
};

export default Landing;