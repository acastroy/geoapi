import http from 'http'
import express from 'express'
import bunyan from 'bunyan'
import geoip from 'geoip-lite'
import config from './config'

const log         = bunyan.createLogger(config.logger.options)
const app         = express()
const httpServer  = http.Server(app)

app.disable('x-powered-by')

export default function WebServer(portToListenOn=config.server.port) {
  return [
    httpServer,
    function startServer() {
      try {
        app.get('/:ip', function ipRoute(req, res) {
          res.json(geoip.lookup(req.params.ip))
        })

        // Express error handling
        app.use(function ExpressErrorHandler(err, req, res, next) {
          log.error('Express error handling', err)
          res.redirect(err.redirectRoute || '/')
        })

        httpServer.listen(portToListenOn, () => log.info(`listening on *: ${portToListenOn}`))

      } catch(err) {
        log.error("Error starting server", err)
        process.exit()
      } finally {

        //handle if the process suddenly stops
        process.on('SIGINT', () => { console.log('got SIGINT....'); process.exit() })
        process.on('SIGTERM', () => { console.log('got SIGTERM....'); process.exit() })

        return app
      }
    }
  ]
}
