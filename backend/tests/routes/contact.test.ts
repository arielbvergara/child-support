import request from 'supertest';
import { Resend } from 'resend';
import app from '../../src/app';
import { CONTACT_VALIDATION } from '../../src/constants/contact.constants';

jest.mock('resend');
jest.mock('node:crypto', () => {
  const actual = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    ...actual,
    createPrivateKey: jest.fn().mockReturnValue({}),
    createSign: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      sign: jest.fn().mockReturnValue(Buffer.from('mock-signature')),
    }),
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSend = jest.fn();
(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
  () => ({ emails: { send: mockSend } }) as unknown as Resend,
);

const validBody = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+31 20 123 4567',
  service: 'individual',
  message: 'Hello, I would like more information about your services.',
};

function mockSheetsSuccess() {
  mockFetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'mock-token' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
}

describe('POST /contact', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockFetch.mockReset();
    mockSend.mockResolvedValue({ id: 'mock-id' });
    mockSheetsSuccess();
  });

  it('sendContact_ShouldReturn200_WhenAllRequiredFieldsAreValid', async () => {
    const res = await request(app).post('/contact').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('sendContact_ShouldReturn200_WhenPhoneAndServiceAreOmitted', async () => {
    const { phone: _phone, service: _service, ...bodyWithoutOptionals } = validBody;
    const res = await request(app).post('/contact').send(bodyWithoutOptionals);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('sendContact_ShouldReturn422_WhenNameIsMissing', async () => {
    const { name: _name, ...bodyWithoutName } = validBody;
    const res = await request(app).post('/contact').send(bodyWithoutName);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'name' }),
    );
  });

  it('sendContact_ShouldReturn422_WhenEmailIsMissing', async () => {
    const { email: _email, ...bodyWithoutEmail } = validBody;
    const res = await request(app).post('/contact').send(bodyWithoutEmail);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'email' }),
    );
  });

  it('sendContact_ShouldReturn422_WhenEmailIsInvalidFormat', async () => {
    const res = await request(app)
      .post('/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'email' }),
    );
  });

  it('sendContact_ShouldReturn422_WhenMessageIsMissing', async () => {
    const { message: _message, ...bodyWithoutMessage } = validBody;
    const res = await request(app).post('/contact').send(bodyWithoutMessage);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'message' }),
    );
  });

  it('sendContact_ShouldReturn422_WhenNameExceedsMaxLength', async () => {
    const res = await request(app)
      .post('/contact')
      .send({ ...validBody, name: 'A'.repeat(CONTACT_VALIDATION.NAME_MAX_LENGTH + 1) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'name' }),
    );
  });

  it('sendContact_ShouldReturn422_WhenMessageExceedsMaxLength', async () => {
    const res = await request(app)
      .post('/contact')
      .send({ ...validBody, message: 'A'.repeat(CONTACT_VALIDATION.MESSAGE_MAX_LENGTH + 1) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'message' }),
    );
  });

  it('sendContact_ShouldReturn200_WhenEmailFailsButSheetsSucceeds', async () => {
    mockSend.mockRejectedValue(new Error('Resend API error'));
    const res = await request(app).post('/contact').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('sendContact_ShouldReturn200_WhenSheetsFailsButEmailSucceeds', async () => {
    // Override default mockFetch: token exchange succeeds, Sheets append fails
    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'mock-token' }) })
      .mockResolvedValueOnce({ ok: false, text: async () => 'Internal Server Error' });

    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sa@test.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let isolatedApp: any;
    await jest.isolateModulesAsync(async () => {
      const { default: freshApp } = await import('../../src/app');
      isolatedApp = freshApp;
    });

    delete process.env.GOOGLE_SHEETS_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    const res = await request(isolatedApp).post('/contact').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
