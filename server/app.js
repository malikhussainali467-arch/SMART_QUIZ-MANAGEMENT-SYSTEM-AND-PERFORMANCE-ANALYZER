// Express application: API + the built React site.
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);
app.use('/api', notFound);

// Serve the React build (client/dist). Any other URL returns index.html so React Router works.
const clientDist = path.resolve('client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running. Build the client with: npm run client:build'));
}

app.use(errorHandler);
export default app;
