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
      WHERE id=${id};
    `)

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
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [name, description]);

    //console.log("Created Activity:", activity);
    return activity;

  }catch(error) {
    console.error("Error creating activity");
    throw error
  }
}

// return the new activity
async function updateActivity({ id, ...fields }) {
 // console.log("these are the fields", {id, ...fields})
  const field = {...fields};
  
  if (field.description) {
    let fieldD = field.description
    
      try{
        const {rows:[newActivity]} = await client.query(`
            UPDATE activities
            SET description=$1
            WHERE id=${id}
            RETURNING *
        ;`, [fieldD])

        return newActivity

      } catch(error) {
        console.error("Error updating activities");
        throw error
      }
  } 

  if (field.name) {
    let fieldN = field.name
    try{
      const {rows:[newActivity]} = await client.query(`
          UPDATE activities
          SET name=$1
          WHERE id=$2
          RETURNING *
        ;`, [fieldN, id])

      return newActivity

    } catch(error) {
      console.error("Error updating activities");
      throw error
    }
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
