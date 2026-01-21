import { useState } from 'react';
import { Brain, CheckCircle, RefreshCw, Save } from 'lucide-react';
import api from '../utils/api';

const CBTTherapy = () => {
  const [thought, setThought] = useState('');
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balancedThought, setBalancedThought] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your entries?')) {
      setThought('');
      setEvidenceFor('');
      setEvidenceAgainst('');
      setBalancedThought('');
      setSaveMessage('');
    }
  };

  const handleSaveToJournal = async () => {
    if (!thought && !evidenceFor && !evidenceAgainst && !balancedThought) {
        alert("Please write something before saving.");
        return;
    }

    setIsSaving(true);
    setSaveMessage('');

    const content = `
**CBT Thought Challenge Session**

**1. Intrusive Thought:**
${thought || 'N/A'}

**2. Evidence For:**
${evidenceFor || 'N/A'}

**2. Evidence Against:**
${evidenceAgainst || 'N/A'}

**3. Balanced Thought:**
${balancedThought || 'N/A'}
    `;

    try {
        await api.post('/api/journal', {
            title: `CBT Session - ${new Date().toLocaleDateString()}`,
            content: content,
            tags: ['CBT', 'Therapy', 'Thought Challenge'],
            isPrivate: false 
        });
        setSaveMessage('Successfully saved to Journal!');
        setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
        console.error('Error saving CBT session', error);
        setSaveMessage('Failed to save. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Brain className="w-8 h-8" />
          CBT Therapy Tools
        </h1>
        <p className="text-textSub mt-2">
          Cognitive Behavioral Therapy (CBT) exercises to help you manage intrusive thoughts and OCD.
        </p>
      </header>

      {/* Section 1: What is CBT? */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-primary mb-3">What is CBT?</h2>
        <p className="text-textMain leading-relaxed">
          Cognitive Behavioral Therapy (CBT) is a structured, practical approach to solving problems. 
          For OCD, it involves identifying and challenging distorted thoughts ("obsessions") and changing 
          the behavioral patterns ("compulsions") that result from them. This tool helps you catch 
          intrusive thoughts, examine the evidence, and replace them with more balanced perspectives.
        </p>
      </section>

      {/* Section 2: Identify the Thought */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-bold">Identify the Thought</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-textSub mb-2">
            What intrusive thought are you experiencing right now?
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
            placeholder="e.g., If I don't check the lock, someone will break in..."
          />
        </div>
      </section>

      {/* Section 3: Challenge the Thought */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-bold">Challenge the Thought</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textSub mb-2">
              What evidence supports this thought?
            </label>
            <textarea
              value={evidenceFor}
              onChange={(e) => setEvidenceFor(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-32"
              placeholder="Stick to facts, not feelings..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSub mb-2">
              What evidence goes against it?
            </label>
            <textarea
              value={evidenceAgainst}
              onChange={(e) => setEvidenceAgainst(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-32"
              placeholder="Has this fear come true before? What would you tell a friend?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textSub mb-2">
            Is this a cognitive distortion?
          </label>
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-textSub">
            Common distortions: <strong>Catastrophizing</strong> (expecting disaster), <strong>All-or-Nothing Thinking</strong> (black & white), <strong>Emotional Reasoning</strong> (I feel it, so it must be true).
          </div>
        </div>
      </section>

      {/* Section 4: Replace with Balanced Thought */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">3</div>
          <h2 className="text-xl font-bold">Replace with Balanced Thought</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-textSub mb-2">
            Write a more realistic and balanced thought.
          </label>
          <textarea
            value={balancedThought}
            onChange={(e) => setBalancedThought(e.target.value)}
            className="w-full p-4 rounded-xl border border-green-200 bg-green-50/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none h-24"
            placeholder="e.g., Even though I feel anxious, the door is likely locked because I always check it once..."
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-4">
            <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-textSub hover:bg-gray-100 transition-colors font-medium"
            >
            <RefreshCw className="w-5 h-5" />
            Clear All
            </button>
            <button
            onClick={handleSaveToJournal}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-opacity-90 transition-colors font-medium shadow-md disabled:opacity-50"
            >
            {isSaving ? (
                <span className="animate-pulse">Saving...</span>
            ) : (
                <>
                <Save className="w-5 h-5" />
                Save to Journal
                </>
            )}
            </button>
        </div>
        {saveMessage && (
            <p className={`text-sm ${saveMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMessage}
            </p>
        )}
      </div>

      {/* Disclaimer */}
      <footer className="text-center text-xs text-gray-400 mt-12 pb-6">
        <p>⚠️ This tool is for self-help and educational purposes only. It does not replace professional therapy or medical advice.</p>
      </footer>
    </div>
  );
};

export default CBTTherapy;
