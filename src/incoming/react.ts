import { performance } from "perf_hooks";
import { Bot } from "..";
import { Message, Channel } from "discord.js";
import { TrackedMessage } from "../objects/message";
import { validateArgs, verifyUserRefType, buildUserChatAt } from "../utils";

export async function setReactTime(bot: Bot, msg: Message, args: Array<string>) {
  const v = validateArgs(args, [
    { name: 'command', type: 'string' },
    { name: 'user', type: 'user' },
    { name: 'action', type: 'string' },
    { name: 'time', type: 'number' },
  ])

  if (!v.valid) {
    bot.DEBUG_MSG_COMMAND(`!react ${v.o.user} time ${v.o.time} -> validation check 'failed'`)
    await msg.reply(`:warning: Command error, must be formatted like: \`!react @user#0000 time 10\``)
    return;
  }

  const userArgType = verifyUserRefType(v.o.user)

  await msg.reply(`:white_check_mark: Setting react time for ${buildUserChatAt(v.o.user, userArgType)} to: \`${v.o.time}\` minutes`)
  bot.DEBUG_MSG_COMMAND(`!react ${buildUserChatAt(v.o.user, userArgType)} time ${v.o.time}`)
}