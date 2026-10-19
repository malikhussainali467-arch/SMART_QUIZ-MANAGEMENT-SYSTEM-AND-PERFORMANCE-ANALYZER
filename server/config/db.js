// SQL Database connection using Sequelize & SQLite.
// Data is saved in the ./data folder (data/quiz.sqlite) so it survives restarts.
import path from 'node:path';
import fs from 'node:fs';
import { Sequelize } from 'sequelize';
import { env } from './env.js';

const storageDir = path.dirname(env.dbStorage);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.dbStorage,
  logging: false,
});

export async function connectDatabase() {
  await sequelize.authenticate();
  const { initAssociations } = await import('../models/index.js');
  initAssociations();
  await sequelize.sync();
  console.log(`SQL database connected: SQLite (${env.dbStorage})`);
}

export async function disconnectDatabase() {
  await sequelize.close();
}
