/**
Simple web server to practice secure coding in JavaScript

PGCM - (c) 2025 - GPLv3
**/

import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
// Note that this library is unsupported (!)
import csrf from "csurf"
import https from "https"
// Use validator.js middleware for validation
import { body, validationResult } from "express-validator"
import {
  attackerUrl,
  authUrl,
  authzUrl,
  httpsOptions,
  jwtSecret,
  webHost,
  webPort,
} from "./settings.js"

// To keep the demo simple we use some HTML "constants"
import { HEADER, SELECT, INPUT, LOGIN, PERMISSIONS, FORM } from "./constants.js"

// Step 2 - Replace console logging with better logging
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

// Hardening: Remove vanity header for all requests
app.use((req, res, next) => {
  res.removeHeader("x-powered-by")
  next()
})

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Serve a "dynamic" configuration file
app.get("/config.json", (req, res) => {
  res.json({ authzUrl: authzUrl, authUrl: authUrl })
})

// Debug function to display cookie values (if any)
app.use((req, res, next) => {
  if (req.cookies) {
    if (req.cookies["userToken"]) {
      logger.info({ url: req.originalUrl }, "Received userToken cookie")
    }
    if (req.cookies["_csrf"]) {
      logger.info({ url: req.originalUrl }, "Received CSRF cookie")
    }
  }
  next()
})

// CSRF middleware which uses the cookie store
const csrfProtection = csrf({ cookie: true })

// Step 1 - Improve CSRF settings
// const csrfProtection = csrf({
//   cookie: {
//     // sameSite: "strict",
//     // httpOnly: true,
//     secure: true,
//   },
// })

// Helper function to render HTML responses
const renderResponse = (left, right, result = "", resultClass = "") =>
  `${HEADER}
      <div class="column">
        ${left}
      </div>
      <div class="column">${right}</div>
    </div>
    <div id="output" class="output inactive"></div>
    <div id="result" class="output ${resultClass}">${result}</div>
    <div id="footer">PGCM - Built with JavaScript / Node.js / Express</div>
  </body>
</html>`

// Test page to ensure certificates are trusted
app.get("/test", (req, res) => {
  res.send(
    renderResponse(
      `<a href='/'>Go to input page</a>
       <a href='authentication'>Go to authentication page</a>
       <a href='authorization'>Go to authorization page</a>`,
      `<a href="${authUrl}" target="_blank">browse to authentication URL</a>
       <a href="${authzUrl}" target="_blank">browse to authorization URL</a>
       <a href="${attackerUrl}" target="_blank">browse to attacker URL</a>`,
    ),
  )
})

// Input - output demo
app.get("/", (req, res) => {
  res.send(renderResponse(SELECT, INPUT))
})

// Input - output demo with a simple Content Security Policy
app.get("/csp", (req, res) => {
  res.set("Content-Security-Policy", "script-src 'self'")
  res.send(renderResponse(SELECT, INPUT))
})

// Input - output demo with a slightly more advanced Content Security Policy
app.get("/frame", (req, res) => {
  res.set("Content-Security-Policy", "script-src 'self'; frame-src 'none'")
  res.send(renderResponse(SELECT, INPUT))
})

// Authentication - authorization demo
app.get("/authentication", csrfProtection, (req, res) => {
  res.send(renderResponse(PERMISSIONS, LOGIN))
})

// Load protected and unprotected form
app.get(
  ["/authorization", "/authorization-protected"],
  csrfProtection,
  (req, res) => {
    res.send(
      renderResponse(
        FORM,
        `    <form method="POST" action="authorization-protected">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="action" value="that">
      <button type="submit">Perform protected action</button>
    </form>`,
      ),
    )
  },
)

// Perform a specific action as authenticated user
app.post("/authorization", (req, res) => {
  const { action } = req.body
  if (req.cookies["userToken"]) {
    const token = req.cookies.userToken
    try {
      console.log(`Received action ${action} and token ${token}`)
      const decoded = jwt.verify(token, jwtSecret)
      console.log(
        `Token validated for ${decoded.username}, having role ${decoded.role}`,
      )
      return res.send(
        renderResponse(
          FORM,
          `<a href='authorization'>Go to authorization page (load CSRF token)</a>`,
          `User ${decoded.username} has performed "${action}"`,
          "true",
        ),
      )
    } catch (err) {}
  }
  return res
    .status(401)
    .send(
      renderResponse(
        FORM,
        `<a href='authorization'>Go to authorization page (load CSRF token)</a>`,
        `Did not receive a valid token to perform "${action}"`,
        "false",
      ),
    )
})

// Perform a protected action as authenticated user
app.post(
  "/authorization-protected",
  [
    body("action")
      .isAlphanumeric("en-US")
      .withMessage("Action failed validation"),
  ],
  csrfProtection,
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors)
      return res.status(400).send(
        renderResponse(
          FORM,
          `    <form method="POST" action="authorization-protected">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="action" value="that">
      <button type="submit">Perform protected action</button>
    </form>`,
          errors.array()[0].msg,
          "false",
        ),
      )
    }
    // Read form parameters from the request body
    const { action } = req.body
    if (req.cookies["userToken"]) {
      const token = req.cookies.userToken
      try {
        console.log(`Received form data ${action} and token ${token}`)
        const decoded = jwt.verify(token, jwtSecret)
        console.log(
          `Token validated for ${decoded.username}, having role ${decoded.role}`,
        )
        res.send(
          renderResponse(
            FORM,
            `    <form method="POST" action="authorization-protected">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="action" value="that">
      <button type="submit">Perform protected action</button>
    </form>`,
            `User ${decoded.username} has performed "${action}"`,
            "true",
          ),
        )
      } catch (err) {
        return res.status(401).send(
          renderResponse(
            FORM,
            `    <form method="POST" action="authorization-protected">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="action" value="that">
      <button type="submit">Perform protected action</button>
    </form>`,
            `Invalid token`,
            "false",
          ),
        )
      }
    } else {
      res.status(401).send(
        renderResponse(
          FORM,
          `    <form method="POST" action="action-protected">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="action" value="that">
      <button type="submit">Perform protected action</button>
    </form>`,
          `Did not receive a token to perform "${action}"`,
          "false",
        ),
      )
    }
  },
)

// Generic error handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.log("Received a request without valid CSRF token")
    res
      .status(403)
      .send(
        renderResponse(
          FORM,
          `<a href='authorization'>Go to authorization page (load CSRF token)</a>`,
          "No cheating (CSRF check failed)",
          "false",
        ),
      )
  } else {
    console.error(err)
    res
      .status(500)
      .send(
        renderResponse(
          "<a href='authentication'>Go to authentication page</a>",
          `<a href='authorization'>Go to authorization page (load CSRF token)</a>`,
          "Something went wrong",
          "false",
        ),
      )
  }
})

const server = https.createServer(httpsOptions, app).listen(webPort, () => {
  console.log(`Web server running at https://${webHost}:${webPort}/`)
})
