// src/components/common/logo.tsx
import type React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className, width = 280, height = 80 }) => {
  const primaryColor = "#7C253A"; // Maroon
  const accentColor = "#F2C04E"; // Golden Yellow
  const taglineColor = "#6A2436"; // Slightly darker maroon for tagline

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 90" // Adjusted viewBox for better aspect ratio
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ENGEAR Logo"
    >
      {/* Stylized graphic element for "AR" */}
      <path 
        d="M10 45 C10 25, 20 15, 45 15 C70 15, 80 25, 80 45 C80 65, 70 75, 45 75 C20 75, 10 65, 10 45 Z M45 20 L25 45 L45 70 L65 45 Z" 
        fill={primaryColor} 
      />
      <text 
        x="45" 
        y="47" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="26" 
        fontWeight="bold" 
        fill={accentColor} 
        textAnchor="middle" 
        dominantBaseline="middle"
      >
        AR
      </text>

      {/* ENGEAR Text */}
      <text 
        x="100" 
        y="38" 
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" 
        fontSize="40" 
        fontWeight="600" 
        fill={primaryColor} 
        dominantBaseline="central"
        letterSpacing="0.5"
      >
        ENGEAR
      </text>
      {/* Tagline */}
      <text 
        x="100" 
        y="66" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="11" 
        fill={taglineColor} 
        dominantBaseline="central"
      >
        Engenharia de Aquecimento e Refrigeração Ltda.
      </text>
    </svg>
  );
};

export default Logo;
