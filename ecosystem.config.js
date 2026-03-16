module.exports = {
  apps: [
    {
      name: "ff",
      script: "yarn",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      autorestart: true,
      max_memory_restart: "2G",
      exp_backoff_restart_delay: 100
    }
  ]
};