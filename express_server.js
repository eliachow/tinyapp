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
    password: "abc",
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

function getUserByEmail(regEmail) {
  let findUser = null;
  for (const user in users) {
    if (users[user].email === regEmail) {
      return users[user];
    }
  }
  return findUser;
}

app.post("/urls/register", (req, res) => {
  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Status Code: 400 - Email/password cannot be blank");
  }

  if (getUserByEmail(email) !== null) {
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
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user,
  };

  //if user is not logged in redirect to GET/login
  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_index", templateVars);
});

//render urls_new template
app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    user,
  };

  //if user is not logged in redirect to GET/login
  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//render urls_register template
app.get("/urls/register", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});


app.post("/urls", (req, res) => {
  //if not logged in, send message
  const userID = req.cookies['user_id'];
  if (!userID) {
    return res.send("You must be logged in to create a URL");
  }

  //creates random shortURL ID for input long URL
  //redirects to new shortURL ID edit page
  const newURLID = generateRandomString();
  urlDatabase[newURLID] = req.body.longURL;
  res.redirect(`/urls/${newURLID}`);
});

//render login page
app.get("/login", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

//redirects to the shortURL ID's longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  //check that URL ID is in the database and redirect to the long URL
  if (urlDatabase[shortURL]) {
    res.redirect(longURL);
  }
  //if URL is not in the database, send message
  res.send("URL does not exist");
});

//renders shortURL ID edit page
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL],
    user,
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  //updates longURL with edited input url
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
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(userEmail);

  if (!user) {
    res.status(403).send("Status Code: 403 - Email cannot be found");
  }

  if (user.password !== userPassword) {
    res.status(403).send("Status Code: 403 - Incorrect password");
  }
 
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

