# CodeGPT

Automatic GitHub developer utilizing OpenAI.
Created with Webpack, React and Express.js.

## Requirements

Node and npm or docker and docker-compose for running the app.
Jest for the unit tests and eslint for linting.

## Running the application

When running with Node and npm, run these commands in project root and also in "backend" folder:
```
npm install
npm start
```
With docker and docker-compose run the following in project root:
```
docker-compose up --build
```

You can now access the application with your browser on http://localhost:3000
Enter your GitHub access token and OpenAI token and you can start prompting!

## Unit tests and linting

A suite of unit tests can be ran for the backend application with `npx jest`.
You can lint both backend and frontend applications by running `npm lint` or `npm lint:fix` in their respective folders.

# Licence

This project is licensed under the terms of the GNU General Public License v3.0.
