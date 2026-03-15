import 'dotenv/config';
// Must be imported before any other modules so Sentry can instrument them.
import '../src/instrument';
import app from '../src/app';

export default app;
