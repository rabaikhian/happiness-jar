'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '@/lib/audio';
import { Flag, ShieldAlert, Heart, Gift, Smile, X } from 'lucide-react';

export default function StickyNote({ note, onReact, onReport, canvasRef }) {
  const [likes, setLikes] = useState(note.likes_count || 0);
  const [hugs, setHugs] = useState(note.hugs_count || 0);
  const [sparkles, setSparkles] = useState(note.sparkles_count || 0);
  const [particles, setParticles] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // Random rotation for cozy organic layout
  const rotation = useRef(Math.floor(Math.random() * 8) - 4); // Between -4 and 3 degrees

  // Map category to Thai label
  const getCategoryLabel = (cat) => {
    const map = {
      '#Gratitude': 'ขอบคุณดีต่อใจ 🌸',
      '#Hope': 'ส่งความหวัง ☀️',
      '#Comfort': 'กอดอุ่นๆ 🫂',
      '#DailyJoy': 'ใจฟูรายวัน ✨'
    };
    return map[cat] || cat;
  };

  // Map color theme to Tailwind CSS styles
  const getColorClasses = (color) => {
    const map = {
      yellow: 'bg-note-yellow text-amber-950 border-amber-200/40 shadow-amber-100/30',
      mint: 'bg-note-mint text-emerald-950 border-emerald-200/40 shadow-emerald-100/30',
      peach: 'bg-note-peach text-rose-950 border-rose-200/40 shadow-rose-100/30',
      lavender: 'bg-note-lavender text-purple-950 border-purple-200/40 shadow-purple-100/30',
      blue: 'bg-note-blue text-sky-950 border-sky-200/40 shadow-sky-100/30'
    };
    return map[color] || map.yellow;
  };

  const spawnParticle = (emoji) => {
    playPop();
    const id = Date.now() + Math.random();
    const newParticle = {
      id,
      emoji,
      // Random starting point in the button region
      x: Math.random() * 40 - 20,
      y: -20
    };
    setParticles(prev => [...prev, newParticle]);

    // Clean up particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const handleReaction = (type, emoji) => {
    // Optimistic UI updates
    if (type === 'likes') setLikes(l => l + 1);
    else if (type === 'hugs') setHugs(h => h + 1);
    else if (type === 'sparkles') setSparkles(s => s + 1);

    spawnParticle(emoji);
    onReact(note.id, type);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setIsReporting(true);
    try {
      await onReport(note.id, reportReason);
      setIsSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setIsHidden(true); // Hide flagged note locally immediately after report submission
      }, 1500);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsReporting(false);
    }
  };

  if (isHidden) return null;

  return (
    <>
      <motion.div
        drag
        dragConstraints={canvasRef}
        dragElastic={0.05}
        dragMomentum={false}
        initial={{ scale: 0.9, opacity: 0, rotate: rotation.current }}
        animate={{ scale: 1, opacity: 1, rotate: rotation.current }}
        whileDrag={{ scale: 1.05, rotate: rotation.current * 0.5, zIndex: 30, boxShadow: '0 15px 30px rgba(74, 59, 50, 0.15)' }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`w-64 p-5 rounded-lg border shadow-md cursor-grab active:cursor-grabbing select-none relative flex flex-col justify-between ${getColorClasses(note.color)}`}
        style={{ touchAction: 'none' }}
      >
        {/* Floating Particles Container */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          <AnimatePresence>
            {particles.map(p => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
                animate={{ opacity: 0, scale: 1.5, x: p.x + (Math.random() * 40 - 20), y: p.y - 80 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-1/2 text-lg inline-block"
              >
                {p.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Note Header */}
        <div className="flex justify-between items-start border-b border-black/5 pb-2 mb-3">
          <span className="text-[10px] font-semibold bg-white/40 px-2 py-0.5 rounded-full uppercase">
            {getCategoryLabel(note.category)}
          </span>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-black/30 hover:text-rose-500/80 transition-colors p-0.5 rounded-full hover:bg-black/5 cursor-pointer"
            title="รายงานเนื้อหาไม่เหมาะสม"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Content */}
        <div className="min-h-[70px] flex items-center justify-center py-1">
          <p className="text-sm font-medium leading-relaxed text-center break-words w-full">
            {note.content}
          </p>
        </div>

        {/* Footer & Reactions */}
        <div className="mt-3 pt-2.5 border-t border-black/5">
          <div className="text-[9px] text-black/30 text-right mb-2.5">
            {new Date(note.created_at).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Reaction Tray */}
          <div className="flex justify-around items-center gap-1">
            <button
              onClick={() => handleReaction('likes', '❤️')}
              className="px-2 py-1.5 rounded bg-white/30 hover:bg-white/50 text-[11px] font-semibold text-rose-600 flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-1 justify-center border border-rose-200/20"
              title="ส่งพลังใจ"
            >
              <span>❤️</span>
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleReaction('hugs', '🫂')}
              className="px-2 py-1.5 rounded bg-white/30 hover:bg-white/50 text-[11px] font-semibold text-amber-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-1 justify-center border border-amber-200/20"
              title="กอดอุ่นๆ"
            >
              <span>🫂</span>
              <span>{hugs}</span>
            </button>
            <button
              onClick={() => handleReaction('sparkles', '✨')}
              className="px-2 py-1.5 rounded bg-white/30 hover:bg-white/50 text-[11px] font-semibold text-indigo-600 flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-1 justify-center border border-indigo-200/20"
              title="วิบวับ"
            >
              <span>✨</span>
              <span>{sparkles}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-amber-950/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowReportModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm border border-amber-950/10 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-semibold text-base">รายงานโน้ตนี้</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-6 text-center">
                  <span className="text-4xl">✔️</span>
                  <p className="mt-3 font-semibold text-green-700">ส่งรายงานเรียบร้อยแล้ว</p>
                  <p className="text-xs text-gray-500 mt-1">ขอบคุณที่ช่วยดูแลความปลอดภัยของชุมชนนะคะ โน้ตนี้จะถูกซ่อนทันที</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    คุณต้องการรายงานโน้ตชิ้นนี้เนื่องจากอะไร? เมื่อส่งรายงาน ระบบจะปิดกั้นโน้ตตัวนี้เพื่อตรวจสอบความปลอดภัยทันที
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs font-medium">
                      <input
                        type="radio"
                        name="reason"
                        value="คำหยาบคาย ความรุนแรง หรือวาจาสร้างความเกลียดชัง"
                        checked={reportReason === 'คำหยาบคาย ความรุนแรง หรือวาจาสร้างความเกลียดชัง'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-cozy-terracotta focus:ring-cozy-terracotta"
                      />
                      <span>คำหยาบคาย / วาจาสร้างความเกลียดชัง</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs font-medium">
                      <input
                        type="radio"
                        name="reason"
                        value="เนื้อหาไม่เหมาะสม ส่อไปในทางเพศ หรือสแปม"
                        checked={reportReason === 'เนื้อหาไม่เหมาะสม ส่อไปในทางเพศ หรือสแปม'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-cozy-terracotta focus:ring-cozy-terracotta"
                      />
                      <span>เนื้อหาไม่เหมาะสม / อนาจาร / สแปม</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs font-medium">
                      <input
                        type="radio"
                        name="reason"
                        value="มีเนื้อหากล่าวถึงการทำร้ายตัวเองหรือฆ่าตัวตาย"
                        checked={reportReason === 'มีเนื้อหากล่าวถึงการทำร้ายตัวเองหรือฆ่าตัวตาย'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-cozy-terracotta focus:ring-cozy-terracotta"
                      />
                      <span>การทำร้ายตัวเอง / ฆ่าตัวตาย</span>
                    </label>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isReporting || !reportReason}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {isReporting ? 'กำลังส่ง...' : 'ยืนยันรายงาน'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
