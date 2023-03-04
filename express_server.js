const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.post("/urls", (req, res) => {
  const newURLID = generateRandomString();
  urlDatabase[newURLID] = req.body.longURL;
  res.redirect(`/urls/${newURLID}`);
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

