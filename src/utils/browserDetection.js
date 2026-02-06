/**
 * Detect if user is in Instagram's in-app browser
 */
export const isInstagramBrowser = () => {
  if (typeof window === 'undefined' || !navigator) {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Instagram's in-app browser user agent patterns
  const instagramPatterns = [
    /Instagram/i,
    /FBAN/i,  // Facebook App (Instagram uses this)
    /FBAV/i,  // Facebook App Version
  ];

  return instagramPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Detect if user is in Facebook's in-app browser
 */
export const isFacebookBrowser = () => {
  if (typeof window === 'undefined' || !navigator) {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /FBAN/i.test(userAgent) || /FBAV/i.test(userAgent);
};

/**
 * Detect if user is in any in-app browser (Instagram, Facebook, etc.)
 */
export const isInAppBrowser = () => {
  return isInstagramBrowser() || isFacebookBrowser();
};

/**
 * Get instructions for opening in default browser based on platform
 */
export const getBrowserInstructions = () => {
  if (typeof window === 'undefined') {
    return { platform: 'unknown', instructions: [] };
  }

  const userAgent = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);

  if (isIOS) {
    return {
      platform: 'ios',
      instructions: [
        'Tap the "..." menu in the bottom right',
        'Select "Open in Safari" or "Open in Browser"',
        'Or copy the link and paste it in Safari'
      ]
    };
  } else if (isAndroid) {
    return {
      platform: 'android',
      instructions: [
        'Tap the "..." menu (three dots) in the top right',
        'Select "Open in Browser" or "Open in Chrome"',
        'Or copy the link and paste it in your browser'
      ]
    };
  }

  return {
    platform: 'unknown',
    instructions: [
      'Look for a menu option to "Open in Browser"',
      'Or copy this page URL and paste it in your default browser'
    ]
  };
};
