'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 text-white border-t border-gray-800 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm">
        📱 Install PricePulse App for faster access & instant price alerts!
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition-colors"
        >
          Install Now
        </button>
      </div>
    </div>
  );
}
