const express = require('express');
const router = express.Router();
const cors =require('cors');
const app = express();

app.use(cors());

app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
  })

// GET /api/health
router.get('/health', async (req, res, next) => {
    res.send("the server is up and running!")
});

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

module.exports = router;
