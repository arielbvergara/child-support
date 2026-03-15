import request from 'supertest';

const mockSetupExpressErrorHandler = jest.fn((app) => {
  // Simulate what Sentry's error handler middleware does: pass errors through.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: Error, _req: any, _res: any, next: any) => next(err));
});

jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  setupExpressErrorHandler: mockSetupExpressErrorHandler,
}));

describe('Sentry Express integration', () => {
  it('SetupExpressErrorHandler_ShouldBeRegistered_WhenAppIsCreated', async () => {
    await import('../src/app');
    expect(mockSetupExpressErrorHandler).toHaveBeenCalledTimes(1);
  });

  it('SetupExpressErrorHandler_ShouldReceiveTheExpressApp_WhenAppIsCreated', async () => {
    const { default: app } = await import('../src/app');
    expect(mockSetupExpressErrorHandler).toHaveBeenCalledWith(app);
  });

  it('UnhandledError_ShouldReturn500_WhenRouteThrows', async () => {
    const { default: app } = await import('../src/app');
    // Inject a route that throws synchronously to exercise the error pipeline.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).get('/test-error', () => {
      throw new Error('boom');
    });
    const res = await request(app).get('/test-error');
    expect(res.status).toBe(500);
  });

  beforeEach(() => {
    jest.resetModules();
    mockSetupExpressErrorHandler.mockClear();
  });
});
