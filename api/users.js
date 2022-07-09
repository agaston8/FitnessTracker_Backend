const express = require('express');
const userRouter = express.Router();
const {
    getPublicRoutinesByUser, 
    getUserByUsername,
    getUserById,
    createUser,
    getUser
} = require('../db');
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET;


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
        const user = await getUser(req.body);
        // console.log("THE USER!", user);
        if (!user) {
            next({ 
                error: `ERROR`,
                message: 'Username or password is incorrect',
                name: 'IncorrectCredentialsError'
              });
        } else {
            console.log("!!!", user)
            const token = jwt.sign({username: user.username, id: user.id}, secret);
            console.log("!TOKEN", token)
            console.log(user)
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
      
        const token = 'xyzFakeToken'
        res.send({
            message:"Thank you for signing up!",
            token: token,
            user: newUser
        })
    }

    } catch({ error, message, name }) {
       res.send({ error, message, name });
    }
    
})


// GET /api/users/me
userRouter.get('/me', async (req, res, next) => {
   

});

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
