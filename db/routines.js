const client = require('./client');

async function getRoutineById(id){
  try {
    const {rows:[routine]} = await client.query(`
            SELECT *
            FROM routines
            WHERE id=${id};
         `)
    //console.log("this is an id matched routine,", routine)
    return routine
  } catch(error) {
    console.error('error getting routine by id')
    throw error
  }
}

async function getRoutinesWithoutActivities(){
    try{
         const {rows:routines} = await client.query(`
            SELECT *
            FROM routines;
         `)

         //console.log("These are the routines", routines);
         return routines

    } catch(error){
      console.error("Error getting routines without activities");
      throw error
    }
}

async function getAllRoutines() {
  try {
    const {rows:routinesWithUser} = await client.query(`
        SELECT routines.id, "creatorId", "isPublic", name, goal, username AS "creatorName"
        FROM routines
        LEFT JOIN users
        ON routines."creatorId" = users.id;
        `)
   

    routinesWithUser.map ((routine) => {
      routine.activities = [] 
    });


    const {rows:routineActivities} = await client.query(`
        SELECT routine_activities.id AS "routineActivityId", activities.id, "routineId", "activityId", duration, count, name, description
        FROM routine_activities
        INNER JOIN activities
        ON routine_activities."activityId" = activities.id;
    `)

     routinesWithUser.map ((routine1)=> {
         routineActivities.map((routine2)=> {
            if (routine2.routineId === routine1.id) {
                    let activityArray = routine1.activities;
                    activityArray.push(routine2);
            } 

       })
     })

    //console.log("allRoutines", routinesWithUser)
    return routinesWithUser


  } catch(error) {
    console.error('Error getting all routines')
    throw error
  }
}

async function getAllRoutinesByUser({username}) {
  try{
    const allRoutines = await getAllRoutines();
    const userRoutines = allRoutines.filter ((routine)=>{
      if(username === routine.creatorName){
        return true
      }
    })
    //console.log("USER ROUTE", userRoutines)
    return userRoutines

  } catch(error) {
    console.error("error getting routines by username");
    throw error
  }


}

async function getPublicRoutinesByUser({username}) {
  try{
    const userRoutines = await getAllRoutinesByUser({username});
    const publicUserRoutines = userRoutines.filter ((routine)=>{
        if (routine.isPublic) {
          return true
        }
    });
    console.log("PUBLIC USER ROUTE", publicUserRoutines)
    return publicUserRoutines

  } catch(error) {
    console.error("Error getting public routiens by user");
    throw error
  }
}

async function getAllPublicRoutines() {
  try{
    const allRoutines = await getAllRoutines();
    const allPublicRoutines = allRoutines.filter ((routine)=>{
      if(routine.isPublic){
        return true
      }
    })
    //console.log("allPublicRoutines", allPublicRoutines)
    return allPublicRoutines

  } catch(error) {
    console.error("error gettging all public routines");
    throw error
  }
  

}

async function getPublicRoutinesByActivity({id}) {
    try{
        const allPublicRoutines = await getAllPublicRoutines();
        const publicRoutinesByActivity = [];
        allPublicRoutines.map((routine) => {
          if (routine.activities.length > -1) {
            let activities = routine.activities
            activities.map((activity)=>{
              console.log(activity);
              if (activity.id === id) {
                publicRoutinesByActivity.push(routine);
              }
            })
          }
        })

        console.log("PUBLIC ROUTINES BY ACTIVITY", publicRoutinesByActivity)
       return publicRoutinesByActivity

    } catch(error) {
      console.error("Error getting public routines by activity");
      throw error
    }

}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try {
    const {rows:[routine]} = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    //console.log("This is a created routine:", routine);
    return routine;


  } catch(error) {
    console.error("Error creating routines")
    throw error;
  }

}

async function updateRoutine({id, ...fields}) {
  console.log("FIELDS", fields)
  const {isPublic, name, goal} = fields

  const fieldValues = [];

  if ('isPublic' in fields) {
    fieldValues.push(`"isPublic"=${isPublic}`)
  } 
  if('name' in fields) {
    fieldValues.push(`name='${name}'`)
  }
  if ('goal' in fields){
    fieldValues.push(`goal='${goal}'`)
  }

  const insertedValues = fieldValues.join(', ');
  console.log(insertedValues)

    try {
      const {rows: [routine]} = await client.query(`
          UPDATE routines
          SET ${insertedValues}
          WHERE id = ${id}
          RETURNING *;
      `)

      return routine;
    } catch (error) {
      console.error(error);
    }
}

async function destroyRoutine(id) {
  console.log(id);
  try{
    await client.query(`
        DELETE FROM routine_activities
        WHERE "routineId" = ${id};

        DELETE FROM routines
        WHERE id = ${id};
    `);

  }catch(error){
    console.error("Error deleting routine");
    throw error
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}