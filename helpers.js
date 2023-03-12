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


module.exports = { getUserByEmail };