'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  PenTool, 
  Smile, 
  Sun, 
  MailOpen, 
  CloudRain, 
  Heart,
  ShieldCheck,
  Archive,
  X,
  LayoutGrid,
  Hourglass
} from 'lucide-react';
import { startAmbient, stopAmbient, playPop } from '@/lib/audio';
import confetti from 'canvas-confetti';

// Import custom components
import PunpunJar from '@/components/board/PunpunJar';
import NoteForm from '@/components/board/NoteForm';

// Global maps for reactions and categories
const reactionMap = [
  { type: 'likes', label: '❤️ ส่งใจ', color: 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200' },
  { type: 'hugs', label: '🫂 กอดๆ', color: 'text-amber-700 bg-white hover:bg-amber-50 border-amber-200' },
  { type: 'sparkles', label: '⭐ ชื่นชม', color: 'text-yellow-700 bg-white hover:bg-yellow-50 border-yellow-200' }
];

const categoryMap = {
  gratitude: { name: 'ขอบคุณความสุข' },
  morning: { name: 'พลังใจยามเช้า' },
  stranger: { name: 'ถึงคนแปลกหน้า' },
  letgo: { name: 'ระบาย & ปล่อยวาง' },
  time: { name: 'เวลา & การเติบโต' }
};

const boardCategories = [
  { value: 'all', label: '🌟 ทั้งหมด' },
  { value: 'gratitude', label: '🌸 ขอบคุณความสุข' },
  { value: 'morning', label: '☀️ พลังใจยามเช้า' },
  { value: 'stranger', label: '💌 ถึงคนแปลกหน้า' },
  { value: 'letgo', label: '🌙 ระบาย & ปล่อยวาง' },
  { value: 'time', label: '⏳ เวลา & การเติบโต' }
];

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'gratitude' | 'morning' | 'stranger' | 'letgo'
  const [isSoundOn, setIsSoundOn] = useState(false);

  // Drawn Note Modal State
  const [drawnNote, setDrawnNote] = useState(null);
  const [isDrawOpen, setIsDrawOpen] = useState(false);

  // Board Modal State (Read all notes)
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [boardCategory, setBoardCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const jarRef = useRef(null);

  // Fetch approved notes on load
  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  // Ambient sound handler
  const handleSoundToggle = () => {
    playPop();
    const newSoundState = !isSoundOn;
    setIsSoundOn(newSoundState);
    if (newSoundState) {
      startAmbient();
    } else {
      stopAmbient();
    }
  };

  // React to a drawn note
  const handleReact = async (noteId, reactionType) => {
    try {
      await fetch(`/api/notes/${noteId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });
      
      // Update local state
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === noteId 
            ? { ...n, [`${reactionType}_count`]: (n[`${reactionType}_count`] || 0) + 1 }
            : n
        )
      );
    } catch (err) {
      console.error('Error sending reaction:', err);
    }
  };

  // Add new note to the list
  const handleNoteAdded = (newNote) => {
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  // Helper count notes in category
  const getCategoryCount = (cat) => {
    return notes.filter(n => n.category === cat).length;
  };

  // Callback when a note is successfully drawn from HappinessJar
  const handleDrawNote = (note) => {
    setDrawnNote(note);
    setIsDrawOpen(true);
    
    // Trigger confetti upon draw success
    confetti({
      particleCount: 55,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleCloseDraw = () => {
    setIsDrawOpen(false);
    playPop();
    setTimeout(() => setDrawnNote(null), 300);
  };

  // Trigger random draw from header button
  const triggerHeaderRandomDraw = () => {
    playPop();
    
    // Check if notes exist for active category
    const available = activeCategory === 'all' 
      ? notes 
      : notes.filter(n => n.category === activeCategory);

    if (available.length === 0) {
      alert('กระปุกนี้ยังว่างอยู่ค่ะ มาร่วมเขียนความใจฟูเพื่อหย่อนใส่กระปุกนี้กันเถอะนะคะ! 😊');
      return;
    }

    // Dispatch click event on the jar component to trigger shake & draw
    const jarElem = document.querySelector('.jar-glass');
    if (jarElem) {
      jarElem.click();
    }
  };

  // Filter and Sort notes for the board modal grid
  const filteredNotesForBoard = boardCategory === 'all'
    ? [...notes]
    : notes.filter(n => n.category === boardCategory);

  if (sortBy === 'popular') {
    filteredNotesForBoard.sort((a, b) => {
      const totalA = (a.likes_count || 0) + (a.hugs_count || 0) + (a.sparkles_count || 0);
      const totalB = (b.likes_count || 0) + (b.hugs_count || 0) + (b.sparkles_count || 0);
      return totalB - totalA;
    });
  } else {
    // Newest sorting
    filteredNotesForBoard.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="flex flex-col min-h-screen text-slate-700 justify-between">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-md border-b border-amber-100/60 shadow-sm select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { playPop(); setActiveCategory('all'); }}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>กระปุกปันปัน</span>
                <span className="text-xs bg-rose-100 text-rose-600 font-medium px-2 py-0.5 rounded-full">กระปุกพลังบวก</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">พื้นที่แบ่งปันรอยยิ้มและคำฮีลใจที่ไม่ระบุตัวตน</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl text-slate-600 hover:bg-amber-100/50 transition flex items-center gap-1.5 text-xs font-semibold border cursor-pointer ${
                isSoundOn ? 'bg-amber-100/50 border-amber-300' : 'border-amber-200/50'
              }`}
              title="เปิด/ปิด เสียงบรรยากาศ"
            >
              {isSoundOn ? (
                <>
                  <Volume2 className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="hidden md:inline text-rose-700">กำลังเล่นเสียงบรรยากาศ</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="hidden md:inline">เสียงบรรยากาศ</span>
                </>
              )}
            </button>

            {/* Read All Notes Button */}
            <button
              onClick={() => { playPop(); setIsBoardOpen(true); }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-amber-100/50 text-slate-600 font-semibold text-xs sm:text-sm border border-amber-200/50 shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="อ่านโน้ตทั้งหมดบนบอร์ด"
            >
              <LayoutGrid className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">อ่านโน้ตทั้งหมด</span>
            </button>

            {/* Random Draw Button */}
            <button
              onClick={triggerHeaderRandomDraw}
              disabled={loading || notes.length === 0}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">สุ่มฮีลใจ</span>
            </button>

            {/* Post Note Button */}
            <button
              onClick={() => { playPop(); setIsFormOpen(true); }}
              className="p-2 sm:px-4 sm:py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">เขียนโน้ต</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 z-10">



        {/* Dynamic Cozy Desktop Shelf (The Central Interaction Zone) */}
        <section className="w-full flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-amber-800/20 border-t-amber-800 animate-spin"></div>
              <span className="text-xs font-bold text-amber-900/40">กำลังทำความสะอาดและปัดฝุ่นชั้นวาง...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center relative z-10">
              {/* Jar container (with shake ref animation) */}
              <div ref={jarRef} className="flex items-center justify-center">
                <PunpunJar 
                  notes={notes} 
                  activeCategory={activeCategory} 
                  onDraw={handleDrawNote} 
                />
              </div>
              
              {/* Watermark logo centered directly below the jar */}
              <div className="mt-1 sm:mt-2 -mb-6 sm:-mb-8 opacity-50 select-none pointer-events-none flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="ระบาย เขียน Logo" 
                  className="w-48 sm:w-64 h-auto object-contain grayscale mix-blend-multiply" 
                />
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-amber-100 py-6 mt-2 sm:mt-4 text-center text-xs text-slate-500 relative z-10 select-none">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="flex items-center justify-center gap-1.5 font-bold text-slate-600">
            <span>กระปุกปันปัน — พื้นที่แบ่งปันพลังบวกดิจิทัลปลอดภัย</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </p>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            ขับเคลื่อนด้วยแนวคิดจิตวิทยาเชิงบวก (Positive Psychology) มีระบบคัดกรองเนื้อหาอัตโนมัติ <br />
            หากคุณกำลังเผชิญช่วงเวลาที่ยากลำบาก สามารถติดต่อสายด่วนสุขภาพจิต <strong>1323</strong> (โทรฟรี 24 ชม.)
          </p>
        </div>
      </footer>

      {/* Note Form Modal */}
      <NoteForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleNoteAdded} 
      />

      {/* Board Modal (Read All Notes) */}
      <AnimatePresence>
        {isBoardOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsBoardOpen(false)}
            />

            {/* Board Container */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative z-10 w-full max-w-5xl h-[85vh] bg-cream-100 rounded-3xl p-6 shadow-2xl border border-amber-100 flex flex-col justify-between overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(#F0E6D2 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsBoardOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header inside modal */}
              <div className="border-b border-amber-200/40 pb-4 mb-4 select-none">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-amber-500" />
                    <span>โน้ตทั้งหมดในกระปุก</span>
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    {filteredNotesForBoard.length} รายการ
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {boardCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => { playPop(); setBoardCategory(boardCategory === cat.value ? 'all' : cat.value); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          boardCategory === cat.value
                            ? 'bg-amber-800 text-white shadow-sm'
                            : 'bg-white hover:bg-amber-50/70 text-slate-700 border border-amber-950/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Quick Sort */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">เรียงตาม:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-300 outline-none font-medium cursor-pointer"
                    >
                      <option value="newest">ใหม่ล่าสุด 🕒</option>
                      <option value="popular">ได้รับพลังใจมากที่สุด ❤️</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Content with custom scrollbar */}
              <div className="flex-1 overflow-y-auto pr-1 pb-4">
                {filteredNotesForBoard.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 rounded-3xl border border-dashed border-amber-200">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Archive className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-700 text-base">กระปุกนี้ยังคงว่างอยู่</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">มาร่วมเขียนและหย่อนโน้ตใบแรกให้กระปุกนี้อุ่นขึ้นกันนะ</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
                    {filteredNotesForBoard.map((note) => {
                      const totalReactions = (note.likes_count || 0) + (note.hugs_count || 0) + (note.sparkles_count || 0);
                      const rotation = note.id.charCodeAt(note.id.length - 1) % 6 - 3; // Deterministic rotation based on id
                      
                      return (
                        <div
                          key={note.id}
                          onClick={() => {
                            playPop();
                            setDrawnNote(note);
                            setIsDrawOpen(true);
                          }}
                          className="sticky-note p-5 rounded-2xl shadow-paper border border-black/5 flex flex-col justify-between cursor-pointer relative overflow-hidden text-left"
                          style={{ 
                            backgroundColor: note.color,
                            transform: `rotate(${rotation}deg)`
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/40 backdrop-blur-xs px-2 py-0.5 rounded-md w-fit">
                              <span>{note.category === 'gratitude' ? 'ขอบคุณความสุข 🌸' : note.category === 'morning' ? 'พลังใจยามเช้า ☀️' : note.category === 'stranger' ? 'ถึงคนแปลกหน้า 💌' : note.category === 'letgo' ? 'ระบาย & ปล่อยวาง 🌙' : 'เวลา & การเติบโต ⏳'}</span>
                            </div>
                            <p className="font-handwritten text-lg text-slate-800 line-clamp-4 leading-snug">
                              "{note.content}"
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-semibold truncate max-w-[120px]">~ {note.author}</span>
                            <div className="flex items-center gap-1 text-rose-500 font-bold bg-white/50 px-2 py-0.5 rounded-full">
                              <span>❤️</span>
                              <span>{totalReactions}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawn Note Detail Modal (Rendered at Root level to fix stacking context bug) */}
      <AnimatePresence>
        {isDrawOpen && drawnNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={handleCloseDraw}
            />

            {/* Note Card Container */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative z-50 w-full max-w-[92vw] sm:max-w-md bg-cream-50 rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-100"
            >
              
              {/* Close Button */}
              <button 
                onClick={handleCloseDraw}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category Label */}
              <div className="mb-3 flex items-center gap-2 select-none">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] sm:text-xs font-semibold">
                  {drawnNote.category === 'gratitude' ? '🌸 ขอบคุณความสุข' : drawnNote.category === 'morning' ? '☀️ พลังใจยามเช้า' : drawnNote.category === 'stranger' ? '💌 ถึงคนแปลกหน้า' : drawnNote.category === 'letgo' ? '🌙 ระบาย & ปล่อยวาง' : '⏳ เวลา & การเติบโต'}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400">
                  {new Date(drawnNote.created_at).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Note Paper (Visual Sticky Note with Itim font) */}
              <div 
                className="p-5 sm:p-6 rounded-2xl border border-black/5 shadow-paper my-2.5 relative min-h-[140px] sm:min-h-[160px] flex flex-col justify-between"
                style={{ backgroundColor: drawnNote.color }}
              >
                <p className="font-handwritten text-lg sm:text-xl text-slate-800 leading-relaxed break-words text-left">
                  "{drawnNote.content}"
                </p>
                <div className="text-right mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-black/5">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600">~ จาก{drawnNote.author}</span>
                </div>
              </div>

              {/* Reactions Control Bar */}
              <div className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs text-center text-slate-500 font-bold select-none">ส่งต่อพลังใจคืนให้ผู้เขียน:</p>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2.5">
                  {reactionMap.map(({ type, label, color }) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleReact(drawnNote.id, type);
                        playPop();
                        setDrawnNote(prev => ({
                          ...prev,
                          [`${type}_count`]: (prev[`${type}_count`] || 0) + 1
                        }));
                      }}
                      className={`flex-1 min-w-[75px] py-1.5 sm:py-2 px-2 sm:px-3 border rounded-2xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition cursor-pointer ${color}`}
                    >
                      <span className="text-sm sm:text-base">{label.split(' ')[0]}</span>
                      <span>{label.split(' ')[1]}</span>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-700">
                        {drawnNote[`${type}_count`] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
