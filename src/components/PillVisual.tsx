import React from 'react';
import { PillShape } from '../types/medicine';

interface PillVisualProps {
  shape: PillShape;
  colorHex: string;
  colorName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  markings?: string;
  className?: string;
  isTaken?: boolean;
}

export const PillVisual: React.FC<PillVisualProps> = ({
  shape,
  colorHex,
  colorName,
  size = 'md',
  markings,
  className = '',
  isTaken = false,
}) => {
  const sizeMap = {
    sm: { w: 36, h: 36, view: 40 },
    md: { w: 56, h: 56, view: 64 },
    lg: { w: 76, h: 76, view: 80 },
    xl: { w: 104, h: 104, view: 100 },
  };

  const { w, h, view } = sizeMap[size];

  // Derive secondary shading color
  const baseColor = colorHex || '#3B82F6';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 ${
        isTaken ? 'opacity-60 scale-95 grayscale-[30%]' : 'hover:scale-105'
      } ${className}`}
      title={colorName ? `${colorName} ${shape}` : `${shape} pill`}
      style={{ width: w, height: h }}
    >
      <svg
        viewBox={`0 0 ${view} ${view}`}
        width={w}
        height={h}
        className="drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Linear gradient for 3D pill curvature */}
          <linearGradient id={`grad-${shape}-${baseColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="35%" stopColor={baseColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          {/* Capsule two-tone gradient */}
          <linearGradient id={`capsule-left-${baseColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>

          {/* Soft shadow */}
          <filter id="pill-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {shape === 'round' && (
          <g filter="url(#pill-shadow)">
            <circle
              cx={view / 2}
              cy={view / 2}
              r={view * 0.4}
              fill={baseColor}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Glossy top-left reflection */}
            <path
              d={`M ${view * 0.25} ${view * 0.3} A ${view * 0.3} ${view * 0.3} 0 0 1 ${view * 0.65} ${view * 0.22}`}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={view * 0.07}
              strokeLinecap="round"
              fill="none"
            />
            {/* Center score line */}
            <line
              x1={view * 0.3}
              y1={view / 2}
              x2={view * 0.7}
              y2={view / 2}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {shape === 'oval' && (
          <g filter="url(#pill-shadow)">
            <ellipse
              cx={view / 2}
              cy={view / 2}
              rx={view * 0.44}
              ry={view * 0.28}
              fill={baseColor}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              transform={`rotate(-20 ${view / 2} ${view / 2})`}
            />
            {/* Highlight */}
            <ellipse
              cx={view * 0.45}
              cy={view * 0.38}
              rx={view * 0.25}
              ry={view * 0.08}
              fill="rgba(255,255,255,0.55)"
              transform={`rotate(-20 ${view / 2} ${view / 2})`}
            />
          </g>
        )}

        {shape === 'capsule' && (
          <g
            filter="url(#pill-shadow)"
            transform={`rotate(-35 ${view / 2} ${view / 2})`}
          >
            {/* Pill body outer */}
            <rect
              x={view * 0.15}
              y={view * 0.3}
              width={view * 0.7}
              height={view * 0.4}
              rx={view * 0.2}
              fill={baseColor}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            {/* Half cap in white or contrasting tint */}
            <path
              d={`M ${view * 0.15 + view * 0.2} ${view * 0.3} L ${view * 0.5} ${view * 0.3} L ${view * 0.5} ${view * 0.7} L ${view * 0.15 + view * 0.2} ${view * 0.7} A ${view * 0.2} ${view * 0.2} 0 0 1 ${view * 0.15 + view * 0.2} ${view * 0.3} Z`}
              fill="#FFFFFF"
              fillOpacity="0.88"
            />
            {/* Middle joining band line */}
            <line
              x1={view * 0.5}
              y1={view * 0.3}
              x2={view * 0.5}
              y2={view * 0.7}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="2"
            />
            {/* Top glossy shine streak */}
            <line
              x1={view * 0.28}
              y1={view * 0.38}
              x2={view * 0.72}
              y2={view * 0.38}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={view * 0.05}
              strokeLinecap="round"
            />
          </g>
        )}

        {shape === 'square' && (
          <g filter="url(#pill-shadow)">
            <rect
              x={view * 0.18}
              y={view * 0.18}
              width={view * 0.64}
              height={view * 0.64}
              rx={view * 0.14}
              fill={baseColor}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Cross score */}
            <line
              x1={view * 0.3}
              y1={view / 2}
              x2={view * 0.7}
              y2={view / 2}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="2"
            />
            <line
              x1={view / 2}
              y1={view * 0.3}
              x2={view / 2}
              y2={view * 0.7}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="2"
            />
          </g>
        )}

        {shape === 'liquid_drop' && (
          <g filter="url(#pill-shadow)">
            <path
              d={`M ${view / 2} ${view * 0.15} C ${view * 0.3} ${view * 0.45} ${view * 0.2} ${view * 0.6} ${view * 0.2} ${view * 0.7} A ${view * 0.3} ${view * 0.3} 0 0 0 ${view * 0.8} ${view * 0.7} C ${view * 0.8} ${view * 0.6} ${view * 0.7} ${view * 0.45} ${view / 2} ${view * 0.15} Z`}
              fill={baseColor}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Droplet shine */}
            <ellipse
              cx={view * 0.4}
              cy={view * 0.65}
              rx={view * 0.1}
              ry={view * 0.15}
              fill="rgba(255,255,255,0.6)"
              transform={`rotate(-25 ${view * 0.4} ${view * 0.65})`}
            />
          </g>
        )}

        {shape === 'triangle' && (
          <g filter="url(#pill-shadow)">
            <polygon
              points={`${view / 2},${view * 0.18} ${view * 0.85},${view * 0.8} ${view * 0.15},${view * 0.8}`}
              fill={baseColor}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <ellipse
              cx={view * 0.46}
              cy={view * 0.48}
              rx={view * 0.14}
              ry={view * 0.08}
              fill="rgba(255,255,255,0.6)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
