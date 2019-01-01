import { RouterRouted } from '../utils/router';

export function middlewareTest(routed: RouterRouted) {
  return new Promise<RouterRouted>(r => {
    setTimeout(() => {
      routed.bot.DEBUG_MSG_COMMAND.log('middlewareTest!')
      r(routed)
    }, 1000)
  })
}
