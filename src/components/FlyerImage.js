import React, { useState } from 'react';
import './FlyerImage.css';

/**
 * FlyerImage component that gracefully handles broken URLs
 * If the image fails to load, it simply doesn't render anything
 */
const FlyerImage = ({ src, alt, className = '', ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render if no src or if there was an error
  if (!src || imageError) {
    return null;
  }

  const handleError = () => {
    setImageError(true);
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`flyer-image-wrapper ${className}`}>
      {!imageLoaded && (
        <div className="flyer-loading">Loading image...</div>
      )}
      <img
        src={src}
        alt={alt || 'Event flyer'}
        className={`flyer-image ${imageLoaded ? 'loaded' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default FlyerImage;
