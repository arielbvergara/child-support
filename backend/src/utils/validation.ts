import { CONTACT_VALIDATION } from '../constants/contact.constants';
import type { ValidationError } from '../types/contact.types';

/**
 * Safely extracts and trims a string field from an unknown value.
 * Returns an empty string if the value is not a string.
 */
export function extractStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validates the `name` field. Pushes errors into the provided array.
 */
export function validateName(name: string, errors: ValidationError[]): void {
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > CONTACT_VALIDATION.NAME_MAX_LENGTH) {
    errors.push({
      field: 'name',
      message: `Name must not exceed ${CONTACT_VALIDATION.NAME_MAX_LENGTH} characters`,
    });
  }
}

/**
 * Validates the `email` field. Pushes errors into the provided array.
 */
export function validateEmail(email: string, errors: ValidationError[]): void {
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (email.length > CONTACT_VALIDATION.EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: 'Email address is too long' });
  } else if (!CONTACT_VALIDATION.EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }
}

/**
 * Validates the optional `phone` field. Pushes errors into the provided array.
 */
export function validatePhone(phone: string, errors: ValidationError[]): void {
  if (phone && phone.length > CONTACT_VALIDATION.PHONE_MAX_LENGTH) {
    errors.push({
      field: 'phone',
      message: `Phone number must not exceed ${CONTACT_VALIDATION.PHONE_MAX_LENGTH} characters`,
    });
  }
}

/**
 * Validates the optional `service` field. Pushes errors into the provided array.
 */
export function validateService(service: string, errors: ValidationError[]): void {
  if (service && service.length > CONTACT_VALIDATION.SERVICE_MAX_LENGTH) {
    errors.push({
      field: 'service',
      message: `Service selection must not exceed ${CONTACT_VALIDATION.SERVICE_MAX_LENGTH} characters`,
    });
  }
}
