export type QRPayload = {
  v: 1;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export function buildQRPayload(event: {
  eventId: string;
  title: string;
  start?: string;
  end?: string;
}): string {
  const payload: QRPayload = {
    v: 1,
    event: event.eventId,
  };

  if (event.title) {
    payload.title = event.title;
  }

  if (event.start) {
    payload.start = event.start;
  }

  if (event.end) {
    payload.end = event.end;
  }

  return JSON.stringify(payload);
}

export type ParseQRResult =
  | {
      ok: true;
      payload: QRPayload;
    }
  | {
      ok: false;
      message: string;
    };

export function parseQRPayload(raw: string): ParseQRResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      message: 'Invalid QR code.',
    };
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('v' in parsed) ||
    !('event' in parsed)
  ) {
    return {
      ok: false,
      message: 'Not an attendance QR code.',
    };
  }

  const data = parsed as {
    v?: unknown;
    event?: unknown;
    title?: unknown;
    start?: unknown;
    end?: unknown;
  };

  if (
    data.v !== 1 ||
    typeof data.event !== 'string' ||
    !data.event
  ) {
    return {
      ok: false,
      message: 'Not an attendance QR code.',
    };
  }

  return {
    ok: true,
    payload: {
      v: 1,
      event: data.event,
      ...(typeof data.title === 'string'
        ? { title: data.title }
        : {}),
      ...(typeof data.start === 'string'
        ? { start: data.start }
        : {}),
      ...(typeof data.end === 'string'
        ? { end: data.end }
        : {}),
    },
  };
}