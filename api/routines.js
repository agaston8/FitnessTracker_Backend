const express = require('express');
const routinesRouter = express.Router();

const {
  getAllRoutines,
  createRoutine,
  destroyRoutine,
  updateRoutine,
  getRoutineById
  } = require("../db");

// GET /api/routines
routinesRouter.get('/', async (req, res, next)=>{

    try{
        const routines = await getAllRoutines();
       // console.log(routines)
         res.send(routines);

    } catch(error) {
        console.error(error)
    }

})

// POST /api/routines
routinesRouter.post('/', async (req, res, next)=>{
//    // creatorId, isPublic, name, goal
//    const { creatorId, isPublic, name, goal} = req.body;
//   // console.log(creatorId, isPublic, "n", name, "g", goal)
//    try{
//         const newRoutine = await createRoutine(creatorId, isPublic, name, goal);
//         res.send(newRoutine);
//    } catch(error) {
//        console.error(error)
//    }

    
})
// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', async (req, res, next)=>{
    const {routineId} = req.params;
    const {isPublic, name, goal} = req.body;
    
    try{
        const updatedRoutine = await updateRoutine({id:routineId, isPublic: isPublic, name:name, goal:goal});
       // console.log(updatedRoutine)

        res.send(updatedRoutine) 


    } catch(error){
        console.error(error)
    }
  
    
})

// DELETE /api/routines/:routineId

routinesRouter.delete('/:routineId', async (req, res, next)=>{
    const {routineId} = req.params;
    try{
        // if (routine.creatorId === req.user.id) {
            //const notdeletedR = await getRoutineById(routineId);
            //console.log("not deleted yet", notdeletedR)
            const deletedRoutine = await destroyRoutine(routineId);
            const deletedR = await getRoutineById(routineId)

           //console.log("deleted", deletedR)
            //console.log(deletedRoutine)
            res.send(deletedRoutine);
        // } else {
        //     next({
        //         //throw a 403 error here
        //         name:"ERROR",
        //         message:"",
        //         error:"ERROR"
        //     })
        // }
    } catch(error){
        console.error(error)
    }
   
    
})

// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', async (req, res, next)=>{
       const {routineId} = req.params;
        //need to write attach ativity to routine
    
})

module.exports = routinesRouter;
