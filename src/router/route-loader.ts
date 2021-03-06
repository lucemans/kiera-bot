import * as Path from 'path'
import * as glob from 'fast-glob'
import { Logging } from '@/utils'
import { RouteConfiguration } from '@/router'

export function routeLoader(DEBUG: Logging.Debug) {
  DEBUG.log('loading command routes...')

  // Load routes from commands folder
  const _routeFiles = glob.sync(['app/commands/**/*.js', '!app/commands/index.js', '!app/commands/admin.js'], { deep: 5 })

  // Collection of routes
  var routes: Array<RouteConfiguration> = []

  // Load each route configured into the routes array
  _routeFiles.forEach((routeFile) => {
    // Wrapped in a try to make more safe when loading and errors are present
    try {
      const _requiredFile: { Routes: Array<RouteConfiguration> } = require(Path.join('../../', routeFile.toString()))
      // Test if file returns undefined
      if (_requiredFile !== undefined) {
        // console.log(`routeLoader() => ${routeFile.toString()}, ${_requiredFile.Routes.map(r => Array.isArray(r)).length}`)

        for (let index = 0; index < _requiredFile.Routes.length; index++) {
          const route = _requiredFile.Routes[index]
          routes.push(route)
        }
      }
    } catch (e) {
      console.log(`routeLoader() [ERROR] => ${routeFile.toString()}, ${e.message}`)
    }
  })

  // console.log(`routeLoader() => routes loaded: ${routes.length}`)

  return routes
}
