import React from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import Homepage from './pages/Homepage';
import './App.css';
import AiAgentChatApp from './pages/ai-agent-chat-app';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <div className="App">
      <Dashboard />
      {/* <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat" element={<ProtectedRoute><AiAgentChatApp /></ProtectedRoute>} />
      </Routes> */}
    </div>
  );
}

export default App;