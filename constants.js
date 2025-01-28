// To keep the demo simple we hard-code our own HTML,
// instead of using a template engine
export const HEADER = `<!DOCTYPE html>
<!--
Demo page for Secure Coding in JavaScript

PGCM - (c) 2025 - GPLv3

-->
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Coding in JavaScript - Demo</title>
    <script src="demo.js"></script>
    <script src="dist/purify.js"></script>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div class="container">`

export const SELECT = `<button id="to-innerhtml">set input as innerHTML</button>
        <button id="to-text">set input as text</button>
        <button id="to-uri">escape input as URI</button>
        <button id="to-sanitized">sanitize input</button>
        <button id="to-sanitized-text">sanitize as plaintext</button>
        <button id="validate-email">Validate as email address</button>
        <a href='authentication'>Go to authentication page</a>
        <a href='authorization'>Go to authorization page</a>`

export const INPUT = `<textarea id="input" class="multiline" wrap="soft"></textarea>`

export const LOGIN = `<input type="text" id="username" placeholder="username" required>
      <input type="password" id="password" placeholder="password" required>`

export const PERMISSIONS = `<button id="login">Login (reset session)</button>
     <a href="/">Go to input page</a>
     <a href='authorization'>Go to authorization page</a>`

export const FORM = `<form method="POST" action="authorization">
          <input type="text" name="action" value="do this">
          <button type="submit">Perform action</button>
        </form>
        <select id="permission">
          <option value="create">create access</option>
          <option value="read">read access</option>
          <option value="delete">delete access</option>
          <option value="superpower">superpower access</option>
        </select>
        <button id="authorize">Validate access permissions</button>
        <a href='authentication'>Go to authentication page</a>
        <a href='/'>Go to input page</a>`
