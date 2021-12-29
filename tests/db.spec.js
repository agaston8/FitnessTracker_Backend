/* 

DO NOT CHANGE THIS FILE

*/
require('dotenv').config();
const bcrypt = require('bcrypt');
const SALT_COUNT = 10;

const { rebuildDB } = require('../db/seedData');
const { getUserById, getAllActivities, getActivityById, createActivity, updateActivity, getRoutineById, getAllRoutines, getAllPublicRoutines, getAllRoutinesByUser, getPublicRoutinesByUser, getPublicRoutinesByActivity, createRoutine, updateRoutine, destroyRoutine, createUser, getUser, getRoutineActivitiesByRoutine, addActivityToRoutine, updateRoutineActivity, destroyRoutineActivity } = require('../db');
const client = require('../db/client');

describe('Database', () => {
  beforeAll(async() => {
    await rebuildDB();
  })
  afterAll(async() => {
    await client.end();
  })
  describe('Users', () => {
    let userToCreateAndUpdate, queriedUser;
    let userCredentials = {username: 'billybob', password: 'bobbybadboy'};
    const userToQuery = {id:3, username: 'sandra', password: 'sandra123'};
    describe('createUser({ username, password })', () => {
      beforeAll(async () => {
        userToCreateAndUpdate = await createUser(userCredentials);
        const {rows} = await client.query(`SELECT * FROM users WHERE username = $1`, [userCredentials.username]);
        queriedUser = rows[0];
      })
      it('Creates the user', async () => {
        expect(userToCreateAndUpdate.username).toBe(userCredentials.username);
        expect(queriedUser.username).toBe(userCredentials.username);
      });
      it('EXTRA CREDIT: Does not store plaintext password in the database', async () => {
        expect(queriedUser.password).not.toBe(userCredentials.password);
      });
      it('EXTRA CREDIT: Hashes the password (salted 10 times) before storing it to the database', async () => {
        const hashedVersion = bcrypt.compareSync(userCredentials.password, queriedUser.password);
        expect(hashedVersion).toBe(true);
      });
      it('Does NOT return the password', async () => {
        expect(userToCreateAndUpdate.password).toBeFalsy();
      })
    })
    describe('getUser({ username, password })', () => {
      let verifiedUser;
      beforeAll(async () => {
        verifiedUser = await getUser(userToQuery);
      })
      it('Verifies the passed-in, plain-text password against the password in the database (the hashed password, if this portion is complete)', async () => {
        const unVerifiedUser = await getUser({username: userToQuery.username, password: 'badPassword'});
        expect(verifiedUser).toBeTruthy();
        expect(verifiedUser.username).toBe(userToQuery.username);
        expect(unVerifiedUser).toBeFalsy();
      })
      it('Does NOT return the password', async () => {
        expect(verifiedUser.password).toBeFalsy();
      })
    })
    describe('getUserById', () => {
      it('Gets a user based on the user Id', async () => {
        const user = await getUserById(userToQuery.id);
        expect(user).toBeTruthy();
        expect(user.id).toBe(userToQuery.id);
      })
    })
  })
  describe('Activities', () => {
    describe('getAllActivities', () => {
      it('selects and returns an array of all activities', async () => {
        const activities = await getAllActivities();
        const {rows: activitiesFromDatabase} = await client.query(`
        SELECT * FROM activities;
      `);
        expect(activities).toEqual(activitiesFromDatabase);
      })
    })
    describe('createActivity({ name, description })', () => {
      it('Creates and returns the new activity', async () => {
        const activityToCreate = { name: 'elliptical', description: 'using the elliptical machine' };
        const createdActivity = await createActivity(activityToCreate);
        expect(createdActivity.name).toBe(activityToCreate.name);
        expect(createdActivity.description).toBe(activityToCreate.description);
      })
    })
    //Todo => more specific query for the one to update?
    describe('updateActivity', () => {
      it('Updates name and description of an activity without affecting the ID. Returns the updated Activity.', async () => {
        const [activityToUpdate] = await getAllActivities();
        activityToUpdate.name = 'standing barbell curl';
        const activity = await updateActivity(activityToUpdate);
        expect(activity).toEqual(activityToUpdate);
      })
    })
    describe('getActivityById', () => {
      it('gets activities by their id', async () => {
        const activity = await getActivityById(1);
        expect(activity).toBeTruthy();
      })
    })
  })
  describe('Routines', () => {
    let routineToCreate;
    let routineToUpdate;
    describe('getAllRoutines', () => {
      let routine;
      beforeAll(async() => {
        [routine] = await getAllRoutines();
      }) 
      it('selects and returns an array of all routines, includes their activities', async () => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(Number),
          creatorId: expect.any(Number),
          isPublic: expect.any(Boolean),
          name: expect.any(String),
          goal: expect.any(String),
          activities: expect.any(Array),
        }));
      })
      it('includes username, from users join, aliased as creatorName', async () => {
        expect(routine).toEqual(expect.objectContaining({
          creatorName: expect.any(String),
        }));
      })
      it('includes duration and count on activities, from routine_activities join', async () => {
        const {activities: [firstActivity]} = routine;
        expect(firstActivity).toEqual(expect.objectContaining({
          duration: expect.any(Number),
          count: expect.any(Number),
        }));
      })
    })
    describe('getAllPublicRoutines', () => {
      let routine;
      beforeAll(async() => {
        [routine] = await getAllPublicRoutines();
      })
      it('selects and returns an array of all public routines, includes their activities', async () => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(Number),
          creatorId: expect.any(Number),
          isPublic: expect.any(Boolean),
          name: expect.any(String),
          goal: expect.any(String),
          activities: expect.any(Array),
        }));
        expect(routine.isPublic).toBe(true);
      })
      it('includes username, from users join, aliased as creatorName', async () => {
        expect(routine).toEqual(expect.objectContaining({
          creatorName: expect.any(String),
        }));
      })
      it('includes duration and count on activities, from routine_activities join', async () => {
        const {activities: [firstActivity]} = routine;
        expect(firstActivity).toEqual(expect.objectContaining({
          duration: expect.any(Number),
          count: expect.any(Number),
        }));
      })
    })
    describe('getAllRoutinesByUser', () => {
      let routine, user;
      beforeAll(async() => {
        user = await getUserById(1); 
        [routine] = await getAllRoutinesByUser(user);
      })
      it('selects and return an array of all routines made by user, includes their activities', async () => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(Number),
          creatorId: expect.any(Number),
          isPublic: expect.any(Boolean),
          name: expect.any(String),
          goal: expect.any(String),
          activities: expect.any(Array),
        }));
        expect(routine.creatorId).toBe(user.id);
      })
      it('includes username, from users join, aliased as creatorName', async () => {
        expect(routine).toEqual(expect.objectContaining({
          creatorName: expect.any(String),
        }));
      })
      it('includes duration and count on activities, from routine_activities join', async () => {
        const {activities: [firstActivity]} = routine;
        expect(firstActivity).toEqual(expect.objectContaining({
          duration: expect.any(Number),
          count: expect.any(Number),
        }));
      })
    })
    describe('getPublicRoutinesByUser', () => {
      let routine, user;
      beforeAll(async() => {
        user = await getUserById(1); 
        [routine] = await getPublicRoutinesByUser(user);
      })
      it('selects and returns an array of all routines made by user, includes their activities', async () => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(Number),
          creatorId: expect.any(Number),
          isPublic: expect.any(Boolean),
          name: expect.any(String),
          goal: expect.any(String),
          activities: expect.any(Array),
        }));
        expect(routine.creatorId).toBe(user.id);
        expect(routine.isPublic).toBe(true);
      })
      it('includes username, from users join, aliased as creatorName', async () => {
        expect(routine).toEqual(expect.objectContaining({
          creatorName: expect.any(String),
        }));
      })
      it('includes duration and count on activities, from routine_activities join', async () => {
        const {activities: [firstActivity]} = routine;
        expect(firstActivity).toEqual(expect.objectContaining({
          duration: expect.any(Number),
          count: expect.any(Number),
        }));
      })
    })
    describe('getPublicRoutinesByActivity', () => {
      let routine, activity;
      beforeAll(async() => {
        activity = await getActivityById(3); 
        [routine] = await getPublicRoutinesByActivity(activity);
      })
      it('selects and return an array of public routines which have a specific activityId in their routine_activities join, includes their activities', async () => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(Number),
          creatorId: expect.any(Number),
          isPublic: expect.any(Boolean),
          name: expect.any(String),
          goal: expect.any(String),
          activities: expect.any(Array),
        }));
        expect(routine.isPublic).toBe(true);
        expect(routine.activities[0].id).toBe(activity.id)
      })
      it('includes username, from users join, aliased as creatorName', async () => {
        expect(routine).toEqual(expect.objectContaining({
          creatorName: expect.any(String),
        }));
      })
      it('includes duration and count on activities, from routine_activities join', async () => {
        const {activities: [firstActivity]} = routine;
        expect(firstActivity).toEqual(expect.objectContaining({
          duration: expect.any(Number),
          count: expect.any(Number),
        }));
      })
    })
    describe('createRoutine', () => {
      it('creates and returns the new routine', async () => {
        routineToCreate = await createRoutine({creatorId: 2, isPublic: true, name: 'BodyWeight Day', goal: 'Do workouts that can be done from home, no gym or weights required.'});
        const queriedRoutine = await getRoutineById(routineToCreate.id)
        expect(routineToCreate).toEqual(queriedRoutine);
      })
    })
    describe('updateRoutine', () => {
      let queriedRoutine;
      beforeAll(async() => {
        routineToUpdate = await updateRoutine({id: 1, isPublic: false, name: 'Arms Day', goal: 'Do all workouts that work those arms!'});
        queriedRoutine = await getRoutineById(routineToUpdate.id);
      })
      it('Returns the updated routine', async () => {
        expect(routineToUpdate).toBeTruthy();
      })
      it('Finds the routine with id equal to the passed in id. Does not update the routine id.', async () => {
        expect(routineToUpdate.id).toBe(queriedRoutine.id);
      })
      it('Updates the public status, name, or goal, as necessary', async () => {
        expect(routineToUpdate.isPublic).toBe(queriedRoutine.isPublic);
        expect(routineToUpdate.name).toBe(queriedRoutine.name);
        expect(routineToUpdate.goal).toBe(queriedRoutine.goal);
      })
      it('Does not update fields that are not passed in', async () => {
        const name = 'Abs Day';
        routineToUpdate = await updateRoutine({id: routineToUpdate.id, name, goal: 'Do all workouts that work those arms!'});
        expect(routineToUpdate.isPublic).toBe(queriedRoutine.isPublic);
        expect(routineToUpdate.name).toBe(name);
        expect(routineToUpdate.goal).toBe(queriedRoutine.goal);
      })
      
    })
    //TODO use another routine from the DB, don't use routineToCreateAndUpdate.id
    describe('destroyRoutine', () => {
      let routineToDestroy;
      beforeAll(async() => {
        routineToDestroy = await getRoutineById(2);
      })
      it('removes routine from database', async () => {
        await destroyRoutine(routineToDestroy.id);
        const {rows: [routine]} = await client.query(`
          SELECT * 
          FROM routines
          WHERE id = $1;
        `, [routineToDestroy.id]);
        expect(routine).toBeFalsy();
      })
      it('Deletes all the routine_activities whose routine is the one being deleted.', async () => {
        const queriedRoutineActivities = await getRoutineActivitiesByRoutine(routineToDestroy)
        expect(queriedRoutineActivities.length).toBe(0);
      })
    })
  })
  xdescribe('Routine Activities', () => {
    const routineActivityData = {
      routineId: 4,
      activityId: 8,
      count: 10,
      duration: 10000 
    }
    let routineActivityToCreateAndUpdate;
    describe('addActivityToRoutine({ routineId, activityId, count, duration })', () => {
      it('creates a new routine_activity, and return it', async () => {
        routineActivityToCreateAndUpdate = await addActivityToRoutine(routineActivityData);
        
        expect(routineActivityToCreateAndUpdate.routineId).toBe(routineActivityData.routineId);
        expect(routineActivityToCreateAndUpdate.activityId).toBe(routineActivityData.activityId);
        expect(routineActivityToCreateAndUpdate.count).toBe(routineActivityData.count);
        expect(routineActivityToCreateAndUpdate.duration).toBe(routineActivityData.duration);
      })
    })
        //TODO use another routine from the DB, don't use routineToCreateAndUpdate.id
    describe('updateRoutineActivity({ id, count, duration })', () => {
      it('Finds the routine with id equal to the passed in id. Updates the count or duration as necessary.', async () => {
        const newRoutineActivityData = {id: routineActivityToCreateAndUpdate.id, count: 15, duration: 150};
        routineActivityToCreateAndUpdate = await updateRoutineActivity(newRoutineActivityData);
        expect(routineActivityToCreateAndUpdate.id).toBe(newRoutineActivityData.id);
        expect(routineActivityToCreateAndUpdate.count).toBe(newRoutineActivityData.count);
        expect(routineActivityToCreateAndUpdate.duration).toBe(newRoutineActivityData.duration);
      })
    })
        //TODO use another routine from the DB, don't use routineToCreateAndUpdate.id

    describe('destroyRoutineActivity(id)', () => {
      it('remove routine_activity from database', async () => {
        const deletedRoutine = await destroyRoutineActivity(routineActivityToCreateAndUpdate.id);
        expect(deletedRoutine.id).toBe(routineActivityToCreateAndUpdate.id);
        const {rows} = await client.query(`
          SELECT * FROM routine_activities
          WHERE id = ${deletedRoutine.id}
        `)
        expect(rows.length).toBe(0);
      })
    })

  })
});
