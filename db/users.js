
const client = require("./client");
const bcrypt = require('../node_modules/bcrypt');
const SALT = 10;

// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword=await bcrypt.hash(password, SALT);
  
    try {
      const {rows:[user]} = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *
      `, [username, hashedPassword])

      delete user.password;

      //console.log ("This is the created user", user)
      return user;

    } catch (error) {
      console.error("Error creating user")
       throw error;
    }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    //console.log(user)
    if (!user) {
      return;
    }
    const hashedPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return;
    }
    delete user.password;
    //console.log(user)
    return user;
    } catch (error) {
    console.error(error);
  }

}

async function getUserById(userId) {
  try{
    const {rows:[user]} = await client.query(`
        SELECT *
        FROM users
        WHERE id=${userId};
    `)

    delete user.password;

    //console.log(user)
    return user


  }catch(error){
    console.error("Error getting user by Id");
    throw error
  }


}

async function getUserByUsername(userName) {
  try {
    const {rows: [user]} = await client.query(`
        SELECT *
        FROM users
        WHERE username = ($1);
        `, [userName]);
    return user;
  } catch (error) {
    console.error(error);
  }

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
