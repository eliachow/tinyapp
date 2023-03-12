const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; //default port 8080


//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("abc", 10),
  },
};

//returns 6 digit alphanumeric string
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

//returns user object of email agrument
function getUserByEmail(regEmail) {
  let findUser = null;
  for (const user in users) {
    if (users[user].email === regEmail) {
      return users[user];
    }
  }
  return findUser;
}

//return an object of the user's URLs
function urlsForUser(id) {
  let userURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = {
        longURL: urlDatabase[urlID].longURL,
        userID: urlDatabase[urlID].userID,
      };
    }
  }
  return userURLs;
}

//create user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  //check if fields are empty
  if (!email || !hashedPassword) {
    res.status(400).send("Status Code: 400 - Email/password cannot be blank");
  }

  //check if user exists before creating user
  if (getUserByEmail(email) !== null) {
    res.status(400).send("Status Code: 400 - User already exists");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: hashedPassword,
    };
  
    req.session.user_id = newUserID;
    res.redirect(`/urls`);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders table of URLs for specific user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    urls: urlsForUser(userID),
    user,
  };

  if (!user) {
    //Return error message if not logged in
    res.send("Please login to view URLs");
  }
  console.log("🎈user: ", user);
  res.render("urls_index", templateVars);
});

//render urls_new template
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user,
  };

  //if user is not logged in redirect to GET/login
  if (!user) {
    res.redirect("/login");
  }

  //if logged in render create URL page
  res.render("urls_new", templateVars);
});

//render urls_register template
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});


app.post("/urls", (req, res) => {
  //if not logged in, send message
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("You must be logged in to create a URL");
  }

  //creates random shortURL ID for input long URL
  const newURLID = generateRandomString();
  urlDatabase[newURLID] = {
    longURL: req.body.longURL,
    userID: userID,
  };

  //redirects to new shortURL ID edit page
  res.redirect(`/urls/${newURLID}`);
});

//render login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user,
  };
  
  //check if user exists, rediret to /urls
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

//redirects to the shortURL ID's longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  //check that URL ID is in the database and redirect to the long URL
  if (urlDatabase[shortURL]) {
    return res.redirect(longURL);
  }
  //if URL is not in the database, send message + 404 status code
  res.send("URL does not exist");
});

//renders shortURL ID edit page if user is logged in
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];

  //check if user is logged on
  if (!user) {
    return res.status(401).send("Please login to view edit page");
  }

  //check if shortURL exists
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Page not found");
  }

  //check if the shortURL userID matches the logged in userID
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not authorized to access this page");
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user,
  };

  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  
  //check if user is logged on
  if (!userID) {
    return res.status(401).send("Please login edit long URLs");
  }

  //check if the shortURL userID matches the logged in userID
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not authorized to access the edit page");
  }

  //check if shortURL exists
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Page not found");
  }

  //updates longURL with edited input url and redirect to URL index page
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
  
});

//when the delete button is submitted the URL is deleted
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  
  //check if user is logged on
  if (!userID) {
    return res.status(401).send("Please login to delete URLs");
  }

  //check if shortURL userID matches the logged in userID
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not authorized to access the delete page");
  }

  //check if shortURL exists
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Page not found");
  }


  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(userEmail);

  //check if user exists
  if (!user) {
    res.status(403).send("Status Code: 403 - Email cannot be found");
  }

  //verify password
  if (!bcrypt.compareSync(userPassword, user.password)) {
    res.status(403).send("Incorrect password");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

