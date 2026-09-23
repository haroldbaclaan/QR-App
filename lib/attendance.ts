// Replace lines 1-3 with:
import { getEventByCode } from '../lib/events';
import { parseQRPayload } from '../lib/qr';
import { supabase } from '../lib/supabase';

// Note: If those files are inside 'lib/' or 'utils/', update the paths accordingly:
// import { getEventByCode } from '../lib/events';
// import { parseQRPayload } from '../lib/qr';
// import { supabase } from '../lib/supabase';

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  start: string | null;
  end: string | null;
  attendees: {
    studentId: string;
    scannedAt: string;
  }[];
};

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  attendeeCount: number;
};

/**
 * STUDENT
 * Register attendance from a scanned QR code.
 */
export async function registerAttendance(
  rawPayload: string,
  studentId: string
): Promise<RegisterResult> {
  // 1. Validate QR format
  const parsed = parseQRPayload(rawPayload);

  if (!parsed.ok) {
    return {
      success: false,
      message: parsed.message,
    };
  }

  const payload = parsed.payload;

  // 2. Check event time
  const now = Date.now();

  const start = payload.start ? new Date(payload.start).getTime() : null;
  const end = payload.end ? new Date(payload.end).getTime() : null;

  if (start && now < start) {
    return {
      success: false,
      message: 'Event has not started yet.',
    };
  }

  if (end && now > end) {
    return {
      success: false,
      message: 'Event has already ended.',
    };
  }

  const title = payload.title ?? payload.event;

  // 3. Find the event in Supabase
  const foundEvent = await getEventByCode(payload.event);

  let event: {
    id: string;
    title: string;
  } | null = null;

  if (foundEvent) {
    event = {
      id: foundEvent.id,
      title: foundEvent.title,
    };
  } else {
    // 3b. Event does not exist, so create it
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        event_code: payload.event,
        title,
        start_time: payload.start ?? null,
        end_time: payload.end ?? null,
      })
      .select('id, title')
      .single();

    if (insertError || !newEvent) {
      console.error('CREATE EVENT ERROR:', insertError);

      return {
        success: false,
        message: 'Could not create event.',
      };
    }

    event = newEvent;
  }

  // Early return guard to resolve TS error 18047 ('event' is possibly 'null')
  if (!event) {
    return {
      success: false,
      message: 'Event processing failed.',
    };
  }

  // 4. Register attendance
  const { error: attendanceError } = await supabase
    .from('attendance')
    .insert({
      student_id: studentId,
      event_id: event.id,
    });

  // 5. Check duplicate scan
  if (attendanceError) {
    if (attendanceError.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
        eventTitle: event.title,
      };
    }

    console.error('REGISTER ATTENDANCE ERROR:', attendanceError);

    return {
      success: false,
      message: attendanceError.message,
      eventTitle: event.title,
    };
  }

  return {
    success: true,
    message: 'Attendance recorded!',
    eventTitle: event.title,
  };
}

/**
 * STUDENT
 * Get the student's attendance history.
 */
export async function getAttendanceHistory(
  studentId: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id,
      student_id,
      scanned_at,
      events (
        event_code,
        title
      )
    `)
    .eq('student_id', studentId)
    .order('scanned_at', {
      ascending: false,
    });

  if (error || !data) {
    console.error('GET ATTENDANCE HISTORY ERROR:', error);
    return [];
  }

  type HistoryRow = {
    id: string;
    student_id: string;
    scanned_at: string;
    events: {
      event_code: string;
      title: string;
    } | null;
  };

  return (data as unknown as HistoryRow[]).map((record) => ({
    id: record.id,
    eventId: record.events?.event_code ?? '',
    eventTitle: record.events?.title ?? 'Unknown Event',
    scannedAt: record.scanned_at,
  }));
}

/**
 * TEACHER
 * Get attendance for events created by the teacher.
 */
export async function getTeacherEventAttendance(
  teacherId: string
): Promise<TeacherEventAttendance[]> {
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time, end_time')
    .eq('created_by', teacherId)
    .order('created_at', {
      ascending: false,
    });

  if (eventsError || !events) {
    console.error('TEACHER EVENTS ERROR:', eventsError);
    return [];
  }

  if (events.length === 0) {
    return [];
  }

  type EventRow = {
    id: string;
    event_code: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
  };

  type AttendanceRow = {
    event_id: string;
    student_id: string;
    scanned_at: string;
  };

  const typedEvents = events as EventRow[];
  const eventIds = typedEvents.map((event) => event.id);

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('event_id, student_id, scanned_at')
    .in('event_id', eventIds)
    .order('scanned_at', {
      ascending: false,
    });

  if (attendanceError) {
    console.error('TEACHER ATTENDANCE ERROR:', attendanceError);
    return [];
  }

  const typedAttendance = (attendance ?? []) as AttendanceRow[];

  return typedEvents.map((event) => ({
    eventId: event.id,
    eventCode: event.event_code,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    attendees: typedAttendance
      .filter((record) => record.event_id === event.id)
      .map((record) => ({
        studentId: record.student_id,
        scannedAt: record.scanned_at,
      })),
  }));
}

/**
 * TEACHER
 * Get a lightweight summary of attendance for each event created by the teacher.
 */
export async function getTeacherEventSummary(
  teacherId: string
): Promise<TeacherEventSummary[]> {
  type SummaryEventRow = {
    id: string;
    event_code: string;
    title: string;
  };

  type AttendanceSummaryRow = {
    event_id: string;
  };

  // 1. Get the teacher's events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, event_code, title')
    .eq('created_by', teacherId)
    .order('created_at', {
      ascending: false,
    });

  if (eventsError || !events) {
    console.error('TEACHER EVENT SUMMARY ERROR:', eventsError);
    return [];
  }

  const typedEvents = events as SummaryEventRow[];
  const eventIds = typedEvents.map((event) => event.id);

  if (eventIds.length === 0) {
    return [];
  }

  // 2. Fetch ONLY event_id from attendance
  const { data: attRows, error: attError } = await supabase
    .from('attendance')
    .select('event_id')
    .in('event_id', eventIds);

  if (attError || !attRows) {
    console.error('TEACHER SUMMARY ATTENDANCE ERROR:', attError);
    return [];
  }

  const typedAttRows = attRows as AttendanceSummaryRow[];

  // 3. Count attendance rows per event
  const counts: Record<string, number> = {};

  typedAttRows.forEach((row) => {
    counts[row.event_id] = (counts[row.event_id] ?? 0) + 1;
  });

  // 4. Build summary
  return typedEvents.map((event) => ({
    eventId: event.id,
    eventCode: event.event_code,
    title: event.title,
    attendeeCount: counts[event.id] ?? 0,
  }));
}