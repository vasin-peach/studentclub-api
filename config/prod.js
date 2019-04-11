// Production Config
module.exports = {
  SECRET: process.env.SECRET,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASS: process.env.MONGO_PASS,
  MONGO_DB: process.env.MONGO_DB,
  PORT: process.env.PORT || 3000
};