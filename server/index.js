// Entry point: connect database -> seed demo data (first run only) -> start web server.
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { seedDemoData } from './seed/seedData.js';

async function main() {
  console.log('Starting Smart Quiz...');
  await connectDatabase();
  if (env.seedDemo) await seedDemoData();

  app.listen(env.port, () => {
    console.log(`\n  Smart Quiz is ready ->  http://localhost:${env.port}\n`);
  });
}

async function shutdown() {
  await disconnectDatabase();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((error) => {
  console.error('Could not start:', error.message);
  process.exit(1);
});
