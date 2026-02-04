import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0" style={{backgroundColor: '#0f0f1e'}}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes gradient-shift {
          0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
          50% { transform: translate(20%, 20%) rotate(180deg); }
        }
        @keyframes drift {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-100vh) translateX(50px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .particle {
          animation: drift linear infinite;
        }
        .gradient-orb {
          animation: gradient-shift 20s ease-in-out infinite;
        }
        .pulsing-glow {
          animation: pulse 4s ease-in-out infinite;
        }
        .floating-shape {
          animation: float 15s ease-in-out infinite;
        }
        .rotating-gradient {
          animation: rotate 30s linear infinite;
        }
      `}</style>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 gradient-orb rounded-full blur-3xl opacity-30" 
        style={{background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)'}}></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 gradient-orb rounded-full blur-3xl opacity-30" 
        style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animationDelay: '5s'}}></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 gradient-orb rounded-full blur-3xl opacity-20" 
        style={{background: 'radial-gradient(circle, #9333ea 0%, transparent 70%)', animationDelay: '10s'}}></div>
      
      {/* Pulsing glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 pulsing-glow rounded-full blur-2xl" 
        style={{background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)', animationDelay: '0s'}}></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 pulsing-glow rounded-full blur-2xl" 
        style={{background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)', animationDelay: '2s'}}></div>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: i % 2 === 0 ? '#a855f7' : '#f97316',
            opacity: Math.random() * 0.5 + 0.3,
            animationDuration: `${Math.random() * 20 + 15}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        ></div>
      ))}
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 floating-shape opacity-20" 
        style={{
          background: 'linear-gradient(135deg, #a855f7, transparent)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          animationDelay: '0s'
        }}></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 floating-shape opacity-20" 
        style={{
          background: 'linear-gradient(135deg, #f97316, transparent)',
          borderRadius: '50%',
          animationDelay: '3s'
        }}></div>
      <div className="absolute top-1/3 right-1/3 w-16 h-16 floating-shape opacity-15" 
        style={{
          background: 'linear-gradient(45deg, #a855f7, #f97316)',
          transform: 'rotate(45deg)',
          animationDelay: '6s'
        }}></div>
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 rotating-gradient opacity-10" 
        style={{
          background: 'linear-gradient(45deg, #a855f7 0%, #f97316 50%, #a855f7 100%)',
          backgroundSize: '200% 200%',
          filter: 'blur(100px)',
        }}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>
    </div>
  );
};

export default AnimatedBackground;
