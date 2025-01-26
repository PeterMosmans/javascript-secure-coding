/**
Client-side functions for Secure Coding in JavaScript

PGCM - (c) 2025 - GPLv3

**/

// These variables will be overwritten by the supplied configuration file
let apiUrl = "http://localhost:3000"
let authUrl = "http://localhost:2500"
let userToken = null

const inputId = "input"
const outputId = "output"
const resultId = "result"

// Execute function(s) after page has been loaded
document.addEventListener("DOMContentLoaded", () => {
  loadConfiguration()
  connectEventListeners()
})

// Connect event listeners
function connectEventListeners() {
  const eventMappings = [
    { id: "to-innerhtml", handler: () => setAsInnerHtml() },
    { id: "to-text", handler: () => setAsText() },
    { id: "to-uri", handler: () => escapeURI() },
    { id: "to-sanitized", handler: () => sanitizeInput() },
    {
      id: "to-sanitized-text",
      handler: () => sanitizeInputToText(),
    },
    { id: "validate-email", handler: () => validateEmail() },
    {
      id: "sanitize-text",
      handler: () => sanitizeTextNoMarkup(),
    },
    { id: "login", handler: () => doLogin() },
    {
      id: "authorize",
      handler: () => validatePermissions("resource", "permission"),
    },
  ]

  // Map all elements that are defined in the DOM
  eventMappings.forEach(({ id, handler }) => {
    const element = window.document.getElementById(id)
    if (element) {
      element.addEventListener("click", handler)
    }
  })
}

// Read configuration
async function loadConfiguration() {
  try {
    const response = await fetch("config.json")
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`)
    }
    const config = await response.json()
    apiUrl = config.apiUrl
    authUrl = config.authUrl
    console.log(
      `Using ${apiUrl} as API endpoint, and ${authUrl} as authentication endpoint`,
    )
    checkCookie()
  } catch (error) {
    console.error("Error loading configuration:", error)
  }
}

// Set input value as output innerHTML (unsafe)
function setAsInnerHtml() {
  // Note that script elements inserted using innerHTML do not execute when inserted
  // See https://www.w3.org/TR/2008/WD-html5-20080610/dom.html#innerhtml0
  document.getElementById(outputId).innerHTML =
    document.getElementById(inputId).value
}

// Set input value as output text
function setAsText() {
  document.getElementById(outputId).textContent =
    document.getElementById(inputId).value
}

// Escape URI
function escapeURI() {
  try {
    document.getElementById(outputId).textContent = encodeURI(
      document.getElementById(inputId).value,
    )
  } catch (e) {
    setBooleanText("Invalid URI", false)
  }
}

// Inject sanitized variable into a specified element
function sanitizeInput() {
  const sanitized = DOMPurify.sanitize(document.getElementById(inputId).value)
  document.getElementById(outputId).innerHTML = sanitized
}

// Inject sanitized variable into a specified element
function sanitizeInputToText() {
  const sanitized = DOMPurify.sanitize(document.getElementById(inputId).value, {
    ALLOWED_TAGS: [],
  })
  document.getElementById(outputId).innerHTML = sanitized
}

// Validate whether input adheres to a specific format
function isValidEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return emailRegex.test(value)
}

// Validate email address
function validateEmail() {
  const email = document.getElementById(inputId).value
  if (isValidEmail(email)) {
    setBooleanText(`The address ${email} validates successfully`, true)
  } else {
    setBooleanText("Invalid email address", false)
  }
}

// Set a div to awaiting results
function setWaiting(element) {
  if (window.document.getElementById(element)) {
    window.document.getElementById(element).style.background =
      "var(--inactive-background)"
  }
}

// Set a div to its boolean value and display text
function setBooleanText(text, truthy) {
  if (window.document.getElementById(resultId)) {
    document.getElementById(element).textContent = text
    if (truthy) {
      document.getElementById(element).style.background =
        "var(--true-background)"
      document.getElementById(element).style.color = "var(--true-color)"
    } else {
      document.getElementById(element).style.background =
        "var(--false-background)"
      document.getElementById(element).style.color = "var(--false-color)"
    }
  }
}

// Authentication and authorization functions

// Check if a user is (still / already) logged in
function checkCookie() {
  const regex = `(?:^|; )userToken=([^;]*)`
  const match = document.cookie.match(regex)
  if (match) {
    userToken = decodeURIComponent(match[1])
    console.log(`Read userToken from cookie: ${userToken}`)
  }
}

// Set a cookie
function setCookie(name, value) {
  const date = new Date()
  // Standard lifetime of one hour (similar to JWT token)
  date.setTime(date.getTime() + 60 * 60 * 1000)
  // When setting SameSite to None, cookie will be sent in all requests (!)
  const sameSite = "None"
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; SameSite=${sameSite}; secure;`
}

// Delete a cookie
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=-99999999; SameSite=Strict`
}

// Try to log in using an authentication server
async function doLogin() {
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  try {
    setWaiting(resultId)
    deleteCookie("userToken")
    userToken = ""
    const response = await fetch(`${authUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (response.ok) {
      userToken = data.token
      setCookie("userToken", userToken)
      setBooleanText(resultId, "Login successful", true)
    } else {
      setBooleanText(resultId, "Incorrect username and/or password", false)
    }
  } catch (error) {
    console.error("Login failed:", error)
    setBooleanText(resultId, "Failed logging in", false)
  }
}

// Validate wwhether the (holder of the) token has specific permissions (to a resource)
async function validatePermissions(idResource, idPermission) {
  const action = document.getElementById(idPermission).value
  try {
    setWaiting(resultId)
    const response = await fetch(`${apiUrl}/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: userToken, action }),
    })
    const data = await response.json()
    if (data.isAllowed) {
      setBooleanText(resultId, "Permission granted", true)
    } else {
      setBooleanText(resultId, "Sorry, no permission to do that", false)
    }
  } catch (error) {
    console.error("Authorization failed:", error)
    setBooleanText(resultId, "Failed checking permission", false)
  }
}
