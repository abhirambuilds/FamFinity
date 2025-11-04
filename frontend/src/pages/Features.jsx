import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo-mark.svg';
import HeroGraph from '../assets/hero-graph.svg';
import AIBrain from '../assets/ai-brain.svg';

const Features = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center flex-shrink-0">
              <div className="w-10 h-10 mr-3 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12C8 12 12 8 20 8C28 8 32 12 32 12" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M8 28C8 28 12 32 20 32C28 32 32 28 32 28" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <Link to="/" className="text-xl sm:text-2xl font-medium text-white" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-0.5px' }}>
                FamFinity
              </Link>
            </div>
            <div className="hidden lg:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-6">
              <Link to="/" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Home</Link>
              <Link to="/about" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>About</Link>
              <Link to="/features" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Features</Link>
              <Link to="/contact" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Contact</Link>
              <Link to="/signin" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Login</Link>
            </div>
            <div className="hidden md:flex items-center flex-shrink-0">
              <Link to="/signup" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm" style={{ backgroundColor: '#c2f52f', color: '#120b25', fontFamily: '"Inter Tight", sans-serif' }}>
                Get Started
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 touch-manipulation"
                aria-label="Toggle menu"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed top-20 left-0 right-0 w-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto" style={{ backgroundColor: '#120b25', borderTop: '1px solid #221e2f' }}>
              <div className="flex flex-col px-4 py-4 space-y-3">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Home
                </Link>
                <Link 
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  About
                </Link>
                <Link 
                  to="/features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Features
                </Link>
                <Link 
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Contact
                </Link>
                <Link 
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm text-center touch-manipulation"
                  style={{ backgroundColor: '#c2f52f', color: '#120b25', fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-medium text-white leading-tight mb-6" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-2px', lineHeight: '120%' }}>
              Powerful Features for Your Family
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              Discover what makes FamFinity the perfect financial companion for your family. Everything you need to get your money into shape—from AI-powered expense tracking and smart budgeting to goal setting and investment insights. Our comprehensive suite of features is designed to work seamlessly together, giving you complete control over your family's financial health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium transition-all duration-300"
                style={{ backgroundColor: '#6246e9', color: 'white' }}
              >
                Get Started
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-4 border-2 rounded-lg font-medium hover:opacity-80 transition-all duration-300"
                style={{ borderColor: '#221e2f', color: 'white', backgroundColor: 'transparent' }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Smart Analytics</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Get detailed insights into your spending patterns and financial health with AI-powered analytics that help you make better decisions. Our advanced algorithms analyze your transaction history to identify trends, spot opportunities to save, and provide personalized recommendations tailored specifically to your family's financial situation and goals.
              </p>
            </div>

            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Goal Setting</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Set and track financial goals for your family's future with personalized recommendations and progress tracking. Whether you're saving for a down payment, planning your child's college fund, or building an emergency fund, our goal-setting features help you stay motivated and on track with visual progress indicators and milestone celebrations.
              </p>
            </div>

            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Easy Import</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Import your bank statements and transaction data with our simple CSV upload feature for comprehensive tracking. Our intelligent system automatically categorizes your transactions, detects duplicates, and organizes your data so you can see the complete picture of your finances without manual entry or tedious data processing.
              </p>
            </div>

            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Smart Onboarding</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Complete our comprehensive onboarding to get personalized financial advice and recommendations tailored to your family. Our intelligent questionnaire learns about your financial situation, goals, and preferences to provide customized insights and suggestions that align with your family's unique needs and aspirations.
              </p>
            </div>

            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>AI Chat Assistant</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Get instant answers to your financial questions with our AI-powered chat assistant available 24/7. Ask anything about budgeting, saving, investing, or financial planning and receive expert-level guidance instantly. Our chat assistant understands context and can provide specific advice based on your actual financial data.
              </p>
            </div>

            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Bank-Level Security</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Your financial data is protected with bank-level security and encryption to keep your family's information safe. We use industry-standard encryption protocols, secure authentication methods, and regular security audits to ensure your sensitive financial information remains confidential and protected from unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Dual-Intelligence, Smarter Finance
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              Our dual-intelligence system combines the power of offline finance analysis with AI-powered chat assistance. The offline Finance Assistant analyzes your real transaction data to provide actionable insights, while the Gemini Chatbot explains financial concepts and answers any questions you have, ensuring you always get the right kind of help when you need it.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={HeroGraph} alt="Efficient Finance Management" className="w-full rounded-xl shadow-lg" />
            </div>
            <div>
              <h3 className="text-3xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>AI-Powered Insights</h3>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                AI predicts upcoming expenses based on past spending habits with proactive alerts for future financial risks. Our machine learning algorithms identify patterns in your spending behavior and can forecast upcoming bills, seasonal expenses, and potential budget shortfalls, giving you time to prepare and adjust.
              </p>
              <p className="text-lg mb-8" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Consolidate budgets across multiple accounts and cards. Set different budgets for personal and business expenses, individual family members, or specific categories. Our flexible budgeting system adapts to your lifestyle and helps you stay organized no matter how complex your financial situation.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all"
                style={{ backgroundColor: '#6246e9', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
              >
                Start Free
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <h3 className="text-3xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Have perfect control over all your finances</h3>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Track cash expenses, bank accounts, and digital wallets all in one place. Get a quick overview of your incomes and expenses at a glance with our intuitive dashboard that updates in real-time. See exactly where your money is going and identify opportunities to optimize your spending across all your financial accounts.
              </p>
              <p className="text-lg mb-8" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Use smart budgets to save money for your dreams and long-term goals. Our multi-currency support is perfect for travelers and digital nomads who manage money across different countries. Track expenses in multiple currencies simultaneously and see your true financial picture regardless of where you or your money travels.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border-2 rounded-lg font-medium hover:opacity-80 transition-all"
                style={{ borderColor: '#221e2f', color: 'white', backgroundColor: 'transparent', fontFamily: '"Inter Tight", sans-serif' }}
              >
                Explore Features
              </Link>
            </div>
            <div>
              <img src={AIBrain} alt="AI Financial Assistant" className="w-full rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #6246e9 0%, #4c1fb8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
            Ready to get your money into shape?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#c0b5f6', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
            Join thousands of families who have transformed their financial management with FamFinity. Experience the peace of mind that comes with having complete control over your finances, the confidence of making data-driven decisions, and the satisfaction of watching your family's wealth grow.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'white', color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}
          >
            Get Started Free
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img src={Logo} alt="FamFinity" className="h-8 w-8 mr-2" />
                <span className="text-2xl font-medium text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>FamFinity</span>
              </div>
              <p className="mb-6 max-w-md" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                The only app that gets your money into shape. Take control of your family finances with smart insights and beautiful analytics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Features</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>About</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>About us</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8" style={{ borderColor: '#221e2f' }}>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>&copy; 2024 FamFinity. All Rights Reserved. Made with ❤️ for families everywhere.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
