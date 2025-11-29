const { Sequelize } = require('sequelize');
const connectionUrl = process.env.DATABASE_URL;

let sequelize;

if (connectionUrl) {
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    },
    logging: false 
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'api_unibalsas',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '', 
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql'
    }
  );
}

module.exports = sequelize;