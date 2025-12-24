module.exports = {
  apps: [
    {
      name: 'permit-backend',
      cwd: '/home/user/webapp/backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'permit-frontend',
      cwd: '/home/user/webapp',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
