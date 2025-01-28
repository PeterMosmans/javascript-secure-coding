/**
Simple authentication server to practice secure coding in JavaScript

PGCM - (c) 2025 - GPLv3
**/
import express from "express"
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"
import cors from "cors"
import argon2 from "argon2"
import https from "https"

import {
  authHost,
  authPort,
  httpsOptions,
  jwtSecret,
  webUrl,
} from "./settings.js"
// To keep the demo simple we use a hard-coded user database
import { USERS } from "./users.js"

// Step 6 - Replace console logging with better logging
import pino from "pino"
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  colorize: true,
  level: process.env.LOG_LEVEL || "info",
  redact: { paths: ["password"] },
})

const app = express()

// Step 1 - Adding CORS headers
// app.use(cors())

// Step 2 - Adding origin-specific CORS headers
app.use(cors({ origin: webUrl }))

// Step 3: Hardening: Remove vanity header for all requests
app.use((req, res, next) => {
  res.removeHeader("x-powered-by")
  next()
})

app.use(bodyParser.json())

// Handle authentication
// Step 5 - Add rate limiter
import rateLimit from "express-rate-limit"
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per window
  handler: function (req, res) {
    // Step 6 - Replace console logging with better logging
    logger.info({ ip: req.ip }, "Getting hammered")
    return res
      .status(429)
      .json({ error: "Too many attempts. Please try again later." })
  },
})

app.post("/login", loginLimiter, async (req, res) => {
  // app.post("/login", async (req, res) => {
  const { username, password } = req.body
  const user = USERS[username]
  // console.log(`Received login attempt for ${username}`)
  // Step 6 - Replace console logging with better logging
  logger.info(
    { ip: req.ip, username: username, password: password },
    "Received login attempt",
  )
  if (user && password) {
    try {
      // Generate a JWT when login is successful
      if (await argon2.verify(user.passwordHash, password)) {
        const token = jwt.sign({ username, role: user.role }, jwtSecret, {
          expiresIn: "1h",
        })
        console.log(`User ${username} successfully logged in as ${user.role}`)
        return res.status(200).json({ token })
      }
    } catch (err) {
      console.log(`Couldn't validate user account ${username}: ${err}`)
      return res.status(401).json({ error: "Invalid username and/or password" })
    }
  }
  return res.status(401).json({ error: "Invalid username and/or password" })
})

// Gracefully deal with standard GET requests
app.get("/", (req, res) => {
  res.send("Authentication server up and running")
})

// Start the server
const server = https.createServer(httpsOptions, app).listen(authPort, () => {
  console.log(
    `Authentication server running at https://${authHost}:${authPort}`,
  )
})
