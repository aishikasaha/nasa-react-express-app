import React from 'react';
import LoadingAnimation from './LoadingAnimation';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return <LoadingAnimation size={size} message={message} type="space" />;
};

export default LoadingSpinner;
