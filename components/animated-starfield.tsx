'use client';

import React from 'react';

export default function AnimatedStarfield() {
  return (
    <div className="relative w-[600px] h-[500px] overflow-hidden">
      {/* Subtle cosmic background */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-900/10 via-purple-900/5 to-transparent"></div>
      
      {/* Dense starfield with different sizes and twinkling patterns */}
      <div className="absolute inset-0">
        {/* Large bright star - center */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] opacity-0"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'starTwinkle 8s ease-in-out forwards'
          }}
        ></div>
        
        {/* Medium stars scattered around - with color variations */}
        {[
          { top: '20%', left: '25%', delay: '0s', size: 'w-2 h-2', color: 'white', animation: 'starTwinkle' },
          { top: '15%', left: '75%', delay: '1s', size: 'w-2 h-2', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '80%', left: '20%', delay: '2s', size: 'w-2 h-2', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '85%', left: '80%', delay: '3s', size: 'w-2 h-2', color: 'white', animation: 'starTwinkle' },
          { top: '35%', left: '15%', delay: '4s', size: 'w-2 h-2', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '70%', left: '85%', delay: '5s', size: 'w-2 h-2', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '45%', left: '90%', delay: '0.5s', size: 'w-2 h-2', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '55%', left: '10%', delay: '1.5s', size: 'w-2 h-2', color: 'white', animation: 'starTwinkle' },
          { top: '25%', left: '50%', delay: '2.5s', size: 'w-2 h-2', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '75%', left: '50%', delay: '3.5s', size: 'w-2 h-2', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '50%', left: '20%', delay: '4.5s', size: 'w-2 h-2', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '50%', left: '80%', delay: '5.5s', size: 'w-2 h-2', color: 'white', animation: 'starTwinkle' }
        ].map((star, index) => (
          <div
            key={index}
            className={`absolute ${star.size} rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] opacity-0`}
            style={{
              top: star.top,
              left: star.left,
              backgroundColor: star.color,
              animation: `${star.animation} 10s ease-in-out ${star.delay} forwards`
            }}
          ></div>
        ))}
        
        {/* Small twinkling stars - increased density with color variations */}
        {[
          { top: '10%', left: '50%', color: 'white', animation: 'starTwinkle' },
          { top: '25%', left: '60%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '40%', left: '30%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '60%', left: '70%', color: 'white', animation: 'starTwinkle' },
          { top: '75%', left: '40%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '90%', left: '60%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '30%', left: '80%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '65%', left: '25%', color: 'white', animation: 'starTwinkle' },
          { top: '15%', left: '35%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '85%', left: '65%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '45%', left: '45%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '55%', left: '75%', color: 'white', animation: 'starTwinkle' },
          { top: '5%', left: '25%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '95%', left: '75%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '35%', left: '65%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '65%', left: '35%', color: 'white', animation: 'starTwinkle' },
          { top: '20%', left: '85%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '80%', left: '15%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '50%', left: '5%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '50%', left: '95%', color: 'white', animation: 'starTwinkle' }
        ].map((star, index) => (
          <div
            key={`small-${index}`}
            className="absolute w-1 h-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)] opacity-0"
            style={{
              top: star.top,
              left: star.left,
              backgroundColor: star.color,
              animation: `${star.animation} 8s ease-in-out ${index * 0.6}s forwards`
            }}
          ></div>
        ))}
        
        {/* Extra tiny stars for depth - with color variations */}
        {[
          { top: '12%', left: '15%', color: 'white', animation: 'starTwinkle' },
          { top: '18%', left: '45%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '22%', left: '95%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '28%', left: '5%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '32%', left: '55%', color: 'white', animation: 'starTwinkle' },
          { top: '38%', left: '85%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '42%', left: '25%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '48%', left: '75%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '52%', left: '35%', color: 'white', animation: 'starTwinkle' },
          { top: '58%', left: '65%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '62%', left: '15%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '68%', left: '95%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '72%', left: '45%', color: 'white', animation: 'starTwinkle' },
          { top: '78%', left: '25%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '82%', left: '85%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '88%', left: '35%', color: 'lightcoral', animation: 'starTwinkleRed' },
          { top: '92%', left: '65%', color: 'white', animation: 'starTwinkle' },
          { top: '8%', left: '75%', color: 'lightblue', animation: 'starTwinkleBlue' },
          { top: '95%', left: '25%', color: 'lightyellow', animation: 'starTwinkleYellow' },
          { top: '3%', left: '85%', color: 'lightcoral', animation: 'starTwinkleRed' }
        ].map((star, index) => (
          <div
            key={`tiny-${index}`}
            className="absolute w-0.5 h-0.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)] opacity-0"
            style={{
              top: star.top,
              left: star.left,
              backgroundColor: star.color,
              animation: `${star.animation} 10s ease-in-out ${index * 0.8}s forwards`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}