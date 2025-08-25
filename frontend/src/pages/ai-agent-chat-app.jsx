import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  CheckCircle, 
  Clock, 
  Circle, 
  ChevronRight,
  Sparkles,
  Settings,
  MessageSquare,
  Trash2,
  Search,
  Paperclip
} from 'lucide-react';
// Remove these imports and handle them in your actual implementation:
 import axios from 'axios';
 import { useNavigate } from 'react-router-dom';
import Profile from '../components/profile';
import PricingModal from '../components/PricingModal';

const AiAgentChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  // Chat history will be loaded from backend
  const [chatHistory, setChatHistory] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
   const navigate = useNavigate(); // Uncomment when using react-router-dom
  
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
  }, [navigate]); // Remove navigate dependency for demo

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleUpgradeClick = () => {
    setIsPricingOpen(true);
  };

  const handleClosePricing = () => {
    setIsPricingOpen(false);
  };

  const handleChatHistoryClick = (chatId) => {
    setCurrentChatId(chatId);
    // Here you would typically load the chat messages for this conversation
    // For now, we'll just highlight the selected chat
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending' })));
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current.click();
  };

  const handleSend = async () => {
    if (inputValue.trim() || selectedFile) {
      const userMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        file: selectedFile ? selectedFile.name : null
      };
      setMessages([...messages, userMessage]);
      
      // Create new chat history entry if this is a new conversation
      if (!currentChatId && messages.length === 0) {
        const newChat = {
          id: Date.now(),
          title: inputValue.length > 50 ? inputValue.substring(0, 50) + "..." : inputValue,
          timestamp: "Just now",
          preview: inputValue
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
      }
      
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
      
      // Simulate API call with timeout for demo
      setTimeout(() => {
        // Update agents status
        setAgents(prev => prev.map(agent => {
          if (agent.id === 2) return { ...agent, status: 'completed' };
          if (agent.id === 3) return { ...agent, status: 'active' };
          return agent;
        }));
        
        setTimeout(() => {
          // Final response
          const finalResponse = `Thank you for your question: "${inputValue}". I've processed your request and here's my response. This is a demo response that shows how the AI agent system works with multiple processing stages.`;
          
          // Update the AI response with the actual data
          setMessages(prev => prev.map(msg => {
            if (msg.id === initialAiResponse.id) {
              return { ...msg, text: finalResponse };
            }
            return msg;
          }));
          
          // Complete all agents
          setAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
        }, 2000);
      }, 1000);
      

     
      // Uncomment for actual API implementation:
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        
        // Create form data for file upload
        const formData = new FormData();
        if (selectedFile) {
          formData.append('file_content', selectedFile);
        }

        // You can also append query params to FormData if you want, or keep them in URL params
        formData.append('query', inputValue);
        formData.append('title', 'Generated Report');
        formData.append('audience', 'General');
        formData.append('source', 'wiki');

        const response = await axios.post(`${API_BASE_URL}/pipeline`, formData, {
          withCredentials: true,
          responseType: 'blob',  // Changed to blob to handle both JSON and PDF
          // DO NOT set Content-Type manually; axios/browser will handle it for FormData
        });
        
        setAgents(prev => prev.map(agent => {
          if (agent.id === 2) return { ...agent, status: 'completed' };
          if (agent.id === 3) return { ...agent, status: 'active' };
          return agent;
        }));

        const renderResponse = (responseData) => {
  if (!responseData || !responseData.docs || responseData.docs.length === 0) {
    return <p className="text-gray-500 italic">I couldn't find any relevant information.</p>;
  }

  const doc = responseData.docs[0];

  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-2xl font-bold text-blue-700">{doc.metadata.title || 'Generated Report'}</h2>

      {/* Summary */}
      {doc.metadata.summary && (
        <div>
          <h3 className="text-xl font-semibold text-indigo-600">Summary</h3>
          <p className="text-gray-800">{doc.metadata.summary}</p>
        </div>
      )}

      {/* Key Points */}
      {responseData.points && responseData.points.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-green-600">Key Points</h3>
          <ul className="list-disc list-inside space-y-1">
            {responseData.points.map((point, idx) => (
              <li key={idx} className="text-gray-700">{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Sections */}
      {responseData.report && (
        <>
          {responseData.report.introduction && (
            <div>
              <h3 className="text-xl font-semibold text-purple-600">Introduction</h3>
              <p className="text-gray-800">{responseData.report.introduction}</p>
            </div>
          )}
          {responseData.report.conclusion && (
            <div>
              <h3 className="text-xl font-semibold text-purple-600">Conclusion</h3>
              <p className="text-gray-800">{responseData.report.conclusion}</p>
            </div>
          )}
        </>
      )}

      {/* Sources */}
      {responseData.text_sources && responseData.text_sources.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-yellow-700">Sources</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {responseData.text_sources.map((src, idx) => (
              <li key={idx}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

        // Check if the response is a PDF file
        const contentType = response.headers['content-type'];
        
        if (contentType === 'application/pdf') {
          // Handle PDF response
          const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Update the messages state with PDF download link
          setMessages(prev => prev.map(msg => {
            if (msg.id === initialAiResponse.id) {
              return {
                ...msg,
                text: "I've generated a PDF report based on your query. You can view or download it using the button below.",
                pdfUrl: pdfUrl,
                isPdf: true
              };
            }
            return msg;
          }));
          
          // Update agent statuses
          setAgents(prev => prev.map(agent => {
            if (agent.id === 3) return { ...agent, status: 'completed' };
            if (agent.id === 4) return { ...agent, status: 'completed' };
            return agent;
          }));
          
          return; // Exit early as we've handled the PDF response
        }
        
        // Handle JSON response
        const jsonText = await response.data.text();
        const jsonData = JSON.parse(jsonText);
        const responseData = jsonData.result;
        
        console.log(responseData);

        let formattedResponse = "I couldn't find any relevant information.";
        let i = 0;
        
        // Format the response first
        if (responseData && responseData.docs && responseData.docs.length > 0) {
          const doc = responseData.docs[i];
          console.log(doc);
          i++;

          // Build the formatted response with proper structure
          formattedResponse = `${doc.metadata.title || 'Generated Report'}

`;

          // Add summary section with better formatting
          if (doc.metadata.summary) {
            formattedResponse += `EXECUTIVE SUMMARY:\n\n`;
            formattedResponse += `${doc.metadata.summary}\n\n`;
            formattedResponse += `---\n\n`;
          }

          // Add key points with proper bullet formatting
          if (responseData.points && responseData.points.length > 0) {
            formattedResponse += `KEY POINTS:\n\n`;

            // Skip the first point and format the rest as bullets
            const keyPoints = responseData.points.slice(1);
            keyPoints.forEach((point, index) => {
              // Clean up the point text and ensure proper formatting
              const cleanPoint = point.trim().replace(/^[-•*]\s*/, '');
              formattedResponse += `• ${cleanPoint}\n\n`;
            });

            formattedResponse += `---\n\n`;
          }

          // Add report sections with enhanced formatting
          if (responseData.report) {
            if (responseData.report.introduction) {
              formattedResponse += `INTRODUCTION:\n\n`;
              formattedResponse += `${responseData.report.introduction}\n\n`;
            }

            if (responseData.report.conclusion) {
              formattedResponse += `CONCLUSION:\n\n`;
              formattedResponse += `${responseData.report.conclusion}\n\n`;
            }
          }

          // Add detailed analysis if available
          if (responseData.analysis) {
            formattedResponse += `DETAILED ANALYSIS:\n\n`;

            if (Array.isArray(responseData.analysis)) {
              responseData.analysis.forEach((item, index) => {
                formattedResponse += `${index + 1}. ${item.title || `Analysis Point ${index + 1}`}:\n\n`;
                formattedResponse += `${item.content || item}\n\n`;
              });
            } else {
              formattedResponse += `${responseData.analysis}\n\n`;
            }
          }

          // Add recommendations if available
          if (responseData.recommendations && responseData.recommendations.length > 0) {
            formattedResponse += `RECOMMENDATIONS:\n\n`;

            responseData.recommendations.forEach((recommendation, index) => {
              formattedResponse += `${index + 1}. ${recommendation.title || `Recommendation ${index + 1}`}:\n`;
              formattedResponse += `   ${recommendation.description || recommendation}\n\n`;
            });

            formattedResponse += `---\n\n`;
          }

          // Add methodology if available
          if (responseData.methodology) {
            formattedResponse += `METHODOLOGY:\n\n`;
            formattedResponse += `${responseData.methodology}\n\n`;
          }

          // Add data sources with better formatting
          if (responseData.text_sources && responseData.text_sources.length > 0) {
            formattedResponse += `SOURCES & REFERENCES:\n\n`;

            responseData.text_sources.forEach((source, index) => {
              // Format sources as numbered list with better styling
              formattedResponse += `${index + 1}. ${source}\n`;
            });

            formattedResponse += `\n`;
          }

          // Add metadata footer if available
          if (doc.metadata.author || doc.metadata.date || doc.metadata.version) {
            formattedResponse += `---\n\n`;
            formattedResponse += `DOCUMENT INFORMATION:\n\n`;

            if (doc.metadata.author) {
              formattedResponse += `Author: ${doc.metadata.author}\n`;
            }
            if (doc.metadata.date) {
              formattedResponse += `Date: ${doc.metadata.date}\n`;
            }
            if (doc.metadata.version) {
              formattedResponse += `Version: ${doc.metadata.version}\n`;
            }

            formattedResponse += `\n`;
          }
        }

        // Check if there's a PDF path in the response (for verbose mode)
        if (jsonData.pdf_path) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const pdfFilename = jsonData.pdf_path.split('/').pop();
          const pdfUrl = `${API_BASE_URL}/static/${pdfFilename}`;
          
          // Update the messages state with PDF download link and formatted response
          setMessages(prev => prev.map(msg => {
            if (msg.id === initialAiResponse.id) {
              return {
                ...msg,
                text: formattedResponse + "\n\nI've also generated a PDF report that you can view or download using the buttons below.",
                pdfUrl: pdfUrl,
                pdfFilename: pdfFilename,
                isPdf: true,
                isMarkdown: true // Add flag to indicate markdown formatting
              };
            }
            return msg;
          }));
        } else {
          // Update the messages state with just the formatted response (no PDF)
          setMessages(prev => prev.map(msg => {
            if (msg.id === initialAiResponse.id) {
              return {
                ...msg,
                text: formattedResponse,
                isMarkdown: true // Add flag to indicate markdown formatting
              };
            }
            return msg;
          }));
        }

        // Update agent statuses
        setAgents(prev => prev.map(agent => {
          if (agent.id === 3) return { ...agent, status: 'completed' };
          if (agent.id === 4) return { ...agent, status: 'active' };
          return agent;
        }));
      }
      catch (error) {
        console.error('Error processing request:', error);
        // Update the message to show error
        setMessages(prev => prev.map(msg => {
          if (msg.id === initialAiResponse.id) {
            return {
              ...msg,
              text: "Sorry, there was an error processing your request. Please try again.",
              isError: true
            };
          }
          return msg;
        }));
        
        // Update agent statuses to show failure
        setAgents(prev => prev.map(agent => {
          if (agent.status === 'active') return { ...agent, status: 'failed' };
          return agent;
        }));
      }
      
      setInputValue('');
      setSelectedFile(null);
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
      case 'failed':
        return <Circle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Same as Dashboard */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl sticky top-0 h-screen relative">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-white">{userData?.name || 'Guest User'}</h3>
              <p className="text-sm text-gray-300">{userData?.role || 'Free User'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#7FA0A8] hover:bg-[#6A8B94] transition-all duration-200"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Chat History
            </h3>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatHistoryClick(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 group relative ${
                    currentChatId === chat.id
                      ? 'bg-[#7FA0A8] text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {chat.preview}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.timestamp}
                      </p>
                    </div>
                    <span
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all ml-2 cursor-pointer"
                      role="button"
                      aria-label="Delete chat"
                      tabIndex="0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings and Bottom Section */}
        <div className="absolute bottom-6 left-6 right-6 w-[200px] space-y-3">
          
          
          <button 
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-lg p-3 hover:from-[#6A8B94] hover:to-[#7FA0A8] transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <h4 className="text-white font-medium text-sm">Upgrade Pro</h4>
                <p className="text-white/80 text-xs">Unlock premium features</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-500">Ask me anything, I'm here to help!</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Ask me anything! I can help with research, analysis, coding, and much more.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className="group">
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
                      {message.isPdf && message.pdfUrl && (
                        <div className="mt-4 flex flex-col space-y-2">
                          <a 
                            href={message.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View PDF Report
                          </a>
                          <a 
                            href={message.pdfUrl ? `${import.meta.env.VITE_API_BASE_URL}/download-pdf/${message.pdfFilename || 'report.pdf'}` : '#'} 
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF Report
                          </a>
                        </div>
                      )}
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                />
                <button 
                  onClick={handlePaperclipClick}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </div>
              {selectedFile && (
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center">
                  <span className="truncate max-w-[100px]">{selectedFile.name}</span>
                  <button 
                    onClick={() => setSelectedFile(null)} 
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              )}
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
                    : agent.status === 'failed'
                    ? 'bg-white border border-red-200 opacity-75'
                    : 'bg-white border border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(agent.status)}
                      <h3 className={`font-medium ${
                        agent.status === 'active' 
                          ? 'text-blue-600' 
                          : agent.status === 'failed'
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}>
                        {agent.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">{agent.description}</p>
                    {agent.status === 'active' && (
                      <div className="mt-2 ml-7 text-xs text-gray-400">
                        {agent.logs?.map((log, index) => (
                          <p key={index}>{log}</p>
                        ))}
                      </div>
                    )}
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
                <span className="text-gray-500">Messages</span>
                <span className="font-medium text-gray-700">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Time</span>
                <span className="font-medium text-gray-700">2m 34s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">
                  {agents.some(a => a.status === 'active') ? 'Processing' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <Profile isOpen={isProfileOpen} onClose={handleCloseProfile} />
      <PricingModal isOpen={isPricingOpen} onClose={handleClosePricing} />
    </div>
  );
};

export default AiAgentChatApp;