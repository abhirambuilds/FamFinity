import React, { useState, useEffect, useRef } from 'react';
import { authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import api from '../api';

const Advisor = () => {
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
    // Initial message
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your personal AI Finance Advisor. I analyze your spending patterns, income, and financial goals to provide personalized advice. Ask me anything about your finances!'
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
      // Call advisor endpoint with user's financial data
      const response = await api.post('/advisor', {
        user_id: user?.id || '',
        query: input
      });

      // Format the advisor response
      const data = response.data;
      let content = '';
      
      if (data.explanations && data.explanations.length > 0) {
        content += '**Analysis:**\n' + data.explanations.join('\n') + '\n\n';
      }
      
      if (data.suggested_actions && data.suggested_actions.length > 0) {
        content += '**Recommended Actions:**\n';
        data.suggested_actions.forEach((action, index) => {
          content += `${index + 1}. **${action.action}**\n`;
          content += `   - *Why:* ${action.rationale}\n`;
          if (action.estimated_impact > 0) {
            content += `   - *Potential Savings:* ₹${action.estimated_impact.toFixed(2)}/month\n`;
          }
          content += '\n';
        });
      }
      
      if (!content) {
        content = 'I apologize, I couldn\'t generate specific advice at this moment. Please try asking a more specific question about your finances.';
      }

      const assistantMessage = {
        role: 'assistant',
        content: content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorInfo.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your personal AI Finance Advisor. I analyze your spending patterns, income, and financial goals to provide personalized advice. Ask me anything about your finances!'
      }
    ]);
  };

  const quickQuestions = [
    'How can I save more money this month?',
    'Analyze my spending patterns',
    'What\'s my biggest expense category?',
    'Give me budgeting tips',
    'How can I reduce my expenses?'
  ];

  return (
    <AppLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Finance Advisor</h2>
                <p className="text-gray-500">Personalized financial advice based on your data</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Quick Questions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <div key={idx} className="font-semibold text-purple-700 mt-2 mb-1">{line.slice(2, -2)}</div>;
                      } else if (line.startsWith('   - *')) {
                        const parts = line.split('*');
                        return <div key={idx} className="ml-4 text-gray-600"><span className="italic">{parts[1]}</span>{parts[2]}</div>;
                      } else if (line.startsWith('   -')) {
                        return <div key={idx} className="ml-4 text-gray-600">{line.slice(4)}</div>;
                      } else if (line.match(/^\d+\. \*\*/)) {
                        const action = line.match(/\*\*(.*?)\*\*/)?.[1] || '';
                        return <div key={idx} className="font-medium text-gray-800 mt-2">{line.split('.')[0]}. {action}</div>;
                      } else if (line.trim() === '') {
                        return <br key={idx} />;
                      } else {
                        return <div key={idx}>{line}</div>;
                      }
                    })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
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
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-2">How it works</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• The AI analyzes your transaction history, spending patterns, and financial goals</li>
            <li>• Responses are personalized based on YOUR specific financial data</li>
            <li>• All your financial data stays secure and private on our servers</li>
            <li>• Get actionable insights to improve your financial health</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Advisor;

