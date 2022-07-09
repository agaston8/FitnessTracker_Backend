const express = require('express');
const routinesRouter = express.Router();

const {
  getAllRoutines,
  createRoutine,
  destroyRoutine,
  updateRoutine,
  getRoutineById,
  addActivityToRoutine
  } = require("../db");
  const jwt = require('jsonwebtoken');

// GET /api/routines
routinesRouter.get('/', async (req, res, next)=>{
    try{
        const routines = await getAllRoutines();
         res.send(routines);
    } catch(error) {
        console.error(error)
    }
})

// POST /api/routines
routinesRouter.post('/', async (req, res, next) => {
    const {name, goal, isPublic} =req.body
    try {
        const token = (req.headers.authorization && (req.headers.authorization).slice(7, (req.headers.authorization).length));
        const loggedInUser = jwt.verify(token, process.env.JWT_SECRET)
        if (loggedInUser) {
            const newRoutine = await createRoutine({creatorId: loggedInUser.id, isPublic: isPublic, name: name, goal: goal})
            res.send(newRoutine)
         } 
    } catch (error) {
        res.send({
            error: "error",
            message: "You must be logged in to perform this action",
            name: "name"
        });
    }
});
    

// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', async (req, res, next)=>{
    
try {
    const token = (req.headers.authorization && (req.headers.authorization).slice(7, (req.headers.authorization).length));
    const loggedInUser = jwt.verify(token, process.env.JWT_SECRET);

    if (loggedInUser.id) {
        const {routineId} = req.params;
        const {isPublic, name, goal} = req.body
        const routine = await getRoutineById(routineId)
        
        if (routine.creatorId === loggedInUser.id) {
            try {
                const updatedRoutine = await updateRoutine({id: routineId, isPublic: isPublic,name: name, goal: goal})
                res.send(updatedRoutine)
            } catch (error) {
                next(error)
            }
        } else {
            res.status = 403
            res.body = {
                error: "error",
                message: `User ${loggedInUser.username} is not allowed to update ${routine.name}`,
                name: "name"
            }
            res.send(res.status, res.body);
        }
    } 
} catch (error) {
    res.send({
        error: "error",
        message: "You must be logged in to perform this action",
        name: "name",
    });
}
});

// DELETE /api/routines/:routineId

routinesRouter.delete('/:routineId', async (req, res, next)=>{
    const {routineId} = req.params;
    try{
        const prefix = 'Bearer ';
        const auth = req.header('Authorization');
        const token = auth.slice(prefix.length);
        const loggedInUser = jwt.verify(token, process.env.JWT_SECRET);
        const routine = await getRoutineById(routineId);
        //console.log(routine)
          try{  
            if (loggedInUser.id === routine.creatorId) {
                res.send(routine)
                //const deletedRoutine = 
                await destroyRoutine(routineId);
                //console.log("THIS SOULD BE DELETED", deletedRoutine)
                //res.send(deletedRoutine)
            } else {
                res.status(403).send({
                    error: "error",
                    message: `User ${loggedInUser.username} is not allowed to delete On even days`,
                    name: "error",
                }) 
            }
          } catch(error){
              console.error(error)
          }
       
         
    } catch(error){
        console.error(error)
    }
})

// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', async (req, res, next)=>{
    const {routineId, activityId, count, duration} =req.body
    try {
        const updatedRoutine = await addActivityToRoutine({routineId:routineId, activityId:activityId, count:count, duration:duration});
        res.send(updatedRoutine)
    } catch (error) {
        res.send({
            error: "error",
            message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
            name: "name"
        });
    }
})

module.exports = routinesRouter;
