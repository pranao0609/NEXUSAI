import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, CheckCircle, Clock, Circle } from 'lucide-react';

const AiAgentChatApp = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Can you help me research the latest trends in renewable energy?", sender: 'user' },
    { id: 2, text: "I'll help you research the latest trends in renewable energy. Let me gather the most current information for you.", sender: 'ai' },
    { id: 3, text: "What are the top 3 emerging technologies?", sender: 'user' },
    { id: 4, text: "Based on my research, here are the top 3 emerging technologies in renewable energy:\n\n1. Perovskite solar cells - offering higher efficiency at lower costs\n2. Floating offshore wind turbines - accessing deeper waters with stronger winds\n3. Green hydrogen production - storing renewable energy for industrial use", sender: 'ai' }
  ]);
  
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user'
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "I'm processing your request and gathering the information you need. This will just take a moment.",
          sender: 'ai'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
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
          <span className="text-sm text-gray-600">Sarah Chen</span>
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