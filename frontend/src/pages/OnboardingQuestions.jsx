import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, handleAPIError } from '../api';

const OnboardingQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 15 onboarding questions with different types (Indian context)
  const questions = [
    {
      id: 1,
      type: 'select',
      question: 'What is your primary financial goal?',
      options: ['Save for retirement', 'Buy a house/flat', 'Pay off debt/loan', 'Build emergency fund', 'Invest in mutual funds/stocks', 'Children\'s education'],
      required: true
    },
    {
      id: 2,
      type: 'range',
      question: 'How much do you currently save per month?',
      min: 0,
      max: 100000,
      step: 5000,
      unit: '₹',
      required: true
    },
    {
      id: 3,
      type: 'select',
      question: 'What is your current employment status?',
      options: ['Salaried employee', 'Self-employed/Business owner', 'Freelancer/Consultant', 'Government employee', 'Student', 'Homemaker', 'Retired'],
      required: true
    },
    {
      id: 4,
      type: 'range',
      question: 'What is your annual household income (in lakhs)?',
      min: 0,
      max: 50,
      step: 1,
      unit: '₹ lakhs',
      required: true
    },
    {
      id: 5,
      type: 'select',
      question: 'How would you describe your risk tolerance for investments?',
      options: ['Very conservative (FD, PPF only)', 'Conservative (Low risk)', 'Moderate (Balanced)', 'Aggressive (Equity focused)', 'Very aggressive (High risk-high return)'],
      required: true
    },
    {
      id: 6,
      type: 'range',
      question: 'How much total debt do you currently have (including home loan, personal loan, credit card)?',
      min: 0,
      max: 5000000,
      step: 100000,
      unit: '₹',
      required: true
    },
    {
      id: 7,
      type: 'select',
      question: 'What is your biggest financial concern?',
      options: ['Not saving enough', 'Rising inflation', 'Job security/Income stability', 'High EMIs/Debt', 'Medical expenses', 'Children\'s education cost'],
      required: true
    },
    {
      id: 8,
      type: 'range',
      question: 'How many months of expenses do you have in emergency savings?',
      min: 0,
      max: 24,
      step: 1,
      unit: 'months',
      required: true
    },
    {
      id: 9,
      type: 'select',
      question: 'How often do you track your spending?',
      options: ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Never'],
      required: true
    },
    {
      id: 10,
      type: 'range',
      question: 'What percentage of your income do you want to save?',
      min: 0,
      max: 50,
      step: 5,
      unit: '%',
      required: true
    },
    {
      id: 11,
      type: 'select',
      question: 'What is your investment experience?',
      options: ['No experience (only savings account)', 'Beginner (FD, RD, PPF)', 'Intermediate (Mutual funds, SIP)', 'Advanced (Direct stocks, bonds)', 'Expert (Options, derivatives)'],
      required: true
    },
    {
      id: 12,
      type: 'range',
      question: 'How much do you spend on non-essential items monthly (shopping, dining out, entertainment)?',
      min: 0,
      max: 50000,
      step: 2500,
      unit: '₹',
      required: true
    },
    {
      id: 13,
      type: 'select',
      question: 'What is your housing situation?',
      options: ['Living on rent', 'Own house/flat with home loan', 'Own house/flat (no loan)', 'Living with parents/family', 'Company-provided accommodation'],
      required: true
    },
    {
      id: 14,
      type: 'range',
      question: 'How many years until you want to retire?',
      min: 5,
      max: 50,
      step: 5,
      unit: 'years',
      required: true
    },
    {
      id: 15,
      type: 'select',
      question: 'What motivates you to improve your finances?',
      options: ['Financial security for family', 'Early retirement/FIRE', 'Children\'s future', 'Buy property/home', 'Financial independence', 'Build wealth'],
      required: true
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if user has pending signup data
      const pendingSignup = localStorage.getItem('pending_signup');
      if (!pendingSignup) {
        // Check if user is already logged in (for existing users who haven't completed onboarding)
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please sign up first');
          setTimeout(() => navigate('/signup'), 2000);
          return;
        }
        
        // Existing user flow - save questions to backend
        const formattedAnswers = questions.map(q => ({
          q_id: q.id,
          answer: answers[q.id]?.toString() || ''
        }));

        const response = await questionsAPI.submitQuestions(formattedAnswers);
        
        if (response.success) {
          // User has now completed onboarding - redirect to upload CSV page
          navigate('/upload-csv');
        }
      } else {
        // New user flow - store answers temporarily in localStorage
        const formattedAnswers = questions.map(q => ({
          q_id: q.id,
          answer: answers[q.id]?.toString() || ''
        }));

        localStorage.setItem('pending_questions', JSON.stringify(formattedAnswers));
        
        // Redirect to CSV upload page immediately
        setTimeout(() => {
          navigate('/upload-csv');
        }, 100);
      }
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'select':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="h-4 w-4 focus:ring-indigo-500"
                  style={{ color: '#6246e9', borderColor: '#221e2f' }}
                />
                <span className="ml-3 text-sm" style={{ color: '#c4c4c4' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step}
              value={currentAnswer || question.min}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: '#120b25' }}
            />
            <div className="text-center">
              <span className="text-2xl font-bold" style={{ color: '#6246e9' }}>
                {question.unit === '₹' || question.unit === '₹ lakhs' ? question.unit : ''}{currentAnswer || question.min}{question.unit !== '₹' && question.unit !== '₹ lakhs' ? question.unit : ''}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCurrentQuestionAnswered = () => {
    const question = questions[currentQuestion];
    return answers[question.id] !== undefined && answers[question.id] !== '';
  };

  const allQuestionsAnswered = () => {
    return questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#120b25' }}>
      <div className="max-w-3xl mx-auto">
        <div className="shadow rounded-lg" style={{ backgroundColor: '#221e2f' }}>
          <div className="px-4 py-5 sm:p-6">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2" style={{ color: '#c4c4c4' }}>
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: '#120b25' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: '#6246e9' }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'white' }}>
                {questions[currentQuestion].question}
              </h2>
              {renderQuestion(questions[currentQuestion])}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-md p-4" style={{ backgroundColor: '#3f1f1f', border: '1px solid #5f1f1f' }}>
                <div className="text-sm" style={{ color: '#ff6b6b' }}>{error}</div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ 
                  borderColor: '#221e2f', 
                  color: '#c4c4c4', 
                  backgroundColor: '#120b25',
                  opacity: currentQuestion === 0 ? 0.5 : 1
                }}
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered() || loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#6246e9' }}
                >
                  {loading ? 'Submitting...' : 'Complete Onboarding'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#6246e9' }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestions;
