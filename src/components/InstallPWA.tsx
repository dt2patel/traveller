
import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

// This is a simplified approach. A more robust solution might use a library
// or more complex browser feature detection.
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

const InstallPWA: React.FC = () => {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        // Show prompt only if on iOS and not already in standalone mode
        if (isIos() && !isInStandaloneMode()) {
            setShowInstallPrompt(true);
        }
    }, []);

    if (!showInstallPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white p-4 rounded-lg shadow-lg border z-50">
            <button onClick={() => setShowInstallPrompt(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="flex items-center space-x-3">
                <img src="/icons/android-chrome-192x192.png" alt="App Icon" className="w-12 h-12" />
                <div>
                    <p className="font-semibold text-gray-800">Install India Log</p>
                    <p className="text-sm text-gray-600">Add to your Home Screen for a better experience.</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Tap the 'Share' icon and then 'Add to Home Screen'.
            </p>
        </div>
    );
};

export default InstallPWA;
