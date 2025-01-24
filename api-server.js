import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import Cerbos from "@cerbos/http"
import jwt from "jsonwebtoken"
import https from "https"
import {
  apiPort,
  apiUrl,
  httpsOptions,
  jwtSecret,
  webUrl,
  cerbosUrl,
} from "./settings.js"
// For demonstration purposes, use a fixed resource identifier
const resourceId = "31337"

const app = express()

// Hardening: Remove vanity header for all requests
app.use((req, res, next) => {
  res.removeHeader("x-powered-by")
  next()
})

// Only allow a predefined origin
let corsOptions = { origin: webUrl }
app.use(cors(corsOptions))
app.use(bodyParser.json())

// Initialize Cerbos client
const cerbos = new Cerbos.HTTP(cerbosUrl)

// Handle authorization
app.post("/authorize", async (req, res) => {
  const { token, action } = req.body
  if (token && action) {
    try {
      // First, authenticate
      const decoded = jwt.verify(token, jwtSecret)
      console.log(
        `Token validated for ${decoded.username}, having role ${decoded.role}`,
      )
      // Then, authorize
      const decision = await cerbos.checkResource({
        principal: {
          id: decoded.username,
          roles: [decoded.role],
        },
        resource: {
          kind: "assets",
          id: resourceId,
        },
        actions: [action],
      })
      res.json({ isAllowed: decision.isAllowed(action) })
    } catch (error) {
      console.error("Authorization error:", error)
      res.status(401).json({ error: "Authorization failed" })
    }
  } else {
    res.status(401).json({ error: "Authorization failed" })
  }
})

// Gracefully deal with standard GET requests
app.get("/", (req, res) => {
  res.send("API server up and running")
})

function ensureEnvVars(...vars) {
  vars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`${key} is not set in the environment variables`)
      process.exit(1)
    }
  })
}

// Start the server
const server = https.createServer(httpsOptions, app).listen(apiPort, () => {
  console.log(`API server running at https://${apiUrl}`)
  console.log(`Using ${cerbosUrl} as authorization back-end`)
})
