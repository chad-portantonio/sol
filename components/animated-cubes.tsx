"use client";

export function AnimatedCubes() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-purple-500/8 to-transparent"></div>
      
      {/* Main isometric container with forced 3D context */}
      <div 
        className="relative" 
        style={{ 
          perspective: '1200px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="relative w-[500px] h-[500px]"
          style={{
            transform: 'rotateX(65deg) rotateY(-30deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          
          {/* Cube 1 - Large Hero Cube (Center) */}
          <div 
            className="absolute"
            style={{
              width: '140px',
              height: '140px',
              top: '180px',
              left: '180px',
              transformStyle: 'preserve-3d',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '0s'
            }}
          >
            {/* Front face - bright with depth */}
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(70px)',
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.1)'
              }}
            ></div>
            
            {/* Right face - darker with depth */}
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(70px)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.1)'
              }}
            ></div>
            
            {/* Top face - vibrant with animation */}
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1, #3b82f6)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(70px)',
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 4s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  animation: 'shimmer 2.5s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 2 - Top Right (Medium) */}
          <div 
            className="absolute"
            style={{
              width: '110px',
              height: '110px',
              top: '80px',
              left: '380px',
              transformStyle: 'preserve-3d',
              animation: 'float 7s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          >
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(55px)',
                boxShadow: 'inset 0 0 25px rgba(255,255,255,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(55px)',
                boxShadow: 'inset 0 0 25px rgba(0,0,0,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #f59e0b, #ef4444, #f97316, #f59e0b)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(55px)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 3 - Top Left (Medium) */}
          <div 
            className="absolute"
            style={{
              width: '100px',
              height: '100px',
              top: '120px',
              left: '50px',
              transformStyle: 'preserve-3d',
              animation: 'float 8s ease-in-out infinite',
              animationDelay: '3s'
            }}
          >
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(50px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(50px)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #d946ef, #8b5cf6)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(50px)',
                boxShadow: '0 0 25px rgba(139, 92, 246, 0.7), inset 0 0 15px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 6s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'shimmer 3.5s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 4 - Bottom Left (Large) */}
          <div 
            className="absolute"
            style={{
              width: '130px',
              height: '130px',
              top: '320px',
              left: '80px',
              transformStyle: 'preserve-3d',
              animation: 'float 5.5s ease-in-out infinite',
              animationDelay: '2s'
            }}
          >
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(65px)',
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(65px)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #10b981, #06b6d4, #14b8a6, #10b981)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(65px)',
                boxShadow: '0 0 35px rgba(16, 185, 129, 0.8), inset 0 0 20px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 3.5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  animation: 'shimmer 2s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 5 - Bottom Right (Medium) */}
          <div 
            className="absolute"
            style={{
              width: '95px',
              height: '95px',
              top: '350px',
              left: '350px',
              transformStyle: 'preserve-3d',
              animation: 'float 9s ease-in-out infinite',
              animationDelay: '4s'
            }}
          >
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(47px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(47px)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #6366f1, #3b82f6, #6d28d9, #6366f1)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(47px)',
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.7), inset 0 0 15px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 7s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'shimmer 4s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 6 - Middle Right (Small but prominent) */}
          <div 
            className="absolute"
            style={{
              width: '85px',
              height: '85px',
              top: '220px',
              left: '400px',
              transformStyle: 'preserve-3d',
              animation: 'float 6.5s ease-in-out infinite',
              animationDelay: '1s'
            }}
          >
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transform: 'translateZ(42px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                transform: 'rotateY(90deg) translateZ(42px)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            ></div>
            <div 
              className="absolute w-full h-full border-2 border-white/30 overflow-hidden"
              style={{ 
                background: 'linear-gradient(45deg, #ef4444, #f97316, #dc2626, #ef4444)',
                backgroundSize: '200% 200%',
                transform: 'rotateX(90deg) translateZ(42px)',
                boxShadow: '0 0 25px rgba(239, 68, 68, 0.7), inset 0 0 15px rgba(255,255,255,0.3)',
                animation: 'flowingGradient 4.5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'shimmer 2.8s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}