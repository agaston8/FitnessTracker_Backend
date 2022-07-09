const express = require('express');
const userRouter = express.Router();
const {
    getPublicRoutinesByUser, 
    getUserByUsername,
    getUserById,
    createUser,
    getUser
} = require('../db');
const jwt = require('../node_modules/jsonwebtoken');
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
        
        if (!user) {
            next({ 
                error: `ERROR`,
                message: 'Username or password is incorrect',
                name: 'IncorrectCredentialsError'
              });
        } else {
            
            const token = jwt.sign({username: user.username, id: user.id}, secret);
            
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


userRouter.post('/register', async (req, res) => {
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
userRouter.get('/me', async (req, res) => {
    
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
  
    try {
        if (!auth) {
            res.status(401).send({
                message:"You must be logged in to perform this action",
                name:"error",
                error:"error"
            })
        } else if (auth.startsWith(prefix)) {
            const token = auth.slice(prefix.length);
            const { id } = jwt.verify(token, process.env.JWT_SECRET);
          
           req.user = await getUserById(id);

           res.send(req.user)
        } 
    } catch (error) {
        console.error(error)
    }

});

// GET /api/users/:username/routines
userRouter.get('/:username/routines', async (req, res, next) => {
    const {username}= req.params
    try {
        const routines = await getPublicRoutinesByUser({username: username});
        res.send(routines);
    } catch (error) {
        next(error)
    }
});

module.exports = userRouter;
