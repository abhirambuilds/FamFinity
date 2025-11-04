import React, { useState, useEffect } from 'react';

const InstallButton = ({ variant = 'default', className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/Mobile|Android|iPhone|iPad/.test(navigator.userAgent));
    };
    checkMobile();

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    } else {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const isSamsungBrowser = /SamsungBrowser/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent) && !isSamsungBrowser;
      
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
      } else {
        instructions = 'To install FamFinity:\n\n1. Look for the browser\'s menu or settings\n2. Find "Add to Home Screen" or "Install App"\n3. Follow the prompts to install\n\nAfter installation, you can open FamFinity from your home screen!';
      }
      
      alert(instructions);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert('To install FamFinity on your iPhone:\n\n1. Tap the Share button (square with arrow) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      } else {
        alert('Please check your browser menu for "Add to Home Screen" or "Install App" option.');
      }
    }
  };

  if (!showInstallButton) return null;

  const baseStyles = {
    backgroundColor: '#c2f52f',
    color: '#120b25',
    minHeight: '44px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: '"Inter Tight", sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
  };

  if (variant === 'sticky' && isMobile) {
    return (
      <button
        onClick={handleInstallClick}
        className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg font-medium transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-95 touch-manipulation ${className}`}
        style={{
          ...baseStyles,
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
        }}
        aria-label="Install FamFinity App"
      >
        <div className="flex items-center justify-center">
          <svg className="mr-2 w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Install</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className={`inline-flex items-center justify-center px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 touch-manipulation w-full sm:w-auto ${className}`}
      style={baseStyles}
      aria-label="Install FamFinity App"
    >
      <svg className="mr-2 w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Install App</span>
    </button>
  );
};

export default InstallButton;

