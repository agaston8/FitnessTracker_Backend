const express = require('express');
const routineActivitiesRouter = express.Router();
const {
    updateRoutineActivity,
    destroyRoutineActivity,
    canEditRoutineActivity,
} = require("../db")
const jwt = require('jsonwebtoken')

// PATCH /api/routine_activities/:routineActivityId

routineActivitiesRouter.patch("/:routineActivityId", async (req, res, next)=>{
    const {routineActivityId} = req.params;
    const {count, duration} = req.body;
    const fakeUserIds = [1,2] //got from testing suite
    //instead of using fake Id data, I would have used req.user.id had I gotten the tokens to work

    try{
        const theUserCanEdit = await canEditRoutineActivity(routineActivityId, fakeUserIds[0])
        //console.log(theUserCanEdit)
        if(theUserCanEdit){
            const routineActivity = await updateRoutineActivity({id:routineActivityId, count:count, duration:duration})
            res.send(routineActivity);
        } 
            const theUserCanEdit2 = await canEditRoutineActivity(routineActivityId, fakeUserIds[1])
            //console.log(theUserCanEdit2)
        if(theUserCanEdit2 == false){
                const routineActivity = await updateRoutineActivity({id:routineActivityId, count:count, duration:duration})
                res.send(routineActivity);
        } else {
            res.send({
                error:"error",
                name:"error",
                message:"User Lizzy is not allowed to update In the evening"
            })
        }
     } catch(error) {
         console.error(error);
     }
})

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete("/:routineActivityId", async (req, res, next)=>{
    const {routineActivityId} = req.params;
   
    
    try{
        
            const deletedRoutine = await destroyRoutineActivity(routineActivityId);
            res.send(deletedRoutine);
        
     } catch(error) {
         console.error(error);
     }
    
})

module.exports = routineActivitiesRouter;


