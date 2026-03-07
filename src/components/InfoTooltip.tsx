import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, align = 'center', children }) => {
  const [show, setShow] = useState(false);

  const getPositionStyles = () => {
    switch(align) {
      case 'left': return { left: '0', transform: 'none' };
      case 'right': return { right: '0', left: 'auto', transform: 'none' };
      default: return { left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const getTriangleStyles = () => {
    switch(align) {
      case 'left': return { left: '10px', marginLeft: '0' };
      case 'right': return { right: '10px', left: 'auto', marginLeft: '0' };
      default: return { left: '50%', marginLeft: '-6px' };
    }
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: children ? '0' : '0.25rem', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || <Info size={14} color="var(--text-muted)" />}
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          ...getPositionStyles(),
          marginBottom: '8px',
          width: '200px',
          maxWidth: '200px',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          lineHeight: '1.4',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 100,
          whiteSpace: 'pre-wrap',
          textAlign: 'left'
        }}>
          {text}
          {/* Tooltip triangle */}
          <div style={{
            position: 'absolute',
            top: '100%',
            ...getTriangleStyles(),
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: 'var(--border) transparent transparent transparent'
          }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            ...getTriangleStyles(),
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'var(--bg-base) transparent transparent transparent',
            marginTop: '-1px'
          }} />
        </div>
      )}
    </div>
  );
};
