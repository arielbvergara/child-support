import { createEmailService } from '../../src/services/email.service';
import { Resend } from 'resend';
import type { ValidatedContactPayload } from '../../src/types/contact.types';

jest.mock('resend');

const mockSend = jest.fn();
(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
  () => ({ emails: { send: mockSend } }) as unknown as Resend,
);

const TEST_OWNER_EMAIL = 'owner@example.com';

const validPayload: ValidatedContactPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+31 20 123 4567',
  service: 'individual',
  message: 'Hello, I would like more information.',
};

describe('createEmailService', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ id: 'mock-id' });
  });

  it('sendContactEmails_ShouldCallResendOnce_WhenPayloadIsValid', async () => {
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);
    await emailService.sendContactEmails(validPayload);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('sendContactEmails_ShouldSendToOwnerEmail_WhenPayloadIsValid', async () => {
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);
    await emailService.sendContactEmails(validPayload);

    const ownerCall = mockSend.mock.calls.find(
      (call) => (call[0] as { to: string[] }).to[0] === TEST_OWNER_EMAIL,
    );
    expect(ownerCall).toBeDefined();
  });

  it('sendContactEmails_ShouldNotSendAutoReplyToSubmitter_WhenPayloadIsValid', async () => {
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);
    await emailService.sendContactEmails(validPayload);

    const autoReplyCall = mockSend.mock.calls.find(
      (call) => (call[0] as { to: string[] }).to[0] === validPayload.email,
    );
    expect(autoReplyCall).toBeUndefined();
  });

  it('sendContactEmails_ShouldPropagateError_WhenResendThrows', async () => {
    mockSend.mockRejectedValue(new Error('Resend API error'));
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);

    await expect(emailService.sendContactEmails(validPayload)).rejects.toThrow('Resend API error');
  });

  it('sendContactEmails_ShouldIncludeSheetsLink_WhenSheetsUrlProvided', async () => {
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/abc123';
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL, sheetsUrl);
    await emailService.sendContactEmails(validPayload);

    const ownerCall = mockSend.mock.calls.find(
      (call) => (call[0] as { to: string[] }).to[0] === TEST_OWNER_EMAIL,
    );
    expect((ownerCall?.[0] as { html: string }).html).toContain(sheetsUrl);
  });

  it('sendContactEmails_ShouldNotIncludeSheetsLink_WhenSheetsUrlOmitted', async () => {
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);
    await emailService.sendContactEmails(validPayload);

    const ownerCall = mockSend.mock.calls.find(
      (call) => (call[0] as { to: string[] }).to[0] === TEST_OWNER_EMAIL,
    );
    expect((ownerCall?.[0] as { html: string }).html).not.toContain('docs.google.com');
  });

  it('sendContactEmails_ShouldStripControlCharactersFromSubject_WhenNameContainsCRLF', async () => {
    const maliciousPayload: ValidatedContactPayload = {
      ...validPayload,
      name: 'Injected\r\nBcc: attacker@evil.com\r\nName',
    };
    const emailService = createEmailService('test-api-key', 'noreply@example.com', TEST_OWNER_EMAIL);
    await emailService.sendContactEmails(maliciousPayload);

    const ownerCall = mockSend.mock.calls.find(
      (call) => (call[0] as { to: string[] }).to[0] === TEST_OWNER_EMAIL,
    );
    const subject = (ownerCall?.[0] as { subject: string }).subject;
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain('InjectedBcc: attacker@evil.comName');
  });
});
