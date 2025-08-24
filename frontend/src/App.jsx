import React from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import Homepage from './pages/Homepage';
import './App.css';
import Login from './components/login';

import AiAgentChatApp from './pages/ai-agent-chat-app';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/dashboard';


function App() {
  return (
    <div className="App">
      
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<AiAgentChatApp />} />
      </Routes>
    </div>
  );
}

export default App;