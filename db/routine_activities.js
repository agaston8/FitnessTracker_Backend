const client = require('./client');
const { getRoutineById } = require('./routines');

async function getRoutineActivityById(id){
  //console.log(id)
  try {
    const {rows: [routine]} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id = ${id};
    `);

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try{
    const {rows: [routineWithNewActivity]} = await client.query(`
        INSERT INTO routine_activities ("routineId", "activityId", count, duration)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `, [routineId, activityId, count, duration]);

    //console.log("Added a new activity to the routine", routineWithNewActivity)
    return routineWithNewActivity;

  }catch(error){
    console.error("Error adding activities to routines");
    throw error;
  }
  
}

async function getRoutineActivitiesByRoutine({id}) {
  //console.log(id)
  try {
    const {rows: routine} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=${id};
    `);
    //console.log("getRoutineActivitiesByRoutine", routine)
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity ({id, ...fields}) {
  //console.log("fields", fields)

  try {
    const {rows: [routine]} = await client.query(`
      UPDATE routine_activities
      SET count=${fields.count}, duration=${fields.duration}
      WHERE id=${id}
      RETURNING *;
    ` );

    //console.log("updated RoutineActivity", routine)
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {rows: [routine]} = await client.query(`
      DELETE FROM routine_activities
      WHERE id = ${id}
      RETURNING *;
    `);
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {

    const routineActivity = await getRoutineActivityById(routineActivityId) 
    const routine = await getRoutineById(routineActivity.routineId)

    if (routine.creatorId === userId) {
      return true
      } else {
      return false
      }

 }

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
