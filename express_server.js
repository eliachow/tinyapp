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


//renders hello on root page
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// //renders Hello World on hello page
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b><body></html>\n");
// });

//renders table from urls_index template on /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//render urls_new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//render urls_register template
app.get("/urls/register", (req, res) => {
  res.render("urls_register");
});

//creates random shortURL ID for input long URL
//redirects to new shortURL ID edi page
app.post("/urls", (req, res) => {
  const newURLID = generateRandomString();
  urlDatabase[newURLID] = req.body.longURL;
  res.redirect(`/urls/${newURLID}`);
});

//redirects to the shortURL ID's longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//renders shortURL ID edit page
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

//ocurring from URL edit && URL ID
app.post("/urls/:id", (req, res) => {
  console.log("👉👉👉", req.body);
  const shortURL = req.params.id;
  // const longURL =
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//when the delete button is submitted the URL is deleted
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

