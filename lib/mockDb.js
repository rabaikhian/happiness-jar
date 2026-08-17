import mockDbFile from '../scratch/mock_db.json';

// Dynamic requires to prevent Edge runtime bundle compilation errors on Cloudflare Pages
let fs = null;
let path = null;
let SCRATCH_DIR = '';
let MOCK_DB_PATH = '';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  try {
    fs = require('fs');
    path = require('path');
    const getCwd = () => {
      const p = globalThis['process'];
      return p && typeof p['cwd'] === 'function' ? p['cwd']() : '';
    };
    SCRATCH_DIR = path.join(getCwd(), 'scratch');
    MOCK_DB_PATH = path.join(SCRATCH_DIR, 'mock_db.json');
  } catch (e) {
    console.warn('Node.js built-ins not available');
  }
}


// Updated seed data including the new category "⏳ เวลา & การเติบโต" and hex colors
const DEFAULT_NOTES = [
  {
    id: 'mock-1',
    category: 'gratitude',
    content: 'วันนี้ได้กินกาแฟแก้วโปรดพร้อมนั่งมองท้องฟ้าโปร่งๆ แค่นี้ก็รู้สึกว่าชีวิตปรานีกับเรามากแล้ว ขอบคุณตัวเองที่ไม่ยอมแพ้นะ',
    color: '#FEF9C3',
    author: 'คนชอบมองท้องฟ้า ☁️',
    likes_count: 8,
    hugs_count: 5,
    sparkles_count: 3,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 600000).toISOString() // 10 mins ago
  },
  {
    id: 'mock-2',
    category: 'morning',
    content: 'ตื่นเช้ามาอย่าลืมยิ้มให้ตัวเองในกระจกนะ คุณทำได้ดีมากๆ แล้ว และวันนี้ก็จะเป็นอีกหนึ่งวันที่คุณผ่านมันไปได้ด้วยดีแน่นอน! 💪✨',
    color: '#FCE7F3',
    author: 'เพื่อนข้างบ้านผู้หวังดี',
    likes_count: 12,
    hugs_count: 9,
    sparkles_count: 6,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
  },
  {
    id: 'mock-3',
    category: 'stranger',
    content: 'ถึงคุณที่กำลังเหนื่อยล้า... พักสายตาแป๊บนึงนะ ดื่มน้ำสักแก้ว สูดหายใจลึกๆ โลกนี้โชคดีมากที่มีคุณอยู่ อย่าลืมใจดีกับตัวเองเยอะๆ นะครับ',
    color: '#DCFCE7',
    author: 'นักเดินทางหมายเลข 404',
    likes_count: 15,
    hugs_count: 18,
    sparkles_count: 10,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: 'mock-4',
    category: 'letgo',
    content: 'ปล่อยเรื่องแย่ๆ ของเมื่อวานทิ้งไว้ตรงนี้นะ ไม่ต้องแบกทุกอย่างไว้คนเดียวหรอก พรุ่งนี้ค่อยเริ่มใหม่ได้เสมอ เป็นกำลังใจให้ครับ',
    color: '#F3E8FF',
    author: 'สายลมยามเย็น 🍃',
    likes_count: 7,
    hugs_count: 11,
    sparkles_count: 4,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  },
  {
    id: 'mock-5',
    category: 'gratitude',
    content: 'ดีใจมากที่วันนี้งานโปรเจกต์ที่ตั้งใจทำได้รับการอนุมัติ รู้สึกหายเหนื่อยเป็นปลอกทิ้ง ขอส่งต่อพลังความสุขนี้ให้ทุกคนที่กำลังพยายามอยู่นะ!',
    color: '#E0F2FE',
    author: 'มนุษย์เงินเดือนผู้มีความหวัง',
    likes_count: 9,
    hugs_count: 4,
    sparkles_count: 7,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
  },
  {
    id: 'mock-6',
    category: 'morning',
    content: 'แสงแดดเช้าวันนี้อบอุ่นจัง ขออวยพรให้วันของคุณสดใส มีแต่รอยยิ้ม และได้พบเจอแต่คนใจดีตลอดทั้งวันนะ',
    color: '#FEF9C3',
    author: 'ทานตะวันสดใส 🌻',
    likes_count: 6,
    hugs_count: 3,
    sparkles_count: 5,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 18000000).toISOString() // 5 hours ago
  },
  // New Seed Notes for Time & Growth ("⏳ เวลา & การเติบโต")
  {
    id: 'mock-7',
    category: 'time',
    content: 'ไม่ต้องรีบร้อน ดอกไม้แต่ละชนิดมีฤดูกาลบานที่ไม่เหมือนกัน ชีวิตคุณก็เช่นกัน... ค่อยๆ เติบโตตามจังหวะของตัวเองนะ 🌸⏳',
    color: '#CCFBF1', // Teal Pastel
    author: 'ผู้เฝ้ามองฤดูกาลบาน',
    likes_count: 22,
    hugs_count: 19,
    sparkles_count: 15,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString() // 6 hours ago
  },
  {
    id: 'mock-8',
    category: 'time',
    content: 'เวลาทำหน้าที่ของมันเสมอ ความเจ็บปวดเมื่อเดือนก่อน วันนี้อาจกลายเป็นแค่เรื่องเล่าเรื่องหนึ่ง ขอบคุณตัวเองที่ผ่านช่วงเวลานั้นมาได้นะ',
    color: '#CCFBF1',
    author: 'เข็มนาฬิกาของชีวิต',
    likes_count: 18,
    hugs_count: 24,
    sparkles_count: 11,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'mock-9',
    category: 'time',
    content: 'ให้เวลาร่างกายและหัวใจได้พักบ้างนะ คุณไม่จำเป็นต้องเก่งหรือวิ่งตลอด 24 ชั่วโมงหรอก การหยุดพักก็คือส่วนหนึ่งของการเดินทาง 🤍',
    color: '#CCFBF1',
    author: 'สายลมที่ไหลเอื่อย',
    likes_count: 27,
    hugs_count: 35,
    sparkles_count: 20,
    is_approved: true,
    flag_count: 0,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  }
];

function initDb() {
  if (!fs || !SCRATCH_DIR || !MOCK_DB_PATH) return;
  if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  }
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify({ notes: DEFAULT_NOTES, reports: [] }, null, 2), 'utf-8');
  }
}

export function getMockNotes() {
  if (!fs || !MOCK_DB_PATH) {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return mockDbFile.notes
        .filter(note => new Date(note.created_at).getTime() >= sevenDaysAgo && note.is_approved && note.flag_count < 3)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (e) {
      return DEFAULT_NOTES;
    }
  }
  initDb();
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    
    // Passive cleanup of local mock DB
    const filteredNotes = data.notes.filter(note => new Date(note.created_at).getTime() >= sevenDaysAgo);
    if (filteredNotes.length !== data.notes.length) {
      data.notes = filteredNotes;
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }

    return filteredNotes
      .filter(note => note.is_approved && note.flag_count < 3)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error reading mock database:', error);
    return DEFAULT_NOTES;
  }
}

export function saveMockNote(note) {
  if (!fs || !MOCK_DB_PATH) {
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      likes_count: 0,
      hugs_count: 0,
      sparkles_count: 0,
      is_approved: true,
      flag_count: 0,
      created_at: new Date().toISOString(),
      author: note.author || 'เพื่อนแปลกหน้าผู้หวังดี',
      ...note
    };
  }
  initDb();
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    const newNote = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      likes_count: 0,
      hugs_count: 0,
      sparkles_count: 0,
      is_approved: true,
      flag_count: 0,
      created_at: new Date().toISOString(),
      author: note.author || 'เพื่อนแปลกหน้าผู้หวังดี',
      ...note
    };
    data.notes.unshift(newNote);
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return newNote;
  } catch (error) {
    console.error('Error saving to mock database:', error);
    throw error;
  }
}

export function reactMockNote(noteId, reactionType) {
  if (!fs || !MOCK_DB_PATH) return null;
  initDb();
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    const note = data.notes.find(n => n.id === noteId);
    if (note) {
      if (reactionType === 'likes') note.likes_count = (note.likes_count || 0) + 1;
      else if (reactionType === 'hugs') note.hugs_count = (note.hugs_count || 0) + 1;
      else if (reactionType === 'sparkles') note.sparkles_count = (note.sparkles_count || 0) + 1;
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return note;
    }
    return null;
  } catch (error) {
    console.error('Error updating reaction in mock database:', error);
    return null;
  }
}

export function reportMockNote(noteId, reason) {
  if (!fs || !MOCK_DB_PATH) return null;
  initDb();
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    const note = data.notes.find(n => n.id === noteId);
    if (note) {
      note.flag_count = (note.flag_count || 0) + 1;
      if (note.flag_count >= 3) {
        note.is_approved = false;
      }
      
      const newReport = {
        id: `report-${Date.now()}`,
        note_id: noteId,
        reason,
        created_at: new Date().toISOString()
      };
      data.reports.push(newReport);
      
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return note;
    }
    return null;
  } catch (error) {
    console.error('Error reporting note in mock database:', error);
    return null;
  }
}
