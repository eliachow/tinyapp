const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

function getUserByEmail(regEmail) {
  let findUser = null;
  for (const user in users) {
    if (users[user].email === regEmail) {
      console.log("user: ", user);
      findUser = user;
    }
  }
  return findUser;
}

app.post("/urls/register", (req, res) => {
  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Status Code: 400 - Email/password cannot be blank");
  }

  if (getUserByEmail(req.body.email) !== null) {
    res.status(400).send("Status Code: 400 - User already exists");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("user_id", newUserID);
    res.redirect(`/urls`);
  }
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders table from urls_index template on /urls
app.get("/urls", (req, res) => {
  const userID = users[req.cookies['user_id']];
  console.log("userID: ", userID);
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
    //userID output: { id: 'ti2ylu', email: 'test@example.com', password: 'newapssword' }
    user: userID,
  };
  res.render("urls_index", templateVars);
});

//render urls_new template
app.get("/urls/new", (req, res) => {
  const userID = users[req.cookies['user_id']];
  const templateVars = {
    username: req.cookies["username"],
    user: userID,
  };
  res.render("urls_new", templateVars);
});

//render urls_register template
app.get("/urls/register", (req, res) => {
  const userID = users[req.cookies['user_id']];
  const templateVars = {
    username: req.cookies["username"],
    user: userID,
  };
  res.render("urls_register", templateVars);
});

//creates random shortURL ID for input long URL
//redirects to new shortURL ID edi page
app.post("/urls", (req, res) => {
  const newURLID = generateRandomString();
  urlDatabase[newURLID] = req.body.longURL;
  res.redirect(`/urls/${newURLID}`);
});

app.get("/login", (req, res) => {
  const userID = users[req.cookies['user_id']];
  const templateVars = {
    username: req.cookies["username"],
    user: userID,
  };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

//redirects to the shortURL ID's longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//renders shortURL ID edit page
app.get("/urls/:id", (req, res) => {
  const userID = users[req.cookies['user_id']];
  const shortURL = req.params.id;
  const templateVars = {
    id: shortURL, longURL: urlDatabase[shortURL],
    username: req.cookies["username"],
    user: userID,
  };
  res.render("urls_show", templateVars);
});

//updates longURL with edited input url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//when the delete button is submitted the URL is deleted
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect("/urls");
});

// //renders hello on root page
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// //renders Hello World on hello page
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b><body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

