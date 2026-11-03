import React, { useState } from 'react';

export const FarhanMotorLogo: React.FC<{ size?: number; className?: string }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer circle with gradient and soft glow */}
    <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2.5" opacity="0.95" fill="rgba(255, 255, 255, 0.12)" />
    {/* Motorcycle icon silhouette */}
    <path
      d="M18 42C20.7614 42 23 39.7614 23 37C23 34.2386 20.7614 32 18 32C15.2386 32 13 34.2386 13 37C13 39.7614 15.2386 42 18 42Z"
      stroke="white"
      strokeWidth="2.5"
    />
    <path
      d="M46 42C48.7614 42 51 39.7614 51 37C51 34.2386 48.7614 32 46 32C43.2386 32 41 34.2386 41 37C41 39.7614 43.2386 42 46 42Z"
      stroke="white"
      strokeWidth="2.5"
    />
    <path
      d="M18 37L27 27H37L42 32M46 37L39 27L36 21H29"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Handlebar & headlight */}
    <path d="M33 19L38 21L42 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* FM monogram crest */}
    <text
      x="32"
      y="50"
      textAnchor="middle"
      fill="white"
      fontSize="9.5"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="800"
      letterSpacing="1"
    >
      FM
    </text>
  </svg>
);

export const HondaLogo: React.FC<{
  size?: number;
  onClick?: () => void;
  interactive?: boolean;
}> = ({ size = 46, onClick, interactive = true }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Klik untuk diagnosa motor Honda"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '10px 14px 8px',
        background: hovered
          ? 'linear-gradient(145deg, #FFFFFF 0%, #FFF5F5 100%)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '18px',
        boxShadow: hovered
          ? '0 12px 28px -4px rgba(220, 38, 38, 0.35), 0 0 0 2px #DC2626'
          : '0 8px 20px -3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(220, 38, 38, 0.18)',
        border: 'none',
        cursor: interactive ? 'pointer' : 'default',
        transform: hovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        outline: 'none',
        position: 'relative',
      }}
    >
      <svg width={size} height={size * 0.72} viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 34C18 33 34 26 50 10C42 20 28 28 14 30C26 27 40 18 54 4C44 14 32 20 18 24C32 20 46 12 58 2C42 14 24 24 6 34Z"
          fill="#DC2626"
        />
        <path
          d="M8 38C20 37 36 32 46 22C38 28 26 33 14 35C24 33 36 26 48 16C40 22 28 28 16 32C4 36 4 37 8 38Z"
          fill="#DC2626"
        />
      </svg>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '1px' }}>HONDA</span>
      {interactive && (
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: hovered ? '#DC2626' : '#94A3B8',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
        >
          {hovered ? 'Diagnosa →' : 'Pilih Motor'}
        </span>
      )}
    </button>
  );
};

export const YamahaLogo: React.FC<{
  size?: number;
  onClick?: () => void;
  interactive?: boolean;
}> = ({ size = 46, onClick, interactive = true }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Klik untuk diagnosa motor Yamaha"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '10px 14px 8px',
        background: hovered
          ? 'linear-gradient(145deg, #FFFFFF 0%, #FFF5F5 100%)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '18px',
        boxShadow: hovered
          ? '0 12px 28px -4px rgba(220, 38, 38, 0.35), 0 0 0 2px #DC2626'
          : '0 8px 20px -3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(220, 38, 38, 0.18)',
        border: 'none',
        cursor: interactive ? 'pointer' : 'default',
        transform: hovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        outline: 'none',
        position: 'relative',
      }}
    >
      <svg width={size} height={size * 0.72} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="21" stroke="#DC2626" strokeWidth="2.5" />
        <path d="M24 6V24M24 24L10 32M24 24L38 32" stroke="#DC2626" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M20 10H28M11 26L15 34M37 26L33 34" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '1px' }}>YAMAHA</span>
      {interactive && (
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: hovered ? '#DC2626' : '#94A3B8',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
        >
          {hovered ? 'Diagnosa →' : 'Pilih Motor'}
        </span>
      )}
    </button>
  );
};

export const MILBadgeIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="10" fill="#1E6DE8" />
    <path
      d="M7 13H9V19H7V13ZM23 13H25V19H23V13ZM11 11H21V21H11V11ZM13 9H19V11H13V9ZM13 21H19V23H13V21ZM14 14V18M18 14V18"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
