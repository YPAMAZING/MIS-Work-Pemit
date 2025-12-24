module.exports = {
  apps: [
    {
      name: 'permit-backend',
      cwd: './backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        DATABASE_URL: 'file:./prisma/dev.db',
        JWT_SECRET: 'dev-secret-key-change-in-production',
        JWT_EXPIRES_IN: '24h',
        FRONTEND_URL: 'http://localhost:3000'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'permit-frontend',
      cwd: './frontend',
      script: 'npx',
      args: 'vite preview --host 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
