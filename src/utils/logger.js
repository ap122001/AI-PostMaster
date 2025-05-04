const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(), // 👈 Add this to handle metadata
    format.colorize(),
    format.printf(({ timestamp, level, message, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length) {
        msg += ' | ' + JSON.stringify(metadata);
      }
      return msg;
    })
  ),
  transports: [new transports.Console()],
});

module.exports = logger;