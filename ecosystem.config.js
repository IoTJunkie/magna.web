module.exports = {
  apps: [
    {
      name: 'magna-web',
      script: 'yarn',
      args: 'start',
      env: {
        PORT: process.env.PORT || 5000,
      },
    },
  ],
};
