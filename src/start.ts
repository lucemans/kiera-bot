require('dotenv').config()
require('module-alias/register')
import { Bot } from '@/index'

// Start bot (may be moved elsewhere later)
const bot = new Bot()
bot.start()
