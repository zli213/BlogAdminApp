const bcrypt = require('bcrypt');
const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');
const { use } = require('passport');

async function getUser(username) {
  const db = await dbPromise;
  return await db.get(SQL`SELECT * FROM users WHERE username = ${username}`);
}

async function createUser(user) {
  const db = await dbPromise;

  // Generate a salt for password hashing
  const salt = await bcrypt.genSalt(10);

  // Hash the user's password using the generated salt
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const result = await db.run(SQL`
    INSERT INTO users (username, fname, lname, password, birthdate, avatar_src, description)
    VALUES (${user.username}, ${user.fname}, ${user.lname}, ${hashedPassword}, ${user.dob}, ${user.avatarSrc}, ${user.description})
    `);

  return result.lastID;
}

async function getAllUsernames() {
  try {
    const db = await dbPromise;
    return await db.all(SQL`SELECT username FROM users`);
  } catch (error) {
    console.error('getAllUsernames', error);
  }
}

async function getAllUsers() {
  try {
    const db = await dbPromise;
    return await db.all(SQL`SELECT u.*, COUNT(a.id) AS article_count
        FROM users u
        LEFT JOIN articles a ON u.id = a.author
        GROUP BY u.id`);
  } catch (error) {
    console.error('getAllUsers', error);
  }
}

//edit user information
async function editUserAccount(userInput, userCurr) {
  try {
    const db = await dbPromise;

    if (userInput.password) {
      const salt = await bcrypt.genSalt(10);
      userInput.hashedPassword = await bcrypt.hash(userInput.password, salt);
    } else {
      userInput.hashedPassword = userCurr.password;
    }
    if (!userInput.avatarSrc) {
      userInput.avatarSrc = userCurr.avatar_src;
    }

    const query = SQL`
        UPDATE users
        SET username = ${userInput.username}, 
        fname = ${userInput.fname}, 
        lname = ${userInput.lname}, 
        password = ${userInput.hashedPassword}, 
        birthdate = ${userInput.dob}, 
        avatar_src = ${userInput.avatarSrc}, 
        description = ${userInput.description}
        WHERE id = ${userCurr.id}
        RETURNING *
    `;

    const update = await db.run(query);
    const updatedUser = await getUser(userInput.username);

    return updatedUser;
  } catch (error) {
    console.error('editUserAccount', error);
  }
}

async function deleteUserAccount(userId) {
  try {
    const db = await dbPromise;

    const result = await db.run(SQL`DELETE FROM users WHERE id = ${userId};`);
    if (result.changes > 0) {
      return true;
    } else {
      console.error(`Failed to delete user: ${userId} for unknown reason`)
      return false
    }
  } catch (error) {
    console.error('deleteUserAccount', error);
    return false;
  }
}

module.exports = {
  getUser,
  createUser,
  getAllUsers,
  getAllUsernames,
  editUserAccount,
  deleteUserAccount,
};
