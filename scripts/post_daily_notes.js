const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Warm comforting Thai messages pool (50 messages)
const MESSAGES_POOL = [
  // 1. Gratitude (🌸 ขอบคุณความสุข)
  { content: 'วันนี้ลองมองหาความสุขเล็กๆ ดูนะ อย่างการได้กินของอร่อย หรือเพลงเพราะๆ ที่บังเอยินได้ยิน 🌸', category: 'gratitude' },
  { content: 'ขอบคุณตัวเองที่ตื่นมาใช้ชีวิตในวันนี้อย่างเต็มที่นะ เก่งมากแล้วจริงๆ 💖', category: 'gratitude' },
  { content: 'ความสุขไม่จำเป็นต้องเป็นเรื่องยิ่งใหญ่ แค่ชานมไข่มุกอร่อยๆ สักแก้วก็ทำให้ยิ้มได้แล้วนะ 🧋', category: 'gratitude' },
  { content: 'ลองจด 3 สิ่งดีๆ ที่เกิดขึ้นในวันนี้ดูสิ แล้วจะพบว่าชีวิตเราก็น่ารักเหมือนกันนะ 🥰', category: 'gratitude' },
  { content: 'ขอบคุณความอบอุ่นรอบตัวที่มองไม่เห็น ขอบคุณรอยยิ้มของคนแปลกหน้าในวันนี้ด้วยนะ 🌻', category: 'gratitude' },
  { content: 'วันนี้ได้เห็นแมวจรตัวนึงนั่งตากแดดสบายใจ ทำให้คิดได้ว่าชีวิตแค่นี้ก็ดีแล้วนี่นา 🐱', category: 'gratitude' },
  { content: 'ขอบคุณความใจดีของใครบางคนที่ช่วยเตือนให้รู้ว่าโลกนี้ยังมีมุมที่งดงามอยู่ ☁️', category: 'gratitude' },
  { content: 'วันนี้ทำงานเสร็จตามเป้าหมายแล้ว! ถึงจะเหนื่อยแต่ก็ขอบคุณความพยายามของตัวเองนะ 💻', category: 'gratitude' },
  { content: 'เตียงนอนนุ่มๆ กับผ้าห่มอุ่นๆ คืนนี้ คือรางวัลที่ดีที่สุดของวัน ขอบคุณนะเตียงนอน 🛌', category: 'gratitude' },
  { content: 'ขอบคุณสายฝนที่ช่วยให้ต้นไม้รอบบ้านดูสดชื่นขึ้นในวันนี้ ชุ่มฉ่ำหัวใจจัง 🌧️', category: 'gratitude' },

  // 2. Morning (☀️ พลังใจยามเช้า)
  { content: 'เช้าวันใหม่เริ่มต้นแล้ว ขอให้วันนี้ใจดีกับคุณและเป็นวันที่สดใสนะ ☀️', category: 'morning' },
  { content: 'สูดหายใจเข้าลึกๆ ยิ้มให้ตัวเองหน้ากระจก แล้วออกไปลุยวันใหม่กันนะ ยินดีต้อนรับเช้าวันใหม่ 🌈', category: 'morning' },
  { content: 'ไม่ว่าเมื่อวานจะแย่แค่ไหน วันนี้คือโอกาสเริ่มต้นใหม่เสมอ ก้าวเล็กๆ ในวันนี้ก็นับนะ 👣', category: 'morning' },
  { content: 'ขอให้กาแฟแก้วนี้เติมพลังให้คุณมีพลังยิ้มสู้กับทุกเรื่องในวันนี้เลยนะ ☕', category: 'morning' },
  { content: 'ท้องฟ้ายามเช้าสวยงามเสมอ เหมือนชีวิตคุณที่กำลังจะเริ่มต้นวันใหม่อย่างสดใส 🌅', category: 'morning' },
  { content: 'ขอให้วันนี้คุณได้เจอแต่รอยยิ้ม ความรัก และสิ่งดีๆ ตลอดทั้งวันเลยนะ 💫', category: 'morning' },
  { content: 'ตื่นเช้ามาอย่าลืมบอกตัวเองในใจนะว่า "วันนี้ฉันพร้อมที่จะมีความสุขแล้ว" 🍃', category: 'morning' },
  { content: 'คุณเป็นคนเก่งและมีความสามารถในแบบของคุณเองนะ วันนี้ลุยให้เต็มที่เลย! 💪', category: 'morning' },
  { content: 'ขอส่งพลังงานบวกและกอดอุ่นๆ ยามเช้าไปให้คุณนะ ขอให้เป็นวันที่แสนวิเศษ 💖', category: 'morning' },
  { content: 'นกตัวน้อยยังบินออกไปหาอาหารอย่างร่าเริงเลย ขอให้คุณเริ่มต้นวันอย่างมีความสุขเช่นกัน 🐦', category: 'morning' },

  // 3. Stranger (💌 ถึงคนแปลกหน้า)
  { content: 'ถึงเพื่อนแปลกหน้า... อย่าลืมหาเวลาพักผ่อนและดูแลตัวเองดีๆ นะ มีคนเป็นห่วงคุณอยู่นะ 💌', category: 'stranger' },
  { content: 'ไม่รู้ว่าตอนนี้คุณกำลังเจอกับอะไรอยู่ แต่ขอส่งกำลังใจผ่านตัวหนังสือนี้ไปโอบกอดคุณนะ 🫂', category: 'stranger' },
  { content: 'คุณเป็นคนที่น่ารักและมีค่ามากๆ ในโลกใบนี้ อย่าปล่อยให้ใครมาทำให้คุณสงสัยในตัวเองนะ ✨', category: 'stranger' },
  { content: 'ถ้าวันนี้ยังไม่มีใครบอกคุณ... ฉันขอเป็นคนแปลกหน้าคนนึงที่บอกว่า "คุณเก่งมากแล้วนะ" 💖', category: 'stranger' },
  { content: 'หวังว่าตัวหนังสือสั้นๆ นี้จะช่วยสร้างรอยยิ้มเล็กๆ มุมปากให้คุณได้ในตอนนี้นะ 😊', category: 'stranger' },
  { content: 'ต่อให้โลกจะใจร้ายกับคุณแค่ไหน ขอให้รู้ไว้ว่าที่ตรงนี้มีพลังใจพร้อมโอบกอดคุณเสมอ 🌍', category: 'stranger' },
  { content: 'อย่าลืมกินข้าวให้อิ่ม ดื่มน้ำเยอะๆ และนอนหลับฝันดีนะเพื่อนแปลกหน้าผู้หวังดี 🍚', category: 'stranger' },
  { content: 'ขอให้ทุกสิ่งที่คุณกำลังพยายามทำอยู่ประสบความสำเร็จและราบรื่นนะ เอาใจช่วยเสมอ 🌟', category: 'stranger' },
  { content: 'คุณไม่ได้อยู่ตัวคนเดียวนะ บนโลกใบนี้ยังมีเพื่อนๆ แปลกหน้าอีกหลายคนที่พร้อมส่งพลังบวกให้คุณ 🫂', category: 'stranger' },
  { content: 'รอยยิ้มของคุณสวยงามที่สุดเลยนะ อย่าลืมยิ้มให้บ่อยขึ้นอีกนิดนึงล่ะ 😉', category: 'stranger' },

  // 4. Let Go (🌙 ระบาย & ปล่อยวาง)
  { content: 'การร้องไห้ไม่ใช่เรื่องอ่อนแอหรอกนะ ระบายมันออกมาเถอะ แล้วค่อยๆ ล้างหน้าเริ่มใหม่ยามเช้า 🌙', category: 'letgo' },
  { content: 'บางเรื่องที่คุมไม่ได้ก็ต้องยอมปล่อยมันไปนะ แบกไว้ก็เหนื่อยเปล่าๆ วางลงบ้างก็ได้นะ 🍃', category: 'letgo' },
  { content: 'หัวใจของคุณเหนื่อยมามากแล้ว คืนนี้ปล่อยวางความกังวลใจทุกอย่างลง แล้วหลับพักผ่อนเถอะนะ 🛌', category: 'letgo' },
  { content: 'ผิดพลาดบ้างก็ไม่เป็นไรหรอกนะ ชีวิตคือการเรียนรู้ ไม่มีใครสมบูรณ์แบบไปเสียทุกเรื่อง 🤍', category: 'letgo' },
  { content: 'ความคิดลบๆ หรือคำพูดทำร้ายจิตใจของคนอื่น โยนทิ้งมันไปนอกหน้าต่างเลยนะ อย่าเก็บมาใส่ใจ 🗑️', category: 'letgo' },
  { content: 'ให้เวลาร่างกายและสมองได้ว่างบ้าง ไม่ต้องคิดอะไรสัก 5 นาที แล้วสูดหายใจเข้าลึกๆ ลมหายใจอุ่นๆ 🌬️', category: 'letgo' },
  { content: 'สิ่งที่เกิดขึ้นแล้วดีเสมอ อย่างน้อยมันก็ทำให้คุณแข็งแกร่งและเติบโตขึ้นกว่าเมื่อก่อนนะ 🌱', category: 'letgo' },
  { content: 'ลบความกังวลของวันพรุ่งนี้ออกไปก่อน คืนนี้คุณมีหน้าที่แค่หลับใหลอย่างมีความสุขเท่านั้น 💤', category: 'letgo' },
  { content: 'ไม่จำเป็นต้องเปรียบเทียบชีวิตตัวเองกับใคร จังหวะชีวิตของแต่ละคนไม่เหมือนกันนะ ⏳', category: 'letgo' },
  { content: 'โอบกอดความเปราะบางของตัวเองไว้บ้างนะ วันนี้ทำดีที่สุดเท่าที่จะทำได้แล้วจริงๆ 🫂', category: 'letgo' },

  // 5. Time (⏳ เวลา & การเติบโต)
  { content: 'ไม่ต้องรีบร้อน ดอกไม้แต่ละชนิดมีฤดูกาลบานที่ไม่เหมือนกัน ชีวิตคุณก็เช่นกัน... ค่อยๆ เติบโตนะ 🌸⏳', category: 'time' },
  { content: 'เวลาทำหน้าที่ของมันเสมอ ความเจ็บปวดเมื่อเดือนก่อน วันนี้อาจกลายเป็นแค่เรื่องเล่าเรื่องหนึ่ง ขอบคุณตัวเองที่ผ่านช่วงเวลานั้นมาได้นะ ⏳', category: 'time' },
  { content: 'ให้เวลาร่างกายและหัวใจได้พักบ้างนะ คุณไม่จำเป็นต้องเก่งหรือวิ่งตลอด 24 ชั่วโมง การหยุดพักคือส่วนหนึ่งของการเดินทาง 🤍', category: 'time' },
  { content: 'การเติบโตมักจะเงียบและเชื่องช้าเสมอ เหมือนต้นไม้ใหญ่ที่แผ่กิ่งก้านทีละนิด ขอให้คุณอดทนและเชื่อมั่นในตัวเองนะ 🌳', category: 'time' },
  { content: 'ทุกบาดแผลและทุกอุปสรรคที่ผ่านมา คือปุ๋ยชั้นดีที่ทำให้หัวใจของคุณแข็งแรงขึ้นในวันนี้ 🌱', category: 'time' },
  { content: 'เวลาจะช่วยคัดกรองสิ่งที่ไม่ใช่ออกไป และเหลือไว้เฉพาะสิ่งที่มีค่าและคู่ควรกับหัวใจของคุณ ⏳', category: 'time' },
  { content: 'อย่าเพิ่งท้อแท้หากวันนี้ยังไม่เห็นผลลัพธ์ หยดน้ำที่หยดลงหินทุกวัน วันนึงมันจะสร้างการเปลี่ยนแปลงได้แน่นอน 💧', category: 'time' },
  { content: 'คุณในวันนี้ เก่งและเติบโตขึ้นกว่าคุณเมื่อปีที่แล้วตั้งเยอะนะ ภูมิใจในตัวเองหน่อยสิ! 🌟', category: 'time' },
  { content: 'เข็มนาฬิกาเดินไปข้างหน้าเสมอ ชีวิตเราก็เช่นกัน ขอให้คุณก้าวไปข้างหน้าอย่างมั่นใจนะ 🕰️', category: 'time' },
  { content: 'ไม่มีอะไรสายเกินไปสำหรับการเริ่มต้นเรียนรู้สิ่งใหม่ๆ หรือเปลี่ยนแปลงตัวเองให้มีความสุขขึ้น 🌈', category: 'time' }
];

const COLORS = [
  '#FEF9C3', // yellow
  '#FCE7F3', // pink
  '#DCFCE7', // green
  '#F3E8FF', // purple
  '#E0F2FE', // blue
  '#FFEDD5', // orange
  '#CCFBF1'  // teal/turquoise
];

const AUTHORS = [
  'เพื่อนร่วมทาง 🚶',
  'ก้อนเมฆสีขาว ☁️',
  'ถ้วยชาอุ่นๆ 🍵',
  'กล่องดนตรี 🎵',
  'แมวส้มตัวกลม 🐈',
  'ดวงดาวนำทาง ⭐',
  'ต้นไม้ใหญ่ 🌳',
  'แสงแดดอบอุ่น ☀️',
  'สายลมพัดเอื่อย 🍃',
  'จันทร์เสี้ยวส่องแสง 🌙',
  'กระดาษบันทึกเก่า 📝',
  'ดอกทานตะวันสีเหลือง 🌻'
];

async function postDailyNotes() {
  console.log('--- Starting Daily Happiness Note Injection ---');
  
  // 1. Select 10 unique random notes from the pool
  const shuffled = [...MESSAGES_POOL].sort(() => 0.5 - Math.random());
  const selectedNotes = shuffled.slice(0, 10);
  
  // 2. Prepare notes payload
  const notesToInsert = selectedNotes.map((item, idx) => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomAuthor = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
    
    // Spread created_at slightly to simulate notes posted throughout the day
    const timeOffsetMs = idx * 60 * 60 * 1000; // 1 hour offset per note
    const createdAt = new Date(Date.now() - timeOffsetMs).toISOString();

    return {
      content: item.content,
      category: item.category,
      color: randomColor,
      author: randomAuthor,
      likes_count: Math.floor(Math.random() * 15) + 1, // Random pre-filled positive likes
      hugs_count: Math.floor(Math.random() * 10) + 1,  // Random hugs
      sparkles_count: Math.floor(Math.random() * 8) + 1, // Random sparkles
      is_approved: true,
      flag_count: 0,
      created_at: createdAt
    };
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
    // Post to Supabase
    console.log(`Connecting to Supabase at: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(notesToInsert)
        .select();

      if (error) {
        throw error;
      }
      console.log(`Successfully injected ${data?.length || 10} notes into Supabase DB!`);
    } catch (dbError) {
      console.error('Failed to post notes to Supabase, falling back to local database:', dbError.message);
      writeToLocalMock(notesToInsert);
    }
  } else {
    // Post to local mock DB
    console.log('Supabase config not found or invalid. Falling back to local mock DB...');
    writeToLocalMock(notesToInsert);
  }
  console.log('--- Daily Injection Complete ---');
}

function writeToLocalMock(notes) {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  const mockDbPath = path.join(scratchDir, 'mock_db.json');
  
  try {
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    
    let dbData = { notes: [], reports: [] };
    if (fs.existsSync(mockDbPath)) {
      dbData = JSON.parse(fs.readFileSync(mockDbPath, 'utf-8'));
    }
    
    // Add IDs
    const notesWithIds = notes.map((n, i) => ({
      id: `ai-daily-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      ...n
    }));
    
    dbData.notes.unshift(...notesWithIds);
    
    // Keep it trimmed to avoid huge local DB
    dbData.notes = dbData.notes.slice(0, 100);
    
    fs.writeFileSync(mockDbPath, JSON.stringify(dbData, null, 2), 'utf-8');
    console.log(`Successfully wrote ${notesWithIds.length} notes to local mock DB file: ${mockDbPath}`);
  } catch (fsError) {
    console.error('Failed to write to local mock DB:', fsError.message);
  }
}

// Execute direct
postDailyNotes();
