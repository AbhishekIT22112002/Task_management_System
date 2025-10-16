const logger = require('../utils/logger')

// Simple request logger middleware. Logs method, url, status, duration and user if present.
module.exports = function requestLogger(req, res, next) {
  const start = process.hrtime()
  const { method, originalUrl } = req
  const ip = req.ip || req.connection?.remoteAddress

  // Log incoming request
  logger.info(`Incoming request: ${method} ${originalUrl}`, { ip })

  // When response finishes, log status and duration
  res.on('finish', () => {
    const [secs, nanos] = process.hrtime(start)
    const ms = (secs * 1e3 + nanos / 1e6).toFixed(2)
    const status = res.statusCode
    const user = req.user ? String(req.user._id || req.user.id) : undefined
    logger.info(`Response: ${method} ${originalUrl} ${status} - ${ms}ms`, { ip, user, status, durationMs: ms })
  })

  next()
}
