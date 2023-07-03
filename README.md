# Simple CRUD cluster

Task: https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md

All tasks done

## HOW TO RUN TEST:

You should run test with already started server so:

1. start server - `npm run start:dev` or `npm run start:prod`
2. wait server bootstrap
3. run tests - `npm run test`
4. you can change port of api against tests runs in .env file - tests finds API port in this order: 
   1. `process.env["TEST_API_PORT"]`
   2. `process.env["PORT"]`
   3. `4000` is default