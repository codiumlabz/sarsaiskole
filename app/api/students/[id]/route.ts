import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured (missing env vars)' },
        { status: 500 }
      );
    }

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .or(`id.eq.${id},student_id.eq.${id}`)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Supabase Error: ' + error.message, details: error },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const mappedStudent = {
      ...student,
      studentId: student.student_id,
      monthlyFee: student.monthly_fee_amount,
    };

    return NextResponse.json(mappedStudent);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
