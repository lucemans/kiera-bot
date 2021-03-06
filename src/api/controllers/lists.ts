import * as Validation from '@/api/validations'
import * as errors from 'restify-errors'
import { validate } from '@/api/utils/validate'
import { WebRouted, WebRoute } from '@/api/web-router'

export const Routes: Array<WebRoute> = [
  // * Lists **/
  {
    controller: get,
    method: 'post',
    name: 'lists-get',
    path: '/api/lists'
  }
]

export async function get(routed: WebRouted) {
  const v = await validate(Validation.Lists.get(), routed.req.body)
  const payload = {
    users: [],
    servers: []
  }

  // this.DEBUG_WEBAPI('req params', v.o)

  if (v.valid) {
    var users = await routed.Bot.DB.getMultiple(
      'users',
      {
        username: { $regex: new RegExp(`^${v.o.input}`), $options: 'i' }
      },
      { username: 1, discriminator: 1 }
    )
    var servers = await routed.Bot.DB.getMultiple(
      'servers',
      {
        name: { $regex: new RegExp(`^${v.o.input}`), $options: 'i' }
      },
      { name: 1, region: 1, ownerID: 1 }
    )

    payload.servers = servers
    payload.users = users

    return routed.res.send(payload)
  }

  // On error
  return routed.next(new errors.BadRequestError())
}
