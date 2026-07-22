import React from 'react';

/**
 * پرچم شیر و خورشید ایران با هاله طلایی درخشان
 * @param {number} size - سایز پرچم به پیکسل (پیش‌فرض ۶۴)
 * @param {boolean} glow - نمایش هاله طلایی (پیش‌فرض true)
 * @param {boolean} animated - انیمیشن پویا (پیش‌فرض true)
 */
export default function IranFlag({ size = 64, glow = true, animated = true, className = '' }) {
  return (
    <div 
      className={`iran-flag-container ${animated ? 'flag-animated' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size * 0.6}px`,
        position: 'relative',
        display: 'inline-block'
      }}
      title="پرچم شیر و خورشید ایران"
    >
      {glow && <div className="flag-glow" />}
      <img
        src="./iran-flag.png"
        alt="پرچم شیر و خورشید ایران"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '6px',
          border: '2px solid var(--accent-primary)',
          boxShadow: glow ? '0 0 20px var(--accent-glow), inset 0 0 10px rgba(255, 215, 0, 0.2)' : 'none',
          position: 'relative',
          zIndex: 1
        }}
      />
    </div>
  );
}