//returns user object of email agrument
function getUserByEmail(email, database) {
  let findUser = null;
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return findUser;
}

//returns 6 digit alphanumeric string
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}


module.exports = {
  getUserByEmail,
  generateRandomString,
};