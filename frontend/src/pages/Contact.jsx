import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo-mark.svg';
import ContactSupport from '../assets/contact-support.svg';
import InstallButton from '../components/InstallButton';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    setSubmitted(true);
  };

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
            <h1 className="text-5xl md:text-6xl font-medium text-white leading-tight mb-6 px-2" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-2px', lineHeight: '120%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', WebkitHyphens: 'auto' }}>
              Contact Us
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto px-4" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', WebkitHyphens: 'auto' }}>
              Have questions about FamFinity? Need help with your account? Want to share feedback? We'd love to hear from you. Our dedicated support team is here to help you make the most of your financial journey. Send us a message and we'll respond as soon as possible—typically within 24 hours during business days.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif' }}>
                Get in Touch
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center p-4 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#120b25' }}>
                    <svg className="w-7 h-7" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Email</h3>
                    <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>support@famfinity.com<br />Drop us an email anytime and our team will get back to you promptly.</p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#120b25' }}>
                    <svg className="w-7 h-7" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Response Time</h3>
                    <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>We typically respond within 24 hours during business days. For urgent matters, please mention "URGENT" in your subject line for priority handling.</p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#120b25' }}>
                    <svg className="w-7 h-7" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Live Chat</h3>
                    <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>Available Monday-Friday, 9AM-6PM EST. Our live chat support provides instant answers to your questions during business hours.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: '#221e2f' }}>
                <h3 className="text-lg font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Is my financial data secure?</h4>
                    <p className="text-sm" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>Yes, we use bank-level encryption and security measures to protect your data. All your financial information is encrypted using industry-standard protocols and stored securely.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Can I import data from my bank?</h4>
                    <p className="text-sm" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>Yes, you can upload CSV files from most banks and financial institutions. Our system automatically recognizes and processes transactions from major banks worldwide.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Is there a mobile app?</h4>
                    <p className="text-sm" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>Our mobile app is coming soon! For now, our web app is fully responsive and works great on mobile browsers. You can access all features from your smartphone or tablet.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="rounded-xl p-8" style={{ backgroundColor: '#221e2f' }}>
                <h2 className="text-3xl font-medium text-white mb-6" style={{ fontFamily: '"Inter Tight", sans-serif' }}>
                  Send us a Message
                </h2>
                
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#120b25' }}>
                      <svg className="w-10 h-10" style={{ color: '#6246e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Message Sent!</h3>
                    <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif', lineHeight: '1.7' }}>Thank you for your message. We've received it and our team will review and respond within 24 hours. We appreciate you reaching out to us!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                        style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                        onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                        onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                        style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                        onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                        onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all resize-none"
                        style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                        onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                        onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                        placeholder="Your message here..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-300"
                      style={{ backgroundColor: '#6246e9', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
              <div className="mt-8 rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: '#221e2f' }}>
                <div className="p-6">
                  <img src={ContactSupport} alt="Contact support" className="w-full h-auto rounded-xl" />
                </div>
              </div>
            </div>
          </div>
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

      {/* Sticky Install Button for Mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <InstallButton variant="sticky" />
      </div>
    </div>
  );
};

export default Contact;
