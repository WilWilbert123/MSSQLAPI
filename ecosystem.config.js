module.exports = {
  apps: [
    {
      name: "Node-API",
      script: "index.js",
      node_args: "--no-warnings",
      autorestart: true,
      watch: false
    },
    {
      name: "Localtunnel",
      script: "start_tunnel.js",
      autorestart: true,
      watch: false
    }
  ]
};
