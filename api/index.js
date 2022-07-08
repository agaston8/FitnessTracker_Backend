const express = require('express');
const router = express.Router();
const cors =require('cors');
const app = express();


require('dotenv').config();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const {getUserById} = require("../db")


app.use(cors());

// app.listen(80, function () {
//     console.log('CORS-enabled web server listening on port 80')
//   })

// GET /api/health
router.get('/health', async (req, res) => {
    res.send({message: "the server is up and running!"})
});


// router.use(async (req, res, next) => {
//   const prefix = 'Bearer ';
//   const auth = req.header('Authorization');

//   if (!auth) {
//     // nothing to see here
//     next();
//   } else if (auth.startsWith(prefix)) {
//     const token = auth.slice(prefix.length);

//     try {
//       const { id } = jwt.verify(token, JWT_SECRET);

//       if (id) {
//         req.user = await getUserById(id);
//         next();
//       } else {
//         next({
//           name: 'AuthorizationHeaderError',
//           message: 'Authorization token malformed',
//         });
//       }
//     } catch ({ name, message }) {
//       next({ name, message });
//     }
//   } else {
//     next({
//       name: 'AuthorizationHeaderError',
//       message: `Authorization token must start with ${prefix}`,
//     });
//   }
// });

// router.use((req, res, next) => {
//   if (req.user) {
//     console.log('User is set:', req.user);
//   }
//   next();
// });

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

router.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message
  });
});

app.use((req, res, next) => {
  res.status(404).send({error: 'Error 404: Page not found'}); // Create custom 404 handler that sets the status code to 404.
});

module.exports = router;
