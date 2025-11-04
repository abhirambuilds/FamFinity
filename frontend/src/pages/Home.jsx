import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo-mark.svg';
import HeroGraph from '../assets/hero-graph.svg';
import AIBrain from '../assets/ai-brain.svg';
import DashboardPreview from '../assets/dashboard-preview.png';

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    } else {
      // Show install button by default (will work for iOS or show instructions)
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

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

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Detect platform and browser
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const isSamsungBrowser = /SamsungBrowser/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent) && !isSamsungBrowser;
      const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
      
      let instructions = '';
      
      if (isIOS) {
        instructions = 'To install FamFinity on your iPhone:\n\n1. Tap the Share button (square with arrow) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nAfter installation, you can open FamFinity from your home screen!';
      } else if (isAndroid) {
        if (isSamsungBrowser) {
          instructions = 'To install FamFinity on your Samsung device:\n\n1. Tap the menu (three dots) at the bottom right\n2. Tap "Add page to" or "Install app"\n3. Tap "Add to Home screen" or "Install"\n\nAlternatively, you may see an install banner at the top - tap it!';
        } else if (isChrome) {
          instructions = 'To install FamFinity on Android:\n\n1. Look for the install banner at the top of your browser\n2. Or tap the menu (three dots) → "Install app" or "Add to Home screen"\n3. Tap "Install" to confirm\n\nAfter installation, you can open FamFinity from your home screen!';
        } else {
          instructions = 'To install FamFinity on your Android device:\n\n1. Tap the menu (three dots) in your browser\n2. Look for "Add to Home screen" or "Install app"\n3. Tap it and confirm the installation\n\nAfter installation, you can open FamFinity from your home screen!';
        }
      } else if (isMobile) {
        instructions = 'To install FamFinity:\n\n1. Look for the browser\'s menu or settings\n2. Find "Add to Home Screen" or "Install App"\n3. Follow the prompts to install\n\nAfter installation, you can open FamFinity from your home screen!';
      } else {
        // Desktop browser
        const isChromeDesktop = /Chrome/.test(navigator.userAgent) && !isMobile;
        const isEdge = /Edg/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        if (isChromeDesktop || isEdge) {
          instructions = 'To install FamFinity on your computer:\n\n1. Look for the install icon (⊕) in your browser\'s address bar\n2. Click it and select "Install"\n3. Or use the browser menu → "Install FamFinity"\n\nAfter installation, FamFinity will open as a standalone app!';
        } else if (isFirefox) {
          instructions = 'To install FamFinity on Firefox:\n\n1. Click the menu (three lines) → "More Tools"\n2. Select "Install Site as App" or use the install icon in the address bar\n3. Follow the prompts to install\n\nAfter installation, FamFinity will open as a standalone app!';
        } else {
          instructions = 'To install FamFinity:\n\n1. Look for an install icon in your browser\'s address bar\n2. Or check your browser menu for "Install" or "Add to Home Screen"\n3. Follow the prompts to install\n\nAfter installation, FamFinity will be available as an app!';
        }
      }
      
      alert(instructions);
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Optionally show a success message
        // alert('FamFinity is being installed! Check your home screen or apps menu.');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // Fallback if prompt fails
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert('To install FamFinity on your iPhone:\n\n1. Tap the Share button (square with arrow) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      } else {
        alert('Please check your browser menu for "Add to Home Screen" or "Install App" option.');
      }
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How to get your money into shape?",
      answer: "Follow these simple steps to take complete control of your family finances. Track your cash flow, understand your financial habits, and make your spending stress-free."
    },
    {
      question: "Why people use FamFinity?",
      answer: "Join thousands of families who have transformed their financial management with FamFinity. Our app helps you manage money on the go with smart insights and beautiful analytics."
    },
    {
      question: "What features does FamFinity offer?",
      answer: "FamFinity offers shared wallets, smart analytics, customization options, multiple currencies, alerts and reminders, and seamless sync across devices."
    },
    {
      question: "How do I get started with FamFinity?",
      answer: "Simply sign up for a free account, connect your bank accounts or import CSV files, and start tracking your expenses. Get personalized advice to reach your financial goals."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! Your data is encrypted and protected with the highest security measures. You can trust that your money information is in safe hands with our state-of-the-art technology."
    },
    {
      question: "Can I use FamFinity with my family?",
      answer: "Yes! FamFinity is designed for families. Shared wallets are popular among couples, families and roommates who handle their finances together."
    }
  ];

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
      <section className="py-20 lg:py-32 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center max-w-4xl mx-auto" style={{ width: '100%' }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-white leading-tight mb-6 px-2" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-2px', lineHeight: '120%', wordWrap: 'break-word' }}>
              The only app that gets your money into shape
                </h1>
            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto px-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7', wordWrap: 'break-word' }}>
                Manage money on the go in the app. Take complete control of all your cash expenses, bank accounts, credit cards, and financial goals with smart AI-powered insights and beautiful analytics. Whether you're tracking daily expenses, planning for your child's education, or saving for that dream vacation, FamFinity makes financial management simple, intuitive, and stress-free for the entire family.
                </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                    <Link
                      to="/signup"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto touch-manipulation"
                style={{ backgroundColor: '#6246e9', color: 'white', minHeight: '44px' }}
                    >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Get Started
                    </Link>
                    <Link
                      to="/features"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 rounded-lg font-medium hover:opacity-80 transition-all duration-300 w-full sm:w-auto touch-manipulation"
                style={{ borderColor: '#221e2f', color: 'white', backgroundColor: 'transparent', minHeight: '44px' }}
                    >
                  Learn More
                    </Link>
                    {showInstallButton && (
                      <button
                        onClick={handleInstallClick}
                        className="inline-flex items-center justify-center px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 touch-manipulation w-full sm:w-auto"
                        style={{ 
                          backgroundColor: '#c2f52f', 
                          color: '#120b25', 
                          minHeight: '44px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        aria-label="Install FamFinity App"
                      >
                        <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="whitespace-nowrap" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Install App</span>
                      </button>
                    )}
              </div>
            </div>
          </div>
      </section>

      {/* Hero Image Section - Dashboard Mockup */}
      <section className="py-16 -mt-20 relative z-10 overflow-x-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex justify-center">
            <div className="max-w-6xl w-full rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#f7f9fc', maxWidth: '100%' }}>
              <div className="bg-white rounded-2xl p-2 sm:p-4">
                <img src={DashboardPreview} alt="FamFinity Dashboard" className="w-full h-auto rounded-xl" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <p className="text-center mb-8 text-base sm:text-lg px-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', wordWrap: 'break-word' }}>
            Trusted by 50,000+ families worldwide to manage their finances and achieve their financial goals. Join a community of smart families who have taken control of their financial future.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-60 px-4">
            <div className="text-base sm:text-xl font-semibold" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>FamFinity</div>
            <div className="text-base sm:text-xl font-semibold" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>Financial Partners</div>
            <div className="text-base sm:text-xl font-semibold" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>Bank Alliance</div>
            <div className="text-base sm:text-xl font-semibold" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>Trusted Advisor</div>
            <div className="text-base sm:text-xl font-semibold" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>Secure Finance</div>
        </div>
      </div>
      </section>

      {/* Take First Simplifying Your Financial Journey */}
      <section className="py-20 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Take First Simplifying Your Financial Journey
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              You can trust that your money is in safe hands. Our state-of-the-art security measures and advanced encryption technology ensure your financial data is protected with bank-level security. We use industry-leading practices to keep your information secure and private at all times.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Track your cash flow</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Connect your bank accounts and all transactions get automatically imported in real-time. Import CSV files from any financial institution for a complete overview of your cash flow. See all your accounts, credit cards, and digital wallets in one unified dashboard that updates automatically.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Understand your financial habits</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Analyze your finances with beautiful, simple, and easy-to-understand graphics and charts. See exactly where your money goes and where it comes from every month. Get insights into spending patterns, income trends, and identify opportunities to save more money for your family's future.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Make your spending stress-free</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Set smart budgets to help you not overspend in chosen categories. Get real-time alerts when you're approaching budget limits. Save money systematically for your future dreams and family goals like buying a home, children's education, retirement, or that once-in-a-lifetime family vacation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achieve Your Financial Goals with Confidence */}
      <section className="py-20 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Achieve Your Financial Goals with Confidence
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              You can trust that your money is in safe hands. Our state-of-the-art security measures and advanced encryption technology ensure your financial data is protected with bank-level security standards. We implement industry-leading practices to keep your information secure and private.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Smart Analytics</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Smart recommendations tailored to your financial goals effortlessly. FamFinity is preferred by families who want AI-powered insights into their spending patterns, helping them identify savings opportunities and make informed financial decisions that align with their long-term objectives.
              </p>
            </div>
            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Sync and backup</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Connect with banks, payment apps, and investment platforms seamlessly. Sync and backup features are valuable for everyone using FamFinity across multiple devices and sharing financial information with family members securely. Your data stays synchronized and protected across all your devices.
              </p>
            </div>
            <div className="p-8 rounded-xl transition-all" style={{ backgroundColor: 'transparent' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#221e2f' }}>
                <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Alerts and reminders</h3>
              <p className="text-base leading-relaxed" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Your data is encrypted and protected with the highest security standards. Smart alerts and reminders will notify you when bills are due, when you're approaching budget limits, or when important financial events occur, helping you stay on top of your finances without constant monitoring.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 rounded-lg font-medium transition-all duration-300"
              style={{ backgroundColor: '#6246e9', color: 'white' }}
            >
              Get Started
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Revolutionizing The Way You Manage Money */}
      <section className="py-20 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Revolutionizing The Way You Manage Money
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
              You can trust that your money is in safe hands. Our state-of-the-art security measures and advanced encryption technology ensure your financial data is protected with bank-level security. We're revolutionizing how families manage money with cutting-edge AI and intuitive design.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={HeroGraph} alt="Efficient Finance Management" className="w-full rounded-xl shadow-lg" />
              </div>
            <div>
              <h3 className="text-3xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Dual-Intelligence, Smarter Finance</h3>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                Our offline Finance Assistant analyzes your real transaction data to provide actionable insights based on your actual spending. The Gemini Chatbot explains financial concepts and answers any questions you have. You always get the right kind of help, whether you need data-driven analysis or conceptual explanations.
              </p>
              <p className="text-lg mb-8" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>
                AI predicts upcoming expenses based on past spending habits with proactive alerts for future financial risks. Consolidate budgets across multiple accounts and cards effortlessly. Set different budgets for personal and business expenses, individual family members, or specific categories that matter most to you.
              </p>
              <Link
                to="/features"
                className="inline-flex items-center px-6 py-3 border-2 rounded-lg font-medium hover:opacity-80 transition-all"
                style={{ borderColor: '#221e2f', color: 'white', backgroundColor: 'transparent', fontFamily: '"Inter Tight", sans-serif' }}
              >
                Explore Features
              </Link>
            </div>
              </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <h3 className="text-3xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Have perfect control over all your finances</h3>
              <p className="text-lg mb-6" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                Track cash expenses, bank accounts, and digital wallets. Get quick overview of incomes and expenses at a glance.
              </p>
              <p className="text-lg mb-8" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                Use smart budgets to save money for your dreams. Multiple currencies are favored by travelers and digital nomads managing money in more currencies.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all"
                style={{ backgroundColor: '#6246e9', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
              >
                Start Free
              </Link>
            </div>
            <div>
              <img src={AIBrain} alt="AI Financial Assistant" className="w-full rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Seize Financial Mastery with Our All-in-One Solution
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
              You can trust that your money is in safe hands. Our state-of-the-art security measures and advanced technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="rounded-xl overflow-hidden transition-all hover:bg-white/5" style={{ backgroundColor: '#221e2f' }}>
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="text-sm font-semibold mb-2" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>FAMFinity Finance</div>
                <div className="text-sm mb-4" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>10 min read</div>
                <h3 className="text-xl font-medium text-white mb-3" style={{ fontFamily: '"Inter Tight", sans-serif' }}>How to get your money into shape?</h3>
                <p className="mb-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  Follow these simple steps to take complete control of your family finances. FamFinity has completely transformed how families manage their finances.
                </p>
                <Link to="/features" className="inline-flex items-center font-medium hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
            <article className="rounded-xl overflow-hidden transition-all hover:bg-white/5" style={{ backgroundColor: '#221e2f' }}>
              <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="text-sm font-semibold mb-2" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>FAMFinity Finance</div>
                <div className="text-sm mb-4" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>10 min read</div>
                <h3 className="text-xl font-medium text-white mb-3" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Why people use FamFinity</h3>
                <p className="mb-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  The budgeting tools are incredibly intuitive, and I love how seamlessly it connects. Join thousands of families who have transformed their financial management.
                </p>
                <Link to="/features" className="inline-flex items-center font-medium hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
            </div>
            </article>
            <article className="rounded-xl overflow-hidden transition-all hover:bg-white/5" style={{ backgroundColor: '#221e2f' }}>
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="p-6">
                <div className="text-sm font-semibold mb-2" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>FAMFinity Finance</div>
                <div className="text-sm mb-4" style={{ color: '#939393', fontFamily: '"Inter Tight", sans-serif' }}>10 min read</div>
                <h3 className="text-xl font-medium text-white mb-3" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Features our users love</h3>
                <p className="mb-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  As a small business owner, managing both personal and business finances was challenging. Discover the powerful features that make FamFinity perfect.
                </p>
                <Link to="/features" className="inline-flex items-center font-medium hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
                </div>
          <div className="text-center mt-12">
            <Link to="/blog" className="font-semibold hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
              More Blogs →
            </Link>
                  </div>
                </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
              Quick Answers to Your Financial Queries
            </h2>
            <p className="text-xl" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
              Our team of experienced financial advisors is here to provide personalized guidance and support.
              </p>
            </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg overflow-hidden" style={{ border: '1px solid #221e2f' }}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  style={{ backgroundColor: '#221e2f' }}
                >
                  <span className="font-semibold text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`}
                    style={{ color: '#c4c4c4' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 border-t" style={{ backgroundColor: '#120b25', borderColor: '#221e2f' }}>
                    <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-12 sm:py-20 overflow-x-auto android-scroll-x" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-3 sm:mb-4 px-2" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              Seamlessly Links with 5k+ Applications
            </h2>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              Connect with banks, payment apps, and investment platforms to consolidate all your financial data in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8 items-center justify-center opacity-60 px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-lg p-4 sm:p-6 transition-all flex items-center justify-center h-20 sm:h-24 min-w-0" style={{ backgroundColor: '#221e2f' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0" style={{ backgroundColor: '#6246e9', opacity: 0.3 }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #6246e9 0%, #4c1fb8 100%)', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ width: '100%', maxWidth: '100%' }}>
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
            Start Your Journey with FamFinity
          </h2>
          <p className="text-xl mb-8" style={{ color: '#c0b5f6', fontFamily: '"Inter Tight", sans-serif' }}>
            Provide personalized guidance and support to help you make informed decisions about your finances.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'white', color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}
          >
            Get Started
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img src={Logo} alt="FamFinity" className="h-8 w-8 mr-2" />
                <span className="text-2xl font-medium text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>FamFinity</span>
              </div>
              <p className="mb-6 max-w-md" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                The only app that gets your money into shape. Take control of your family finances with smart insights and beautiful analytics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#939393' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#939393' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#939393' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#939393' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Features</Link></li>
                <li><Link to="/pricing" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Pricing</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Bank connection</Link></li>
                <li><Link to="/security" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>About us</Link></li>
                <li><Link to="/blog" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Blog</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Contact Us</Link></li>
                <li><Link to="/careers" className="transition-colors hover:text-white hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Career</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8" style={{ borderColor: '#221e2f' }}>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>&copy; 2024 FamFinity. All Rights Reserved. Made with ❤️ for families everywhere.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Privacy Policy</a>
                <a href="#" className="transition-colors hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Terms of Condition</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
