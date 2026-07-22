import React, { useEffect, useState } from 'react';

export default function GoldParticles({ count = 30 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 20,
      size: 2 + Math.random() * 3
    }));
    setParticles(generatedParticles);
  }, [count]);

  return (
    <div className="gold-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="gold-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
}