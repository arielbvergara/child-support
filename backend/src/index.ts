import 'dotenv/config';
// Must be imported before any other modules so Sentry can instrument them.
import './instrument';
import app from './app';

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
