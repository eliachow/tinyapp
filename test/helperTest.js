const { assert } = require('chai');

const { getUserByEmail, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if user does not exist', function() {
    const user = getUserByEmail("nouser@email.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

});

describe('generateRandomString', function() {
  it('should return the string length of 6', function() {
    const string = generateRandomString();
    const expectedLength = string.length;
    assert.equal(expectedLength, 6);
  });

});