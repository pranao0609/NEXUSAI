import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, CheckCircle, Clock, Circle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AiAgentChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  const [inputValue, setInputValue] = useState('');
  const [agents, setAgents] = useState([
    { id: 1, name: 'Context Analyzer', status: 'completed', description: 'Understanding request' },
    { id: 2, name: 'Web Search Agent', status: 'active', description: 'Executing search query' },
    { id: 3, name: 'Data Synthesis', status: 'pending', description: 'Waiting to process' },
    { id: 4, name: 'Response Generator', status: 'pending', description: 'Ready to format' }
  ]);
  
  const messagesEndRef = useRef(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUserData(JSON.parse(localUserData));
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
        localStorage.setItem('user', JSON.stringify(response.data));
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data, redirecting to login.');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user'
      };
      setMessages([...messages, userMessage]);
      
      // Add initial AI response
      const initialAiResponse = {
        id: messages.length + 2,
        text: "I'm processing your request and gathering the information you need. This will just take a moment.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, initialAiResponse]);
      
      // Update agents status
      setAgents(prev => prev.map(agent => {
        if (agent.id === 1) return { ...agent, status: 'completed' };
        if (agent.id === 2) return { ...agent, status: 'active' };
        return { ...agent, status: 'pending' };
      }));
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.post(`${API_BASE_URL}/pipeline`, null, {
          params: {
            source: 'wiki',
            query: inputValue,
            title: 'Generated Report',
            audience: 'General'
          },
          withCredentials: true,
          responseType: 'json'
        });
        
        // Update agents status
        setAgents(prev => prev.map(agent => {
          if (agent.id === 2) return { ...agent, status: 'completed' };
          if (agent.id === 3) return { ...agent, status: 'active' };
          return agent;
        }));
        
        // Get the first summary from the response
        const responseData = response.data;
        let summaryText = "I couldn't find any relevant information.";
        
        if (responseData && responseData.docs && responseData.docs.length > 0) {
          // Use the first document (index 0) instead of -1 which is invalid in JavaScript
          summaryText = responseData.docs[0].metadata.summary;
        }
        
        // Update the AI response with the actual data
        setMessages(prev => prev.map(msg => {
          if (msg.id === initialAiResponse.id) {
            return { ...msg, text: summaryText };
          }
          return msg;
        }));
        
        // Update agents status to show failure
        setAgents(prev => prev.map(agent => {
          if (agent.id === 2 || agent.id === 3) return { ...agent, status: 'failed' };
          return agent;
        }));
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again later.";
        
        // Check for specific error types
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Authentication error: The API key for the AI service appears to be invalid or expired. Please contact the administrator.";
          } else if (error.response.status === 500) {
            errorMessage = "The server encountered an internal error. This might be due to an issue with the AI service. Please try again later.";
          }
        }
        
        // Update the AI response with error message
        setMessages(prev => prev.map(msg => {
          if (msg.id === initialAiResponse.id) {
            return { ...msg, text: errorMessage };
          }
          return msg;
        }));
      }
      
      setInputValue('');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Circle className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AI Agent Assistant</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">{userData?.username || 'User'}</span>
          <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="group"
                >
                  {message.sender === 'user' ? (
                    <div className="flex justify-end mb-1">
                      <span className="text-xs text-gray-500 mr-2">You</span>
                    </div>
                  ) : (
                    <div className="flex justify-start mb-1">
                      <span className="text-xs text-gray-500 ml-2">AI Assistant</span>
                    </div>
                  )}
                  <div className={`relative ${message.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div className={`px-5 py-4 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                        : 'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200'
                    }`}>
                      <p className={`text-sm leading-relaxed ${
                        message.sender === 'user' ? 'text-gray-800' : 'text-gray-700'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSend}
                className="w-11 h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Panel */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Live Workflow</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  agent.status === 'active'
                    ? 'bg-white border-2 border-blue-500 shadow-lg transform scale-105'
                    : agent.status === 'completed'
                    ? 'bg-white border border-gray-200 opacity-75'
                    : 'bg-white border border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(agent.status)}
                      <h3 className={`font-medium ${
                        agent.status === 'active' ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {agent.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">{agent.description}</p>
                  </div>
                  {agent.status === 'active' && (
                    <div className="flex items-center space-x-1 ml-3">
                      <span className="text-sm font-medium text-blue-600">Executing</span>
                      <span className="text-blue-600 font-bold">{dots}</span>
                    </div>
                  )}
                </div>
                {agent.status === 'active' && (
                  <div className="mt-3 ml-7">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Session Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tasks Completed</span>
                <span className="font-medium text-gray-700">1 / 4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Time</span>
                <span className="font-medium text-gray-700">2m 34s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAgentChatApp;