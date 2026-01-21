import { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';

const DelayHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load from local storage
    const storedHistory = localStorage.getItem('delayTimerHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Clock className="w-8 h-8" />
          Delay Timer History
        </h1>
        <p className="text-textSub mt-2">
          Track your progress in delaying urges.
        </p>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-textMain">No delay records yet</h3>
          <p className="text-textSub mt-2">Complete a delay timer to see your progress here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {history.map((entry, index) => {
              const isResisted = entry.didResist !== false; // Default to true for old data
              return (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className={`font-bold text-lg flex items-center gap-2 ${isResisted ? 'text-green-600' : 'text-red-500'}`}>
                      {isResisted ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {entry.duration}
                    </div>
                    <div className={`text-sm font-medium ${isResisted ? 'text-green-600/70' : 'text-red-500/70'}`}>
                      {isResisted ? 'Resisted successfully' : 'Gave in to urge'}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-textMain flex items-center gap-2 justify-end">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {entry.date}
                    </div>
                    <div className="text-xs text-textSub mt-1">
                      {entry.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DelayHistory;
