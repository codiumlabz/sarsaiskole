import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // The QR code might contain the UUID or the short student_id
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .or("id.eq.,student_id.eq.")
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Map database fields to the format expected by the mobile app
    const mappedStudent = {
      ...student,
      studentId: student.student_id,
      monthlyFee: student.monthly_fee_amount,
    };

    return NextResponse.json(mappedStudent);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
