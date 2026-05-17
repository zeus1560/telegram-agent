const config = require('config');
const app = require('./app');

const handleListening = () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Server listenting on http://localhost:${config.PORT} 🚀`);
};

app.listen(config.PORT, handleListening);
