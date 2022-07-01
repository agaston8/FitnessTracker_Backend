const res = require("express/lib/response");
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
    try {
      const {rows:[user]} = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *
      `, [username, password])

      delete user.password;

      //console.log ("This is the created user", user)
      return user;

    } catch (error) {
      console.error("Error creating user")
       throw error;
    }
}

async function getUser({ username, password }) {
  try{
    const user = await getUserByUsername(username);
    
    delete user.password;

    //console.log("Getting the user", user)
    return user

  } catch(error) {
    console.error("Error getting User");
    throw error
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

    //console.log("this is a user got from userID-password", user)
    return user


  }catch(error){
    console.error("Error getting user by Id");
    throw error
  }


}

async function getUserByUsername(userName) {

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
