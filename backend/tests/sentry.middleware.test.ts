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
  beforeEach(() => {
    jest.resetModules();
    mockSetupExpressErrorHandler.mockClear();
  });

  it('SetupExpressErrorHandler_ShouldBeRegistered_WhenModuleIsLoaded', async () => {
    // Importing the module triggers the default export (createApp()), which
    // must register Sentry's error handler exactly once.
    await import('../src/app');
    expect(mockSetupExpressErrorHandler).toHaveBeenCalledTimes(1);
  });

  it('SetupExpressErrorHandler_ShouldReceiveTheExpressApp_WhenModuleIsLoaded', async () => {
    const { default: app } = await import('../src/app');
    expect(mockSetupExpressErrorHandler).toHaveBeenCalledWith(app);
  });

  it('UnhandledError_ShouldReturn500WithGenericMessage_WhenRouteThrows', async () => {
    const { createApp } = await import('../src/app');
    // Register the test route via the configureRoutes callback so it is
    // positioned *before* Sentry's error handler and the generic error handler
    // in the middleware stack — ensuring the full error pipeline is exercised.
    const app = createApp((a) => {
      a.get('/test-error', () => {
        throw new Error('boom');
      });
    });
    const res = await request(app).get('/test-error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});
