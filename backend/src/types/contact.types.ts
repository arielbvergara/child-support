export type ContactRequestBody = {
  name: unknown;
  email: unknown;
  phone?: unknown;
  service?: unknown;
  message: unknown;
};

export type ValidatedContactPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type ValidationError = {
  field: string;
  message: string;
};
