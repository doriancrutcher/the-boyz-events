import React, { useState, useEffect } from 'react';
import { isInstagramBrowser, isInAppBrowser, getBrowserInstructions } from '../utils/browserDetection';
import './InAppBrowserPrompt.css';

const InAppBrowserPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [instructions, setInstructions] = useState(null);

  useEffect(() => {
    // Check if user is in Instagram or other in-app browser
    if (isInAppBrowser() && !dismissed) {
      // Check if user has dismissed this before (using sessionStorage)
      const hasDismissed = sessionStorage.getItem('inAppBrowserPromptDismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
        setInstructions(getBrowserInstructions());
      }
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for this session (not permanent, so they see it again next time)
    // You can change this to use a longer expiration if desired
    sessionStorage.setItem('inAppBrowserPromptDismissed', 'true');
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Link copied! Paste it in your browser.');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied! Paste it in your browser.');
    });
  };

  if (!showPrompt) {
    return null;
  }

  const isInstagram = isInstagramBrowser();

  return (
    <div className="in-app-browser-prompt-overlay">
      <div className="in-app-browser-prompt">
        <div className="prompt-header">
          <span className="prompt-icon">🌐</span>
          <h3>Open in Your Browser</h3>
        </div>
        
        <div className="prompt-content">
          <p>
            You're viewing this in {isInstagram ? "Instagram's" : "an in-app"} browser. 
            For the best experience, open this page in your default browser.
          </p>
          
          {instructions && (
            <div className="instructions">
              <strong>How to open in your browser:</strong>
              <ol>
                {instructions.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="prompt-actions">
            <button 
              onClick={handleCopyLink}
              className="copy-link-btn"
            >
              📋 Copy Link
            </button>
            <button 
              onClick={handleDismiss}
              className="dismiss-btn"
            >
              Continue Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InAppBrowserPrompt;
