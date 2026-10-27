# Smart Quiz: Quiz Management System (Mids Version)

University project. React + Node.js (Express) + SQL (SQLite). Students take quizzes and review their results and attempt history. Teachers manage subjects, topics, MCQ questions, build quizzes, and inspect quiz results.

## Run it (3 steps)

1. Install **Node.js 18+** (https://nodejs.org) if you do not have it.
2. Open this folder and run:
   - **Windows:** double-click `start.bat`
   - **Mac / Linux:** `./start.sh`
   - or in any terminal: `npm install` then `npm start`
3. Open **http://localhost:5000**

Data is saved in the `data/` folder (`data/quiz.sqlite`) and survives restarts. On an empty database the app loads demo users, questions,
quizzes and history automatically.

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Teacher | teacher@quiz.com  | teacher123 |
| Student | student@quiz.com  | student123 |

New accounts: use **Register**. Teachers must enter the teacher code `TEACHER2026`.

To start fresh: stop the app and delete the `data/quiz.sqlite` file (or run `npm run reset-db`).

## Features (Mids Version)

**Student:**
- Register and login (student role)
- Browse published quizzes
- Take untimed quizzes with question navigator, flagging, and keyboard shortcuts
- Resume in-progress attempt after page reload
- Automatic MCQ grading
- Detailed result page (percentage, score, correct answers, explanations)
- Student attempt history

**Teacher:**
- Register and login (teacher role)
- Manage subjects and topics (create, edit, delete)
- Question bank with MCQ questions only (difficulty, marks, search, filters)
- Quiz builder (title, description, subject, pick questions, pass mark, publish switch)
- Basic teacher view of quiz results (attempt list with scores and dates)

## Project structure

```
server/
  index.js            start-up (database, seed, web server)
  app.js              Express app, serves the React build
  config/             env.js (settings), db.js (SQL database connection)
  models/             BaseModel, User, Subject, Topic, Question, Quiz, Attempt
  routes/index.js     every API URL in one file
  controllers/        one file per area: handle request, call services
  services/           GradingService, QuizBuilderService, AttemptService, PerformanceService
  presenters/         shapes an attempt for the browser (hides answers during a quiz)
  middleware/         login check, role check, error handler
  seed/               demo data (demoContent.js and seedData.js)
client/
  src/pages/          pages (auth, student, teacher, shared)
  src/components/     reusable pieces (Modal, forms, StatCard ...)
  src/context/        login, toasts
  src/hooks/          useFetch, useCountUp
  src/api/client.js   all server calls
  src/styles/         theme.css + component/layout/page CSS
  dist/               the built site
```

## Common changes

| I want to...                         | Edit                                          |
|--------------------------------------|-----------------------------------------------|
| Change colours or fonts              | `client/src/styles/theme.css`                 |
| Change question scoring              | `server/services/GradingService.js`           |
| Add a field to questions or quizzes  | the model in `server/models/`, then the form in `client/src/components/` |
| Add an API route                     | `server/routes/index.js` + a controller       |
| Change demo data                     | `server/seed/demoContent.js` (then reset DB)  |

After changing anything in `client/src`, rebuild the site with `npm run client:build`.
For live editing run two terminals: `npm run dev` and `npm run client:dev` (open http://localhost:5173).

## Troubleshooting

- **Port in use:** set `PORT=5001` in `.env`.
- **Reset database:** run `npm run reset-db`.
