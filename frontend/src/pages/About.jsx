import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo-mark.svg';
import FamilyFinance from '../assets/family-finance.svg';

const About = () => {
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
              About FamFinity
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              We're on a mission to help families take control of their financial future through intelligent insights and personalized guidance. FamFinity is an AI-powered financial management platform designed to make complex financial planning simple, accessible, and actionable for families everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
              <h2 className="text-4xl md:text-5xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
                Our Mission
              </h2>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Financial planning shouldn't be complicated or intimidating. FamFinity makes it easy for families to understand their spending, set realistic goals, and make informed decisions about their financial future. We've built a comprehensive platform that combines powerful AI analytics with an intuitive, user-friendly interface.
              </p>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                We believe that every family deserves access to professional-grade financial tools and insights, regardless of their income level or financial knowledge. FamFinity democratizes financial planning by making sophisticated analytics and recommendations available to everyone.
              </p>
              <p className="text-lg" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Our platform uses advanced machine learning algorithms to analyze spending patterns, predict future expenses, and provide personalized recommendations. We integrate with multiple financial institutions, support CSV imports, and offer real-time synchronization across devices, making it the perfect companion for modern families managing complex financial lives.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="p-8">
                <img src={FamilyFinance} alt="Family finance" className="w-full h-auto rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details Section */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              About The Project
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-12" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              FamFinity is built with cutting-edge technology to deliver a seamless financial management experience. Our platform leverages modern web technologies, AI/ML algorithms, and cloud infrastructure to provide real-time insights and secure data management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>AI-Powered Analytics</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Our machine learning models analyze transaction patterns, predict expenses, and generate personalized financial recommendations. The AI continuously learns from your spending behavior to provide increasingly accurate insights.
              </p>
            </div>
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Bank-Level Security</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                We use industry-standard encryption (AES-256), secure authentication protocols, and comply with financial data protection regulations. All data is stored securely in encrypted databases with regular security audits.
              </p>
            </div>
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Real-Time Sync</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Built with modern cloud architecture, FamFinity syncs your data in real-time across all devices. Changes are instantly reflected whether you're on your phone, tablet, or computer, ensuring you always have the latest financial information.
              </p>
            </div>
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>CSV Import System</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Our intelligent CSV parser automatically recognizes transaction formats from major banks worldwide. It categorizes transactions, detects duplicates, and organizes data for comprehensive financial tracking without manual entry.
              </p>
            </div>
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Dual AI System</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                FamFinity features a unique dual-intelligence system: an offline Finance Assistant that analyzes your real transaction data, and a Gemini-powered chatbot that explains financial concepts and answers questions in natural language.
              </p>
            </div>
            <div className="p-8 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-8 h-8" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Fast & Responsive</h3>
              <p className="text-base" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Built with React and modern web technologies, FamFinity delivers a fast, responsive experience across all devices. Our optimized architecture ensures quick load times and smooth interactions, even with large amounts of financial data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Our Values
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              The core principles that guide everything we do at FamFinity. These values shape our product development, customer relationships, and commitment to helping families achieve financial success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Privacy First</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Your financial data is yours. We use bank-level encryption and security protocols to protect your information and never share your data with third parties. Your privacy is not negotiable—we build trust through transparency and security that exceeds industry standards.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Simplicity</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Complex financial concepts made simple and actionable for everyone. No financial degree required to understand your money. We translate complicated financial jargon into clear, actionable insights that help you make better decisions for your family's future.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: '#221e2f' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#120b25' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Family Focused</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Built specifically for families who want to secure their financial future together and make informed decisions as a unit. Whether you're planning for your children's education, saving for a home, or preparing for retirement, FamFinity helps families work together toward shared financial goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #6246e9 0%, #4c1fb8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#c0b5f6', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
            Join thousands of families who are already taking control of their financial future with FamFinity. Start your journey today and discover how easy it is to manage your family's finances, set meaningful goals, and build wealth for generations to come.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'white', color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}
          >
            Start Your Journey
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
              <p className="mb-6 max-w-md" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                The only app that gets your money into shape. Take control of your family finances with smart insights and beautiful analytics powered by cutting-edge AI technology.
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

export default About;
