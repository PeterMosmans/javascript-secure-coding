import fs from "fs"

// Ensure that settingss are defined as environment variable
function ensureEnvVars(...vars) {
  vars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`${key} is not set as environment variable`)
      process.exit(1)
    }
  })
}

// Read the certificate and key for this (...) server
// Usually each server has its own certificate  / key pair
export const httpsOptions = {
  key: fs.readFileSync("./localhost.key"),
  cert: fs.readFileSync("./localhost.crt"),
}

// Check that variables are defined as environment variables
ensureEnvVars(
  "API_HOST",
  "API_PORT",
  "ATTACKER_HOST",
  "ATTACKER_PORT",
  "AUTH_HOST",
  "AUTH_PORT",
  "CERBOS_HOST",
  "CERBOS_PORT",
  "JWT_SECRET",
  "WEB_HOST",
  "WEB_PORT",
)
export const apiHost = process.env.API_HOST
export const apiPort = process.env.API_PORT
export const apiUrl = `https://${apiHost}:${apiPort}`
export const attackerHost = process.env.ATTACKER_HOST
export const attackerPort = process.env.ATTACKER_PORT
export const attackerUrl = `http://${attackerHost}:${attackerPort}`
export const authHost = process.env.AUTH_HOST
export const authPort = process.env.AUTH_PORT
export const authUrl = `https://${authHost}:${authPort}`
export const cookieDomain = process.env.AUTH_HOST
export const jwtSecret = process.env.JWT_SECRET
export const webHost = process.env.WEB_HOST
export const webPort = process.env.WEB_PORT
export const webUrl = `https://${webHost}:${webPort}`
export const cerbosUrl = `http://${process.env.CERBOS_HOST}:${process.env.CERBOS_PORT}`
