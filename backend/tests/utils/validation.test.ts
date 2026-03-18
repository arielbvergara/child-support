import {
  extractStringField,
  validateName,
  validateEmail,
  validatePhone,
  validateService,
} from '../../src/utils/validation';
import { CONTACT_VALIDATION } from '../../src/constants/contact.constants';
import type { ValidationError } from '../../src/types/contact.types';

describe('extractStringField', () => {
  it('extractStringField_ShouldReturnTrimmedString_WhenValueIsString', () => {
    expect(extractStringField('  hello  ')).toBe('hello');
  });

  it('extractStringField_ShouldReturnEmptyString_WhenValueIsNotString', () => {
    expect(extractStringField(undefined)).toBe('');
    expect(extractStringField(null)).toBe('');
    expect(extractStringField(123)).toBe('');
    expect(extractStringField({})).toBe('');
  });

  it('extractStringField_ShouldReturnEmptyString_WhenValueIsEmptyString', () => {
    expect(extractStringField('')).toBe('');
  });
});

describe('validateName', () => {
  let errors: ValidationError[];

  beforeEach(() => {
    errors = [];
  });

  it('validateName_ShouldPushError_WhenNameIsEmpty', () => {
    validateName('', errors);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ field: 'name', message: 'Name is required' });
  });

  it('validateName_ShouldPushError_WhenNameExceedsMaxLength', () => {
    validateName('a'.repeat(CONTACT_VALIDATION.NAME_MAX_LENGTH + 1), errors);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('name');
    expect(errors[0].message).toContain(`${CONTACT_VALIDATION.NAME_MAX_LENGTH}`);
  });

  it('validateName_ShouldNotPushError_WhenNameIsValid', () => {
    validateName('Jane Doe', errors);
    expect(errors).toHaveLength(0);
  });
});

describe('validateEmail', () => {
  let errors: ValidationError[];

  beforeEach(() => {
    errors = [];
  });

  it('validateEmail_ShouldPushError_WhenEmailIsEmpty', () => {
    validateEmail('', errors);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ field: 'email', message: 'Email is required' });
  });

  it('validateEmail_ShouldPushError_WhenEmailExceedsMaxLength', () => {
    validateEmail('a'.repeat(CONTACT_VALIDATION.EMAIL_MAX_LENGTH + 1), errors);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ field: 'email', message: 'Email address is too long' });
  });

  it('validateEmail_ShouldPushError_WhenEmailIsInvalidFormat', () => {
    validateEmail('not-an-email', errors);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ field: 'email', message: 'Email must be a valid email address' });
  });

  it('validateEmail_ShouldNotPushError_WhenEmailIsValid', () => {
    validateEmail('user@example.com', errors);
    expect(errors).toHaveLength(0);
  });
});

describe('validatePhone', () => {
  let errors: ValidationError[];

  beforeEach(() => {
    errors = [];
  });

  it('validatePhone_ShouldNotPushError_WhenPhoneIsEmpty', () => {
    validatePhone('', errors);
    expect(errors).toHaveLength(0);
  });

  it('validatePhone_ShouldPushError_WhenPhoneExceedsMaxLength', () => {
    validatePhone('1'.repeat(CONTACT_VALIDATION.PHONE_MAX_LENGTH + 1), errors);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('phone');
    expect(errors[0].message).toContain(`${CONTACT_VALIDATION.PHONE_MAX_LENGTH}`);
  });

  it('validatePhone_ShouldNotPushError_WhenPhoneIsValid', () => {
    validatePhone('+31 20 123 4567', errors);
    expect(errors).toHaveLength(0);
  });
});

describe('validateService', () => {
  let errors: ValidationError[];

  beforeEach(() => {
    errors = [];
  });

  it('validateService_ShouldNotPushError_WhenServiceIsEmpty', () => {
    validateService('', errors);
    expect(errors).toHaveLength(0);
  });

  it('validateService_ShouldPushError_WhenServiceExceedsMaxLength', () => {
    validateService('a'.repeat(CONTACT_VALIDATION.SERVICE_MAX_LENGTH + 1), errors);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('service');
    expect(errors[0].message).toContain(`${CONTACT_VALIDATION.SERVICE_MAX_LENGTH}`);
  });

  it('validateService_ShouldNotPushError_WhenServiceIsValid', () => {
    validateService('individual', errors);
    expect(errors).toHaveLength(0);
  });
});
