module.exports = {
  apps: [
    {
      name: 'telegram-coding-agent',
      script: 'index.js',
      cwd: __dirname,
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
