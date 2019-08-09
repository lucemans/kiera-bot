export const adminRefreshStats = `Manual stats refresh triggered..`

// Error
export const usernameNotSet = `You'll need to tell the bot your username in order to use the \`{{prefix}}ticker\`, Set your username (found in the ChastiKey app) using \`{{prefix}}ck username "YourUsernameHere"\``

// Ticker
export const invalidOverrideType = `Invalid override type, please use: (1) Keyholder, (2) Lockee, (3) Both`
export const incorrectTickerTimer = `*Does something look incorrect? Please contact **Kevin** the developer of ChastiKey if any numbers appear incorrect*`


// Lookup notification
export const lockeeCommandNotification = `\`{{user}}\` has just looked up your **lockee** stats in \`{{channel}}\` on the \`{{server}}\` server`
export const keyholderCommandNotification = `\`{{user}}\` has just looked up your **keyholder** stats in \`{{channel}}\` on the \`{{server}}\` server.`

// Stats
export const lockeeOrKeyholderRequired = `You'll need to supply a type with that command such as \`{{prefix}}ck stats lockee\` \`{{prefix}}ck stats keyholder\``
export const keyholderNoLocks = `The requested user seems to not have any active locks or past lockees, there will be no stats to display`
export const userRequestedNoStats = `This user has requested their stats remain private`

// Verify
export const verifyNotSuccessfulUsingReason = `{{reason}}`
export const verifyDMInstructions = `Scan this code with the ChastiKey App like loading a lock (within the next 5 minutes), this will verify your Discord Account to ChastiKey.`
export const verifyCkeckYourDMs = `Check your DMs from Kiera for further instructions.`