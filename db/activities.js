const client = require("./client")

// database functions
async function getAllActivities() {
    try{
        const {rows:activities} = await client.query(`
            SELECT *
            FROM activities;
        `)

        //console.log("These are the activiites", activities)
        return activities

    }catch(error){
      console.error("Error getting activities");
      throw error;
    }

}

async function getActivityById(id) {
  try{
    const {rows:[activity]} = await client.query(`
      SELECT * 
      FROM activities
      WHERE id=$1;
    `,[id])

    return activity;

  }catch(error){
    console.error("Error getting activity by ID");
    throw error
  }
  
}

async function getActivityByName(name) {
  //const lowercaseName = name.toLowerCase();
  
  try{
    const {rows:[activity]} = await client.query(`
      SELECT * 
      FROM activities
      WHERE name=$1
    ;`, [name])

    return activity;

  }catch(error){
    console.error("Error getting activity by ID");
    throw error
  }

}

async function attachActivitiesToRoutines(routines) {
}

// select and return an array of all activities
async function createActivity({ name, description }) {
  //let lowercaseName = name.toLowerCase();
  
  try{
    const {rows: [activity]} = await client.query(`
      INSERT INTO activities(name, description)
      VALUES ($1, $2)
      RETURNING *;
    `, [name, description]);

    //console.log("Created Activity:", activity);
    return activity;

  }catch(error) {
    
    return error;
  }
}

// return the new activity
async function updateActivity({ id, ...fields }) {
 // console.log("these are the fields", {id, ...fields})
  const field= {...fields};
  let fieldItem =[];
  console.log(field)

  if (field.description) {
    fieldItem.push(`description='${field.description}'`)
  }
  if (field.name) {
    fieldItem.push(`name='${field.name}'`)
  }

  const insertedValues = fieldItem.join(', ');
  console.log(insertedValues)
    
      try{
        const {rows:[newActivity]} = await client.query(`
            UPDATE activities
            SET ${insertedValues}
            WHERE id=${id}
            RETURNING *
        ;`)

        return newActivity

    } catch(error) {
      console.error("Error updating activities");
      throw error
    }
  }


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
