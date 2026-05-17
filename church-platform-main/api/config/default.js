module.exports = {
  sequelize: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: 'platform_db',
    host: process.env.DB_URL || '127.0.0.1',
    dialect: 'mysql',
    port: '3306',
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci'
      }
    },
    logging: false
  },
  uploader: {
    useS3: false
  },
  cookie: {
    secret: 'topsecret',
    maxAge: 43200000 // 12 hours in milliseconds
  },
  JWT: {
    JWT_SECRET: 'your-secret-key'
  },
  fileInfo: {
    destination: './uploads/'
  },
  PORT: process.env.PORT || 4100
};
