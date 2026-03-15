const mockInit = jest.fn();

jest.mock('@sentry/node', () => ({
  init: mockInit,
  setupExpressErrorHandler: jest.fn(),
}));

describe('instrument', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    mockInit.mockClear();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('SentryInit_ShouldCallInitWithDsnFromEnvironment_WhenModuleIsLoaded', async () => {
    process.env.SENTRY_DSN = 'https://test-dsn@sentry.io/123';
    await import('../src/instrument');
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://test-dsn@sentry.io/123' }),
    );
  });

  it('SentryInit_ShouldDisablePii_WhenModuleIsLoaded', async () => {
    process.env.SENTRY_DSN = 'https://test-dsn@sentry.io/123';
    await import('../src/instrument');
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ sendDefaultPii: false }),
    );
  });

  it('SentryInit_ShouldSetEnvironmentFromNodeEnv_WhenNodeEnvIsSet', async () => {
    process.env.SENTRY_DSN = 'https://test-dsn@sentry.io/123';
    process.env.NODE_ENV = 'production';
    await import('../src/instrument');
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'production' }),
    );
  });

  it('SentryInit_ShouldFallBackToDevelopmentEnvironment_WhenNodeEnvIsUnset', async () => {
    process.env.SENTRY_DSN = 'https://test-dsn@sentry.io/123';
    delete process.env.NODE_ENV;
    await import('../src/instrument');
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'development' }),
    );
  });

  it('SentryInit_ShouldNotCallInit_WhenDsnIsAbsent', async () => {
    delete process.env.SENTRY_DSN;
    await import('../src/instrument');
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('SentryInit_ShouldNotCallInit_WhenDsnIsEmptyString', async () => {
    process.env.SENTRY_DSN = '';
    await import('../src/instrument');
    expect(mockInit).not.toHaveBeenCalled();
  });
});
