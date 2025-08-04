require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME || 'testdb',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  }
);
const models = require('./models')(sequelize);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to sync database:', err);
    process.exit(1);
  }
})();            