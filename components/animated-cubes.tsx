"use client";

import { useEffect, useRef } from 'react';

export function AnimatedCubes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add CSS animation keyframes if they don't exist
    const styleSheet = document.styleSheets[0];
    const keyframes = `
      @keyframes flowingLight {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotateX(0deg) rotateY(0deg);
        }
        50% {
          transform: translateY(-10px) rotateX(5deg) rotateY(5deg);
        }
      }
    `;

    try {
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    } catch (e) {
      // Keyframes might already exist
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-1000">
      <div className="relative w-80 h-80">
        {/* Cube 1 - Top */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '20px',
            left: '100px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '0s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 dark:from-blue-500 dark:via-purple-500 dark:to-blue-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite'
            }}
          ></div>
        </div>

        {/* Cube 2 - Top Right */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '40px',
            left: '180px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '1s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 dark:from-orange-500 dark:via-yellow-500 dark:to-orange-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          ></div>
        </div>

        {/* Cube 3 - Middle Left */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '120px',
            left: '60px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '2s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite',
              animationDelay: '1s'
            }}
          ></div>
        </div>

        {/* Cube 4 - Center */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '140px',
            left: '140px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '3s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-green-400 via-teal-400 to-green-400 dark:from-green-500 dark:via-teal-500 dark:to-green-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          ></div>
        </div>

        {/* Cube 5 - Bottom Left */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '220px',
            left: '80px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '4s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 dark:from-indigo-500 dark:via-blue-500 dark:to-indigo-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite',
              animationDelay: '2s'
            }}
          ></div>
        </div>

        {/* Cube 6 - Bottom Right */}
        <div 
          className="absolute cube"
          style={{
            width: '80px',
            height: '80px',
            top: '200px',
            left: '160px',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '5s'
          }}
        >
          <div className="cube-face cube-front bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="cube-face cube-right bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800"></div>
          <div 
            className="cube-face cube-top bg-gradient-to-r from-red-400 via-pink-400 to-red-400 dark:from-red-500 dark:via-pink-500 dark:to-red-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'flowingLight 3s ease-in-out infinite',
              animationDelay: '2.5s'
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .cube {
          transform-style: preserve-3d;
        }
        
        .cube-face {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cube-front {
          transform: rotateY(0deg) translateZ(40px);
        }
        
        .cube-right {
          transform: rotateY(90deg) translateZ(40px);
        }
        
        .cube-top {
          transform: rotateX(90deg) translateZ(40px);
        }
      `}</style>
    </div>
  );
}
