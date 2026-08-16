'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { playChime } from '@/lib/audio';

export default function PunpunJar({ notes, activeCategory, onDraw }) {
  const [isDrawing, setIsDrawing] = useState(false);

  // Category mapping definitions
  const categoryMap = {
    all: { name: 'พลังบวกทั้งหมด', label: '✨ กระปุกรวมใจ ✨', ribbonClass: 'bg-amber-400' },
    gratitude: { name: 'ขอบคุณความสุข', label: '🌸 ขอบคุณความสุข 🌸', ribbonClass: 'bg-rose-400' },
    morning: { name: 'พลังใจยามเช้า', label: '☀️ พลังใจยามเช้า ☀️', ribbonClass: 'bg-orange-400' },
    stranger: { name: 'ถึงคนแปลกหน้า', label: '💌 ถึงคนแปลกหน้า 💌', ribbonClass: 'bg-emerald-400' },
    letgo: { name: 'ระบาย & ปล่อยวาง', label: '🌙 ระบาย & ปล่อยวาง 🌙', ribbonClass: 'bg-purple-400' },
    time: { name: 'เวลา & การเติบโต', label: '⏳ เวลา & การเติบโต ⏳', ribbonClass: 'bg-teal-400' }
  };

  const currentCat = categoryMap[activeCategory] || categoryMap.all;

  const handleDraw = () => {
    if (isDrawing) return;
    
    // Filter notes by the active category
    const availableNotes = activeCategory === 'all'
      ? notes
      : notes.filter(n => n.category === activeCategory);

    if (availableNotes.length === 0) {
      alert('กระปุกนี้ยังว่างอยู่ค่ะ เขียนโน้ตแรกมาหย่อนลงกระปุกนี้กันเถอะนะคะ! 😊');
      return;
    }

    setIsDrawing(true);
    playChime();

    // Trigger drawing animation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableNotes.length);
      const note = availableNotes[randomIndex];
      
      setIsDrawing(false);
      onDraw(note); // Send the drawn note up to page.js to render
    }, 1000);
  };

  // Get paper slips colors inside the jar depending on active category
  const getSlipsColors = () => {
    switch (activeCategory) {
      case 'gratitude': return ['#FEF9C3', '#FCE7F3', '#FEF9C3', '#FCE7F3'];
      case 'morning': return ['#FEF9C3', '#FFEDD5', '#FEF9C3', '#FFEDD5'];
      case 'stranger': return ['#FCE7F3', '#DCFCE7', '#FCE7F3', '#DCFCE7'];
      case 'letgo': return ['#F3E8FF', '#E0F2FE', '#F3E8FF', '#E0F2FE'];
      case 'time': return ['#CCFBF1', '#E0F2FE', '#CCFBF1', '#E0F2FE'];
      default: return ['#FEF9C3', '#FCE7F3', '#DCFCE7', '#F3E8FF', '#E0F2FE', '#FFEDD5'];
    }
  };

  const slips = getSlipsColors();
  
  // Duplicate slips to make the jar look filled and cozy (16 slips total)
  const duplicatedSlips = [...slips, ...slips, ...slips, ...slips].slice(0, 16);

  return (
    <div className="flex flex-col items-center justify-center py-2 sm:py-4 select-none">
      
      {/* Giant/Responsive Dynamic Jar on Virtual Table */}
      <div className="relative cursor-pointer" onClick={handleDraw}>
        
        {/* Responsive Lid Animation */}
        <motion.div
          className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 z-10 w-44 sm:w-60 h-8 sm:h-10 flex justify-center"
          animate={isDrawing ? { y: -35, rotate: -15 } : { y: 0, rotate: 0 }}
          whileHover={{ y: -6, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15 }}
        >
          {/* Wooden Cork Lid */}
          <div className="w-40 sm:w-56 h-5.5 sm:h-7 bg-gradient-to-r from-amber-200 to-amber-300 rounded-lg border-2 border-white shadow-md relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 h-2 sm:h-2.5 bg-amber-400 rounded-full opacity-60"></div>
          </div>
        </motion.div>

        {/* Responsive Jar Glass Body (w-64 h-[20rem] on mobile / w-80 h-[24rem] on desktop) */}
        <motion.div
          className="relative w-64 h-[20rem] sm:w-80 sm:h-[24rem] rounded-b-[4.5rem] sm:rounded-b-[5.5rem] rounded-t-2xl sm:rounded-t-3xl jar-glass flex flex-col justify-end p-6 sm:p-8 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={isDrawing ? { 
            scale: [1, 1.04, 0.96, 1.02, 1],
            rotate: [0, -5, 5, -3, 3, 0]
          } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Glass Highlights */}
          <div className="absolute top-0 left-4 sm:left-6 w-6 sm:w-8 h-full bg-gradient-to-r from-white/25 to-transparent"></div>
          <div className="absolute top-0 right-4 sm:right-6 w-3 sm:w-4 h-full bg-gradient-to-l from-white/20 to-transparent"></div>
          
          {/* Inner bottom glow */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-16 sm:h-20 rounded-full bg-gradient-to-t from-white/20 to-transparent blur-[4px] sm:blur-[5px]"></div>

          {/* Floating themed slips inside the jar (arranged beautifully at the bottom) */}
          <div className="absolute inset-x-0 bottom-16 sm:bottom-20 top-16 sm:top-20 px-4 sm:px-8 flex flex-wrap gap-2.5 items-end justify-center pointer-events-none mb-4 sm:mb-6 overflow-hidden">
            {duplicatedSlips.map((slipColor, idx) => {
              // Deterministic offsets based on index to distribute slips nicely
              const rotation = Math.sin(idx * 1.9) * 28;
              const xOffset = Math.cos(idx * 2.1) * 22;
              const yOffset = Math.sin(idx * 0.8) * 12;
              
              return (
                <motion.div
                  key={idx}
                  className="w-11 h-4 sm:w-16 sm:h-5 rounded shadow-sm border border-white/40 shrink-0"
                  style={{
                    backgroundColor: slipColor,
                    transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`,
                  }}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3.5 + (idx % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.12
                  }}
                />
              );
            })}
          </div>

          {/* Ribbon around neck */}
          <div className={`absolute top-5 sm:top-6 left-0 right-0 h-2 sm:h-2.5 shadow-inner flex items-center justify-center ${currentCat.ribbonClass}`}>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/50 shadow-sm relative -top-0.5 ${currentCat.ribbonClass}`}></div>
          </div>

          {/* Selected Category Label on Jar */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl py-2 sm:py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-extrabold text-amber-800 shadow-sm border border-amber-100 z-10 mx-auto w-full max-w-[180px] sm:max-w-[240px]">
            {currentCat.label}
          </div>
        </motion.div>

        {/* Outer Glow */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-amber-200/25 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
