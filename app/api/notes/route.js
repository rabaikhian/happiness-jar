import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getMockNotes, saveMockNote } from '@/lib/mockDb';
import { moderateContent } from '@/lib/moderation';

// Mental health crisis resources in Thailand (Same warm crisis messages)
const CRISIS_RESOURCES = {
  intro: 'ขออภัยด้วยนะคะ ข้อความของคุณไม่ผ่านเกณฑ์ความปลอดภัยของเรา เนื่องจากอาจมีคำพูดที่สื่อถึงความตึงเครียด การทำร้ายตัวเอง หรืออารมณ์ที่อ่อนไหวเป็นพิเศษ หากคุณหรือคนใกล้ชิดกำลังรู้สึกเหนื่อยล้า ท้อแท้ หรือเผชิญกับช่วงเวลาที่ยากลำบากในชีวิต พวกเราขอโอบกอดคุณ และอยากให้รู้ว่าคุณไม่ได้อยู่ตัวคนเดียวนะคะ มีคนที่พร้อมรับฟังและช่วยเหลือคุณอยู่เสมอค่ะ',
  contacts: [
    {
      name: 'สายด่วนสุขภาพจิต (กรมสุขภาพจิต)',
      number: '1323',
      detail: 'โทรฟรีตลอด 24 ชั่วโมง เพื่อปรึกษาปัญหาทางใจและความเครียด'
    },
    {
      name: 'สมาคมสะมาริตันส์แห่งประเทศไทย (Samaritans of Thailand)',
      number: '02-113-6789',
      detail: 'บริการรับฟังทางโทรศัพท์เพื่อป้องกันการทำร้ายตัวเองและฆ่าตัวตาย (ให้บริการเวลา 12:00 - 22:00 น.)'
    },
    {
      name: 'สายด่วนวัยรุ่น เลิฟแคร์สเตชั่น (Lovecare Station)',
      number: '081-300-2200',
      detail: 'ให้คำปรึกษาสำหรับวัยรุ่นเรื่องความเครียด ความรัก และความสัมพันธ์'
    }
  ]
};

// GET: Fetch all approved notes
export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_approved', true)
        .lt('flag_count', 3)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error, falling back to mock DB:', error);
        return NextResponse.json(getMockNotes());
      }
      return NextResponse.json(data || []);
    } else {
      return NextResponse.json(getMockNotes());
    }
  } catch (error) {
    console.error('API GET notes error:', error);
    return NextResponse.json(getMockNotes());
  }
}

// POST: Create a new note (with AI Moderation filter and author support)
export async function POST(request) {
  try {
    const body = await request.json();
    const { content, color, category, author } = body;

    // Validate request body
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อความส่งพลังบวก' },
        { status: 400 }
      );
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: 'ข้อความต้องยาวไม่เกิน 300 ตัวอักษร' },
        { status: 400 }
      );
    }

    // Run AI Moderation Filter
    const moderationResult = await moderateContent(content);

    if (moderationResult.flagged) {
      return NextResponse.json(
        {
          flagged: true,
          message: moderationResult.reason || 'พบเนื้อหาที่ไม่เหมาะสมหรือมีความเสี่ยง',
          crisisResources: CRISIS_RESOURCES
        },
        { status: 400 }
      );
    }

    const noteData = {
      content: content.trim(),
      color: color || '#FEF9C3',
      category: category || 'gratitude',
      author: author?.trim() || 'เพื่อนแปลกหน้าผู้หวังดี'
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select();

      if (error) {
        console.error('Supabase insert error, falling back to mock DB:', error);
        const mockSaved = saveMockNote(noteData);
        return NextResponse.json(mockSaved, { status: 201 });
      }
      return NextResponse.json(data?.[0], { status: 201 });
    } else {
      const mockSaved = saveMockNote(noteData);
      return NextResponse.json(mockSaved, { status: 201 });
    }
  } catch (error) {
    console.error('API POST notes error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลข้อความ' },
      { status: 500 }
    );
  }
}
