import express, { type Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import { createContactRouter } from './routes/contact';
import { CONTACT_ROUTE_PATH } from './constants/contact.constants';

const app: Application = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json());
app.use('/health', healthRouter);
app.use(CONTACT_ROUTE_PATH, createContactRouter());

export default app;
