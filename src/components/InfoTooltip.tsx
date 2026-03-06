import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '0.25rem', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={14} color="var(--text-muted)" />
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          width: 'max-content',
          maxWidth: '250px',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          lineHeight: '1.4',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 100,
          whiteSpace: 'normal',
          textAlign: 'left'
        }}>
          {text}
          {/* Tooltip triangle */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-6px',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: 'var(--border) transparent transparent transparent'
          }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'var(--bg-base) transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};
