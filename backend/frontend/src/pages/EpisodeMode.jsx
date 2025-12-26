import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EpisodeMode = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Breathing, 1: Grounding, 2: Delay Timer
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for delay
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [groundingCount, setGroundingCount] = useState(0);

  // Breathing Animation
  const breathingVariants = {
    inhale: { scale: 1.5, opacity: 0.8, transition: { duration: 4 } },
    exhale: { scale: 1, opacity: 0.4, transition: { duration: 4 } }
  };

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleExit = () => {
    // Ideally log this episode to backend here
    navigate('/dashboard');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950 z-0" />

      {/* Exit Button */}
      <button 
        onClick={handleExit}
        className="absolute top-6 right-6 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="z-10 w-full max-w-md text-center">
        
        {/* Step 0: Breathing */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold mb-8 tracking-wide">Breathe with me</h1>
            <div className="relative flex items-center justify-center w-64 h-64 mb-12">
              <motion.div 
                className="absolute w-48 h-48 bg-indigo-500 rounded-full blur-xl"
                variants={breathingVariants}
                animate="inhale"
                initial="exhale"
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 4 }}
              />
              <motion.div 
                className="absolute w-32 h-32 bg-indigo-300 rounded-full"
                variants={breathingVariants}
                animate="inhale"
                initial="exhale"
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 4 }}
              />
              <p className="z-10 text-xl font-medium text-indigo-900">Inhale... Exhale...</p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-indigo-600 rounded-full font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
            >
              I'm ready for next step
            </button>
          </motion.div>
        )}

        {/* Step 1: Grounding */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="text-left"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">5-4-3-2-1 Grounding</h2>
            <div className="space-y-4">
              {[
                "Name 5 things you can see",
                "Name 4 things you can touch",
                "Name 3 things you can hear",
                "Name 2 things you can smell",
                "Name 1 thing you can taste"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${groundingCount > index ? 'bg-green-500 text-white' : 'bg-white/20 text-white/50'}`}>
                    {groundingCount > index ? <Check className="w-5 h-5" /> : 5 - index}
                  </div>
                  <p className={groundingCount > index ? 'opacity-50 line-through' : ''}>{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
               <button 
                onClick={() => setGroundingCount(prev => Math.min(prev + 1, 5))}
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                disabled={groundingCount >= 5}
              >
                Next Item
              </button>
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-indigo-600 rounded-full font-medium hover:bg-indigo-500 transition-all"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Delay Timer */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold mb-2">Delay the Urge</h2>
            <p className="text-white/60 mb-8">Can you wait just 2 minutes?</p>
            
            <div className="text-6xl font-mono font-bold mb-8 tabular-nums">
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-indigo-50 transition-colors"
              >
                {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 pl-1" />}
              </button>
            </div>

            {timeLeft === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200"
              >
                <p className="font-bold">You did it!</p>
                <p className="text-sm">The urge might feel weaker now.</p>
              </motion.div>
            )}

            <button 
              onClick={handleExit}
              className="mt-12 text-white/50 hover:text-white transition-colors"
            >
              I feel better now, exit mode
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EpisodeMode;
