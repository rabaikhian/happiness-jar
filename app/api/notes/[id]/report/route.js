import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { reportMockNote } from '@/lib/mockDb';

export const runtime = 'edge';


export async function POST(request, { params }) {
  try {
    const { id } = await params; // Await params for Next.js 15+ / 16 compatibility
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'กรุณาระบุเหตุผลในการรายงาน' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      // Call Supabase RPC function to add report, increment flags, and auto-hide if needed
      const { error } = await supabase.rpc('report_note', {
        n_id: id,
        report_reason: reason.trim()
      });

      if (error) {
        console.error('Supabase RPC report error, falling back to mock:', error);
        const updated = reportMockNote(id, reason);
        if (!updated) {
          return NextResponse.json({ error: 'ไม่พบโน้ตที่ระบุ' }, { status: 404 });
        }
        return NextResponse.json(updated);
      }

      return NextResponse.json({ success: true });
    } else {
      const updated = reportMockNote(id, reason);
      if (!updated) {
        return NextResponse.json({ error: 'ไม่พบโน้ตที่ระบุ' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('API POST report error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการรายงานข้อความ' },
      { status: 500 }
    );
  }
}
