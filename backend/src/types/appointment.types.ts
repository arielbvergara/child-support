export type AppointmentRequestBody = {
  name: unknown;
  email: unknown;
  phone?: unknown;
  service?: unknown;
  notes?: unknown;
  datetime: unknown;
};

export type ValidatedAppointmentPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
  datetime: string; // ISO 8601
};

export type TimeSlot = {
  datetime: string; // ISO 8601
};

export type AvailabilityResponse = {
  slots: TimeSlot[];
};

export type CalendarEvent = {
  start: { dateTime: string };
  end: { dateTime: string };
};
