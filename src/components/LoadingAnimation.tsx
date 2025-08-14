import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation: React.FC = () => (
  <div className="loading-container">
    <div className="loading-title">Chargement ...</div>
    <div className="loading-dots">
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </div>
  </div>
);

export default LoadingAnimation;
