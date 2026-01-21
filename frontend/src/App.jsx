import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import AiCompanion from './pages/AiCompanion';
import Analytics from './pages/Analytics';
import Exposure from './pages/Exposure';
import EpisodeMode from './pages/EpisodeMode';
import Community from './pages/Community';
import CBTTherapy from './pages/CBTTherapy';
import DelayHistory from './pages/DelayHistory';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-textMain font-sans">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={<PrivateRoute />}>
                <Route path="/episode-mode" element={<EpisodeMode />} />
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/exposure" element={<Exposure />} />
                    <Route path="/ai-companion" element={<AiCompanion />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/cbt-therapy" element={<CBTTherapy />} />
                    <Route path="/delay-history" element={<DelayHistory />} />
                </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
