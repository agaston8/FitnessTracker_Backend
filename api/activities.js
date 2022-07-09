const express = require('express');
const activitiesRouter = express.Router();
const{ getAllActivities,
    createActivity,
    updateActivity,
    getPublicRoutinesByActivity,
    getActivityByName,
    getActivityById
} = require("../db");
const jwt = require('jsonwebtoken')

// GET /api/activities
activitiesRouter.get("/", async (req, res, next) => {
    try {
        const activities = await getAllActivities();
        
        res.send(activities);
    } catch (error) {
        next(error);
    }
})


// GET /api/activities/:activityId/routines
activitiesRouter.get("/:activityId/routines", async (req, res, next)=>{
    const {activityId} = req.params;
    //console.log("ID", activityId)
    
    try{
        const routines = await getPublicRoutinesByActivity({id: activityId});
        if(!routines) {
            res.send({
                name:"error",
                message: `Activity ${activityId} not found`,
                error:"error"
            })
        }
        //console.log("API SIDE RETURNING", routines)
        
        res.send(routines)
    
    } catch({name, message, error}) {
        //console.error(error);
        res.send({name,message, error});
    }
})



// POST /api/activities

activitiesRouter.post('/', async (req, res, next) => {
    // const {name, description} = req.body
    // const fields ={
    //     name:name,
    //     description:description
    // }
    try {
        const activity = await createActivity(req.body);
        
        if (activity.name === "error") {
            res.send({
                message: `An activity with name ${req.body.name} already exists`,
                name: "error",
                error: "error"
            });
        } else {
            res.send(activity);
        }
    } catch (error) {
        next(error)
    }

    // try{
    //     const existingActivity = await getActivityByName(name);
    //     if (existingActivity) {
    //         res.send({error: "Error",
    //            message: `An activity with name ${name} already exists`,
    //             name:"Error name",});
    //     } else {
    //         const newActivity = await createActivity(name, description);
    //         res.send(newActivity);
    //     }
    // } catch(error) {
    //     next(error)
    // }
   
})

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', async (req, res, next)=>{
    const {activityId} = req.params;
    const {name, description} = req.body;
    const fields ={};
    if (name) {
        fields.name=name;
    }
    if (description) {
        fields.description=description;
    }
    //figure out where to get fields
    //errors

    try{
        const existingActivity = await getActivityById(activityId);
        const activityWithName = await getActivityByName(name);
        if(!existingActivity){
            res.send({
                name:"Error",
                message:`Activity ${activityId} not found`,
                error:"Error"
            })
        } else if (activityWithName) {
            res.send({
                name:"Error",
                message:`An activity with name ${name} already exists`,
                error:"Error"
            })
        } else {
            const updatedActivity = await updateActivity({id: activityId, name:name, description:description});
            res.send(updatedActivity);
            
        }
    } catch(error){
        console.error(error)
    }
    

})

module.exports = activitiesRouter;
