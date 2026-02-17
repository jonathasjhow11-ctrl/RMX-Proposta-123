
import React from 'react';

export const COLORS = {
  primary: '#facc15', // Yellow 400
  secondary: '#000000',
  accent: '#18181b', // Zinc 900
};

export const RaimundixLogo: React.FC<{ size?: number; color?: string }> = ({ size = 60, color = "#facc15" }) => (
  <div style={{ width: size, height: size }} className="flex items-center justify-center">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" />
      <path d="M55 15L30 55H50L45 85L70 45H50L55 15Z" fill={color} />
    </svg>
  </div>
);
