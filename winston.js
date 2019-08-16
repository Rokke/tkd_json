var winston = require('winston')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
const LOG_PATH='/var/opt/tkd_json/'
const myFormat = printf(info => {
  return `${info.timestamp}[${info.level}] ${info.message}`
})
require('winston-daily-rotate-file');

var logger=createLogger({
	format: combine(
    timestamp(),
    format.splat(),
    myFormat
	),
	transports: [
		new (winston.transports.DailyRotateFile)({
			filename: `${LOG_PATH}logs/tkdjson_%DATE%.log`,
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '2m',
			maxFiles: '14d'
		}),
    new transports.File({
      level: 'error', filename: `${LOG_PATH}logs/err_tkdjson.log`, handleExceptions: true, json: true, maxsize: 542880, colorize: false
    })
  ],
  exitOnError: false
})
logger.info('Log started', process.env)

module.exports=logger