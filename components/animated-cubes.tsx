"use client";

export function AnimatedCubes() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-purple-500/3 to-transparent"></div>
      
      {/* Main container with perspective */}
      <div 
        className="relative" 
        style={{ 
          perspective: '1200px',
          transform: 'rotateX(10deg) rotateY(-15deg)'
        }}
      >
        <div className="relative w-96 h-96">
          
          {/* Cube 1 - Top Center */}
          <div 
            className="absolute"
            style={{
              width: '100px',
              height: '100px',
              top: '50px',
              left: '150px',
              transformStyle: 'preserve-3d',
              animation: 'float 8s ease-in-out infinite',
              animationDelay: '0s'
            }}
          >
            {/* Front face */}
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg"
              style={{ 
                transform: 'translateZ(50px)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
              }}
            ></div>
            
            {/* Right face */}
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ 
                transform: 'rotateY(90deg) translateZ(50px)',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)'
              }}
            ></div>
            
            {/* Top face with flowing animation */}
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(50px)',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 4s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 2 - Top Right */}
          <div 
            className="absolute"
            style={{
              width: '90px',
              height: '90px',
              top: '80px',
              left: '250px',
              transformStyle: 'preserve-3d',
              animation: 'float 7s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          >
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600"
              style={{ transform: 'translateZ(45px)' }}
            ></div>
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ transform: 'rotateY(90deg) translateZ(45px)' }}
            ></div>
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(45px)',
                background: 'linear-gradient(45deg, #f59e0b, #ef4444, #f59e0b)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 4.5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3.2s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 3 - Middle Left */}
          <div 
            className="absolute"
            style={{
              width: '95px',
              height: '95px',
              top: '150px',
              left: '80px',
              transformStyle: 'preserve-3d',
              animation: 'float 9s ease-in-out infinite',
              animationDelay: '3s'
            }}
          >
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600"
              style={{ transform: 'translateZ(47px)' }}
            ></div>
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ transform: 'rotateY(90deg) translateZ(47px)' }}
            ></div>
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(47px)',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.8s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 4 - Center Large */}
          <div 
            className="absolute"
            style={{
              width: '110px',
              height: '110px',
              top: '140px',
              left: '170px',
              transformStyle: 'preserve-3d',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '2s'
            }}
          >
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 shadow-xl"
              style={{ transform: 'translateZ(55px)' }}
            ></div>
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ transform: 'rotateY(90deg) translateZ(55px)' }}
            ></div>
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(55px)',
                background: 'linear-gradient(45deg, #10b981, #06b6d4, #10b981)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 3.5s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-70"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.5s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 5 - Bottom Left */}
          <div 
            className="absolute"
            style={{
              width: '85px',
              height: '85px',
              top: '240px',
              left: '120px',
              transformStyle: 'preserve-3d',
              animation: 'float 10s ease-in-out infinite',
              animationDelay: '4s'
            }}
          >
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600"
              style={{ transform: 'translateZ(42px)' }}
            ></div>
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ transform: 'rotateY(90deg) translateZ(42px)' }}
            ></div>
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(42px)',
                background: 'linear-gradient(45deg, #6366f1, #3b82f6, #6366f1)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 6s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3.8s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

          {/* Cube 6 - Bottom Right */}
          <div 
            className="absolute"
            style={{
              width: '88px',
              height: '88px',
              top: '220px',
              left: '240px',
              transformStyle: 'preserve-3d',
              animation: 'float 8.5s ease-in-out infinite',
              animationDelay: '5.5s'
            }}
          >
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600"
              style={{ transform: 'translateZ(44px)' }}
            ></div>
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-700"
              style={{ transform: 'rotateY(90deg) translateZ(44px)' }}
            ></div>
            <div 
              className="absolute w-full h-full border border-gray-300 dark:border-gray-600 overflow-hidden"
              style={{ 
                transform: 'rotateX(90deg) translateZ(44px)',
                background: 'linear-gradient(45deg, #ef4444, #f97316, #ef4444)',
                backgroundSize: '300% 300%',
                animation: 'flowingGradient 4.8s ease-in-out infinite'
              }}
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3.3s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* Global styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          33% {
            transform: translateY(-15px) rotateX(2deg) rotateY(1deg);
          }
          66% {
            transform: translateY(-8px) rotateX(-1deg) rotateY(-2deg);
          }
        }
        
        @keyframes flowingGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}