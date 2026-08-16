'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSuccess, playPop } from '@/lib/audio';
import { X, Phone, Heart, CheckCircle2, AlertCircle, PenTool, ShieldCheck, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NoteForm({ isOpen, onClose, onSubmit }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState('#FEF9C3'); // Default yellow hex
  const [category, setCategory] = useState('gratitude');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState('safe'); // 'safe' | 'flagged'

  // Submission result states
  const [submitStatus, setSubmitStatus] = useState('form'); // 'form' | 'success' | 'flagged'
  const [crisisInfo, setCrisisInfo] = useState(null);

  const colors = [
    { hex: '#FEF9C3', label: 'เหลืองพาสเทล' },
    { hex: '#FCE7F3', label: 'ชมพูอบอุ่น' },
    { hex: '#DCFCE7', label: 'เขียวมิ้นต์ผ่อนคลาย' },
    { hex: '#F3E8FF', label: 'ม่วงลาเวนเดอร์' },
    { hex: '#E0F2FE', label: 'ฟ้าสดใส' },
    { hex: '#CCFBF1', label: 'เขียวเทอร์ควอยซ์สบายตา' }
  ];

  const categories = [
    { value: 'gratitude', label: '🌸 ขอบคุณความสุข & เรื่องดีๆ' },
    { value: 'morning', label: '☀️ เติมพลังใจยามเช้าวันใหม่' },
    { value: 'stranger', label: '💌 จดหมายถึงเพื่อนแปลกหน้า' },
    { value: 'letgo', label: '🌙 ปลดปล่อยความเครียด & ให้กำลังใจ' },
    { value: 'time', label: '⏳ เวลา & การเติบโต' }
  ];

  // Local keypress safety validation (real-time warning)
  const handleContentChange = (val) => {
    setContent(val);
    
    // Check sensitive keywords
    const sensitiveKeywords = ['เกลียดที่สุด', 'ทำร้ายตัวเอง', 'ฆ่า', 'ควย', 'เหี้ย', 'มึง', 'ส้นตีน', 'die', 'hate'];
    const foundKeyword = sensitiveKeywords.some(kw => val.toLowerCase().includes(kw));
    
    if (foundKeyword) {
      setSafetyStatus('flagged');
    } else {
      setSafetyStatus('safe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || safetyStatus === 'flagged') return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          color,
          category,
          author: author.trim() || 'เพื่อนแปลกหน้าผู้หวังดี'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        playSuccess();
        setSubmitStatus('success');
        onSubmit(data); // Append note dynamically to local list
        
        // Trigger Canvas Confetti
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F43F5E', '#FBBF24', '#34D399']
        });

        setTimeout(() => {
          handleClose();
        }, 2000);
      } else if (response.status === 400 && data.flagged) {
        // Flagged by AI Moderation
        setCrisisInfo(data.crisisResources);
        setSubmitStatus('flagged');
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกโน้ต');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    playPop();
    // Reset state after animation ends
    setTimeout(() => {
      setContent('');
      setAuthor('');
      setColor('#FEF9C3');
      setCategory('gratitude');
      setSubmitStatus('form');
      setSafetyStatus('safe');
      setCrisisInfo(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="bg-cream-50 rounded-3xl p-6 w-full max-w-lg border border-amber-100 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-amber-100/50">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">เขียนโน้ตพลังบวก</h3>
                <p className="text-xs text-slate-500">ข้อความของคุณจะถูกส่งต่อโดยไม่ระบุตัวตน</p>
              </div>
            </div>

            {/* Content Switcher */}
            {submitStatus === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">เลือกกระปุกเป้าหมาย</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      playPop();
                    }}
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">เลือกสีกระดาษโน้ต</label>
                  <div className="flex items-center gap-3">
                    {colors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setColor(c.hex);
                          playPop();
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center ${
                          color === c.hex ? 'border-amber-400 scale-110 shadow' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {color === c.hex && <span className="text-[10px]">✏️</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea Note Input */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">ข้อความฮีลใจ</label>
                  <textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value.slice(0, 250))}
                    placeholder="เขียนเรื่องราวเล็กๆ ที่ทำให้ยิ้มได้ หรือคำอวยพรให้ใครสักคนอ่านแล้วมีกำลังใจ..."
                    rows={4}
                    required
                    className="w-full font-handwritten text-base sm:text-lg p-3.5 rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-inner resize-none transition leading-relaxed outline-none"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>{content.length}/250 ตัวอักษร</span>
                    {safetyStatus === 'flagged' ? (
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> ตรวจพบคำไม่เหมาะสม
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> ปลอดภัย 100%
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-time Warning Banner */}
                {safetyStatus === 'flagged' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">ข้อความของคุณอาจมีคำที่ไม่เหมาะสมหรือคำรุนแรง</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">ระบบ Happiness Jar มุ่งเน้นการสร้างพื้นที่ปลอดภัย โปรดปรับเปลี่ยนคำพูดให้เป็นเชิงบวกหรือละมุนขึ้นครับ ❤️</p>
                    </div>
                  </div>
                )}

                {/* Author Tag / Persona */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">นามแฝงผู้ส่ง (ไม่ระบุตัวตน)</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="เช่น เพื่อนแปลกหน้าผู้หวังดี / นักเดินทางในวันฝนตก"
                    maxLength={35}
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || safetyStatus === 'flagged'}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>หย่อนลงกระปุกความสุข ✨</span>
                  </button>
                </div>
              </form>
            )}

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center justify-center space-y-4"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                <h4 className="font-bold text-lg text-emerald-950">ส่งโน้ตเข้ากระปุกสำเร็จแล้วค่ะ!</h4>
                <p className="text-sm text-emerald-800/80 max-w-xs">
                  ขอบคุณที่ช่วยส่งพลังงานดีๆ ให้กับชุมชนใบนี้ โน้ตของคุณถูกหย่อนลงในขวดโหลเรียบร้อยแล้วนะคะ 🌸
                </p>
              </motion.div>
            )}

            {submitStatus === 'flagged' && crisisInfo && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
              >
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-rose-950">ระบบกรองเนื้อหาเพื่อความปลอดภัย</h4>
                    <p className="text-xs text-rose-800/90 leading-relaxed">
                      {crisisInfo.intro}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-amber-900/80 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cozy-terracotta" />
                    <span>ช่องทางติดต่อสายด่วนประคับประคองใจ (ประเทศไทย):</span>
                  </h5>

                  <div className="space-y-2">
                    {crisisInfo.contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-xl border border-amber-100 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-amber-950">{contact.name}</p>
                          <p className="text-[10px] text-amber-900/60 leading-tight">{contact.detail}</p>
                        </div>
                        <a
                          href={`tel:${contact.number}`}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{contact.number}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSubmitStatus('form')}
                    className="px-5 py-2.5 bg-amber-800 text-white rounded-full font-medium text-xs shadow-md hover:bg-amber-900 cursor-pointer"
                  >
                    กลับไปเขียนใหม่
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
