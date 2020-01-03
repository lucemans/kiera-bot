import { Task } from '@/objects/task'
import { Collections } from '@/db'
import { TrackedBotSetting } from '@/objects/setting'

export type ChastiKeyAPIFetchAndStoreMethod = 'fetchAPIUserDataCache' | 'fetchAPIRunningLocksDataCache'
export type ChastiKeyAPIFetchAndStoreArray = 'locks' | 'users'

export class ChastiKeyAPIFetchAndStore extends Task {
  public reload: boolean = true
  public previousRefresh: number = 0
  public dbCollection: Collections
  public method: ChastiKeyAPIFetchAndStoreMethod
  public respArray: ChastiKeyAPIFetchAndStoreArray

  run = this.fetch
  isAsync = true

  // Methods for this task
  protected async fetch() {
    // If this is the first run, fetch the interval from the db -or- store it if the first time ever
    if (this.reload) {
      var dbFrequency = await this.Bot.DB.get<TrackedBotSetting>('settings', { key: `bot.task.chastikey.api.frequency.${this.name}` })
      if (dbFrequency) this.frequency = dbFrequency.value
      else
        dbFrequency = new TrackedBotSetting({
          added: Date.now(),
          author: 'kiera-bot',
          env: '*',
          key: `bot.task.chastikey.api.frequency.${this.name}`,
          value: this.frequency,
          updated: Date.now()
        })

      await this.Bot.DB.update<TrackedBotSetting>('settings', { key: `bot.task.chastikey.api.frequency.${this.name}` }, dbFrequency, { upsert: true })

      this.reload = false
    }

    if (Date.now() - this.previousRefresh < this.frequency) return true // Block as its too soon
    try {
      // Check in DB when last interval was
      var dbLastRunSetting = await this.Bot.DB.get<TrackedBotSetting>('settings', { key: `bot.task.chastikey.api.fetch.${this.name}` })
      // If not set or delta is too large continue as normal, else stop from running again too soon like after a bot reboot
      if (dbLastRunSetting) {
        dbLastRunSetting = new TrackedBotSetting(dbLastRunSetting)
        // Update task's last run timestamp
        this.previousRefresh = dbLastRunSetting.value || 0
        if (Date.now() - this.previousRefresh < this.frequency) return // Stop here
      } else {
        dbLastRunSetting = new TrackedBotSetting({
          added: Date.now(),
          author: 'kiera-bot',
          env: '*',
          key: `bot.task.chastikey.api.fetch.${this.name}`
        })
      }

      console.log(`### Task:Fetching => ${this.name}`)
      const resp = await this.Bot.Service.ChastiKey[this.method]()

      // Only if resp contains data delete and attempt to save the new cache
      if (resp.response.status === 200 && resp[this.respArray].length > 0) {
        await this.storeInDB(resp[this.respArray])
        await this.Bot.DB.update<TrackedBotSetting>('settings', { key: `bot.task.chastikey.api.fetch.${this.name}` }, dbLastRunSetting.update({ value: Date.now(), updated: Date.now() }), {
          upsert: true
        })
      }

      this.previousRefresh = Date.now()

      return true
    } catch (error) {
      console.log(`### Task:Error refreshing ${this.name}`, error)
      // Set the last refresh for now to prevent repeated requests to the server
      this.previousRefresh = Date.now()
      return false
    }
  }

  private async storeInDB(data: any) {
    try {
      console.log(`Task:${this.name} => Store in DB`)
      // Remove all old entires with non matching timestamps
      await this.Bot.DB.remove(this.dbCollection, {}, { deleteOne: false })
      // Update collection of Running Locks
      await this.Bot.DB.addMany(this.dbCollection, data, {})
    } catch (error) {
      console.log('### Task:DB store issue', error)
    }
  }
}
