'use client';

import { useState, useEffect } from 'react';
import { X, Share, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check if dismissed recently (7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const isMobile = isIOSDevice || isAndroidDevice || window.innerWidth < 768;

    if (!isMobile) return;

    setIsIOS(isIOSDevice);

    // iOS doesn't support beforeinstallprompt - show instructions immediately
    if (isIOSDevice) {
      // Check if in Safari (PWA install only works in Safari on iOS)
      const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
      if (isSafari) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
      return;
    }

    // Android/Chrome - listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Can't programmatically install on iOS, just keep showing instructions
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 mx-auto max-w-md relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-[#0d5c4b] rounded-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/icons/icon-192x192.png"
              alt="Waypoint"
              width={32}
              height={32}
              className="rounded"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Install Waypoint</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Add to your home screen for quick access
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Share className="w-4 h-4" />
              </div>
              <span>Tap the <strong>Share</strong> button in Safari</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span>Select <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
            </div>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full mt-2"
            >
              Got it
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            className="w-full mt-4 bg-[#0d5c4b] hover:bg-[#0a4a3c]"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        )}
      </div>
    </div>
  );
}
