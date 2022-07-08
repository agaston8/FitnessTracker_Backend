const express = require('express');
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const {
    getPublicRoutinesByUser, 
    getUserByUsername,
    getUserById,
    createUser,
} = require('../db');
//const jwt = require('jsonwebtoken');


// POST /api/users/register
userRouter.post('/register', async (req, res, next) => {
    const {username, password} = req.body;

    try{
        const user = await getUserByUsername(username);

        if (user) {
            res.send({
                error: "ERROR",
                name: "userExistsError",
                message: `User ${user.username} is already taken.`
            })
        } else if (password.length < 8) {
            res.send({
                error: "ERROR",
                name: "Error with password length",
                message: "Password Too Short!"
            })
        } else {

       

        const newUser = await createUser({username, password});
       // console.log("THE NEW USER", newUser)
        const token = 'xyztoken'
        // const token = jwt.sign({ 
        //     id: newUser.id, 
        //     username
        //   }, process.env.JWT_SECRET, {
        //     expiresIn: '1w'
        //   });
         // console.log("LOOK HERE", token)

        res.send({
            message:"thank you for signing up",
            token: token,
            user: newUser
        })
    }

    } catch({ error, message, name }) {
       res.send({ error, message, name });
    }
    
})


// POST /api/users/login
userRouter.post('/login', async (req, res, next) => {
    const {username, password} = req.body;

    if (!username || !password) {
        next({
            error: `ERROR`,
            message: "Please supply both username and password",
            name:"Missing Credentials Error"
        });
        
    } 

    try {
        const user = await getUserByUsername(username);
        // console.log("THE USER!", user);
        // console.log(password)
        // console.log(user.password)
        const hashedPassword = user.password;
       const passwordsMatch = await bcrypt.compare(password, hashedPassword);
       //console.log("match!", passwordsMatch)
        if (!user && !passwordsMatch) {
            next({ 
                error: `ERROR`,
                message: 'Username or password is incorrect',
                name: 'IncorrectCredentialsError'
              });
        } else {
            // const token = jwt.sign({
            //     id: user.id,
            //     username
            // }, process.env.JWT_SECRET, {
            //     expiresIn: '1w'
            // });
        //console.log("here")
        const token = 'xyztoken'
            // const {token} = jwt.sign({ 
            //   id: user.id, 
            //   username
            // }, process.env.JWT_SECRET,);
           // console.log("here2")
            delete user.password;
            // console.log("TOKENN", token)
            // console.log ("AYE", token, user)
            res.send({ 
              message: "you're logged in!",
              token: token,
              user: user
            });
        }
    } catch({ error, message, name }) {
       res.send({ error, message, name });
    }

})


// GET /api/users/me
userRouter.get('/me', async (req, res, next) => {
    
       
})

// GET /api/users/:username/routines
//needs token
userRouter.get('/:username/routines', async (req, res, next) => {
    const {username} = req.params;
    //console.log("HEY", username)
    try{
        const routines = await getPublicRoutinesByUser(username)
        //console.log("LOOK HERE", routines)
        res.send(routines)

    } catch(error) {
        console.error(error);
    }

})

module.exports = userRouter;
