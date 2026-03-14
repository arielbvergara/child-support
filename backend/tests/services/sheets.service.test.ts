import { createSheetsService } from '../../src/services/sheets.service';
import { SHEETS_RANGE } from '../../src/constants/contact.constants';
import type { ValidatedContactPayload } from '../../src/types/contact.types';

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

const validPayload: ValidatedContactPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+31 20 123 4567',
  service: 'individual',
  message: 'Hello, I would like more information.',
};

function mockSuccessfulFetch() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'mock-access-token' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
}

describe('createSheetsService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('appendContactSubmission_ShouldCallAppendOnce_WhenPayloadIsValid', async () => {
    mockSuccessfulFetch();
    const service = createSheetsService('sa@project.iam.gserviceaccount.com', 'key', 'sheet-id');
    await service.appendContactSubmission(validPayload);

    // fetch called twice: once for token exchange, once for Sheets append
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('appendContactSubmission_ShouldIncludeAllFieldsInRow_WhenPayloadIsValid', async () => {
    mockSuccessfulFetch();
    const service = createSheetsService('sa@project.iam.gserviceaccount.com', 'key', 'sheet-id');
    await service.appendContactSubmission(validPayload);

    const sheetsCall = mockFetch.mock.calls[1];
    const body = JSON.parse(sheetsCall[1].body as string) as { values: string[][] };
    const row = body.values[0];

    expect(row).toContain(validPayload.name);
    expect(row).toContain(validPayload.email);
    expect(row).toContain(validPayload.phone);
    expect(row).toContain(validPayload.service);
    expect(row).toContain(validPayload.message);
  });

  it('appendContactSubmission_ShouldIncludeTimestamp_WhenPayloadIsValid', async () => {
    mockSuccessfulFetch();
    const before = new Date().toISOString();
    const service = createSheetsService('sa@project.iam.gserviceaccount.com', 'key', 'sheet-id');
    await service.appendContactSubmission(validPayload);
    const after = new Date().toISOString();

    const sheetsCall = mockFetch.mock.calls[1];
    const body = JSON.parse(sheetsCall[1].body as string) as { values: string[][] };
    const timestamp = body.values[0][0];

    expect(timestamp >= before).toBe(true);
    expect(timestamp <= after).toBe(true);
  });

  it('appendContactSubmission_ShouldUseCorrectSheetRange_WhenPayloadIsValid', async () => {
    mockSuccessfulFetch();
    const service = createSheetsService('sa@project.iam.gserviceaccount.com', 'key', 'sheet-id');
    await service.appendContactSubmission(validPayload);

    const sheetsCallUrl = mockFetch.mock.calls[1][0] as string;
    expect(sheetsCallUrl).toContain('sheet-id');
    expect(sheetsCallUrl).toContain(encodeURIComponent(SHEETS_RANGE));
  });

  it('appendContactSubmission_ShouldPropagateError_WhenSheetsApiThrows', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock-access-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => 'Internal Server Error',
      });

    const service = createSheetsService('sa@project.iam.gserviceaccount.com', 'key', 'sheet-id');
    await expect(service.appendContactSubmission(validPayload)).rejects.toThrow(
      'Google Sheets API error',
    );
  });
});
