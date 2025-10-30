import React, { useState, useEffect, useRef } from 'react';
import { authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import api from '../api';

const Chatbot = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadUser();
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! I\'m your AI Chatbot powered by Gemini. I can answer general finance questions, explain concepts, and provide information about the real world. How can I help you today?'
      }
    ]);
  }, []);

  const loadUser = async () => {
    try {
      const resp = await authAPI.getCurrentUser();
      setUser(resp);
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call chat endpoint (Gemini-based) with correct fields
      const response = await api.post('/chat', {
        user_id: user?.id || '',
        query: input,
        include_context: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply || 'I apologize, I couldn\'t process your request at this moment.'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorInfo.message}. Please try again later.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'What is a mutual fund?',
    'Explain SIP investing',
    'What are tax-saving investments in India?',
    'How does compound interest work?',
    'What is the 50-30-20 budgeting rule?',
    'Explain inflation and its impact'
  ];

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! I\'m your AI Chatbot powered by Gemini. I can answer general finance questions, explain concepts, and provide information about the real world. How can I help you today?'
      }
    ]);
  };

  return (
    <AppLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Chatbot</h2>
                <p className="text-gray-500">Ask anything about finance and the world</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              Clear Chat
            </button>
          </div>

          {/* Quick Questions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Popular finance questions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 text-sm text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about finance..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            About this Chatbot
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Powered by Google Gemini AI for general knowledge</li>
            <li>• Ask questions about finance concepts, investment strategies, and more</li>
            <li>• Get real-time information from the web</li>
            <li>• This chatbot doesn't access your personal financial data (use AI Finance Advisor for personalized advice)</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chatbot;

