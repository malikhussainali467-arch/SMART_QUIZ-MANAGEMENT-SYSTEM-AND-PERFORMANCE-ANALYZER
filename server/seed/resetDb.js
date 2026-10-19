// "npm run reset-db": wipes the SQL database and loads the demo data again.
import { sequelize, connectDatabase, disconnectDatabase } from '../config/db.js';
import { seedDemoData } from './seedData.js';

await connectDatabase();
await sequelize.sync({ force: true });
await seedDemoData();
await disconnectDatabase();
console.log('Database reset.');
process.exit(0);
