require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db/storage');

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';
const hash = bcrypt.hashSync(password, 10);

db.upsertAdmin(username, hash);
console.log(`Admin "${username}" creado correctamente.`);
process.exit(0);
