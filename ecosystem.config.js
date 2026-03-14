module.exports = {
  apps: [{
    name: 'mission-control',
    cwd: '/home/sudhirk/.openclaw/workspace/mission-control',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/home/sudhirk/.openclaw/workspace/mission-control/pm2-error.log',
    out_file: '/home/sudhirk/.openclaw/workspace/mission-control/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
