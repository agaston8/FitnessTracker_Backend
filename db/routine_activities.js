const client = require('./client')

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

    console.log("Added a new activity to the routine", routineWithNewActivity)
    return routineWithNewActivity;

  }catch(error){
    console.error("Error adding activities to routines");
    throw error;
  }
  
}

async function getRoutineActivitiesByRoutine({id}) {
  console.log(id)
  try {
    const {rows: [routine]} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=${id};
    `);
    console.log("getRoutineActivitiesByRoutine", routine)
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity ({id, ...fields}) {
  console.log("fields", fields)
  //count and duration
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
  console.log("AY ",id)
  try {
    await client.query(`
        DELETE FROM routine_activities
        WHERE id=${id};
    `);

  } catch (error) {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
