import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { reactMockNote } from '@/lib/mockDb';

export async function POST(request, { params }) {
  try {
    const { id } = await params; // Await params for Next.js 15+ / 16 compatibility
    const body = await request.json();
    const { reactionType } = body; // 'likes', 'hugs', 'sparkles'

    if (!reactionType || !['likes', 'hugs', 'sparkles'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'ประเภทรีแอคชันไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      // Call Supabase RPC function for atomic increment
      const { error } = await supabase.rpc('increment_reaction', {
        note_id: id,
        reaction_type: reactionType
      });

      if (error) {
        console.error('Supabase RPC error, falling back to mock:', error);
        const updated = reactMockNote(id, reactionType);
        if (!updated) {
          return NextResponse.json({ error: 'ไม่พบโน้ตที่ระบุ' }, { status: 404 });
        }
        return NextResponse.json(updated);
      }

      return NextResponse.json({ success: true });
    } else {
      const updated = reactMockNote(id, reactionType);
      if (!updated) {
        return NextResponse.json({ error: 'ไม่พบโน้ตที่ระบุ' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('API POST reaction error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งรีแอคชัน' },
      { status: 500 }
    );
  }
}
