# fitnesstrackr

an API and database for our new fitness tracking application, FitnessTracker, using node, express, and postgresql

## Getting Started

Install Packages

    npm i

Initialize Database

    createdb fitness-dev
    
Run Seed Script
    
    npm run seed:dev

## Automated Tests

To run all the tests in watch mode (re-runs on code update), run

    npm run test:watch

### DB Methods

    npm run test:watch db

### API Routes (server must be running for these to pass)

    npm run test:watch api

