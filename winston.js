const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
const LOG_PATH='/var/opt/tkd_json/'
const myFormat = printf(info => {
  return `${info.timestamp}[${info.level}] ${info.message}`
})

var logger=createLogger({
	format: combine(
    timestamp(),
    format.splat(),
    myFormat
	),
	transports: [
    new transports.File({
      level: 'debug', filename: `${LOG_PATH}logs/tkdjson.log`, handleExceptions: true, json: true, maxsize: 242880, colorize: false
    }),
    new transports.File({
      level: 'error', filename: `${LOG_PATH}logs/err_tkdjson.log`, handleExceptions: true, json: true, maxsize: 542880, colorize: false
    })
  ],
  exitOnError: false
})
logger.info('Log started', process.env)

module.exports=logger