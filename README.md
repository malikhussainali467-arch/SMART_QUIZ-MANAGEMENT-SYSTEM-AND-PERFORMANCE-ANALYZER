# Smart Quiz: Quiz Management & Performance Analysis System

University project. React + Node.js (Express) + SQL (SQLite). Students take timed/random quizzes and get
topic-wise analysis, weak-topic detection and practice recommendations. Teachers manage subjects,
questions and quizzes and see class analytics.

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

## Features

**Student:** register/login, browse quizzes, timed quizzes with auto-submit, question navigator, flag questions,
keyboard shortcuts, resume after refresh, automatic scoring, answer review with explanations, history,
topic mastery, weak topics, recommendations, personal practice sets, badges, streaks, leaderboard, dark mode.

**Teacher:** subjects and topics, question bank (MCQ and written, 3 difficulty levels, marks),
quiz builder (time limit, random N-of-pool, shuffle, pass mark, attempt limit, publish switch),
quiz results with question difficulty, student list and per-student analysis, class dashboard with weak topics
and at-risk students, review and adjust marks of written answers.

## How the "smart" parts work (no AI, plain rules)

All in `server/services/` so they are easy to explain and change.

- **Grading** (`GradingService.js`): MCQ = right or wrong. Written answers are marked by the share of the teacher's
  keywords found in the answer (rounded to half marks); the teacher can override on the Reviews page.
- **Topic mastery** (`PerformanceService.js`): weighted accuracy per topic. Newer answers count more
  (half-life 14 days) and harder questions count more. Under 60% = weak, 80%+ = strong, fewer than 4 answers = not enough data.
  The tuning numbers are constants at the top of the file.
- **Recommendations**: the three weakest topics, with a suggested level, how many practice questions exist, and which quizzes cover them.
- **Practice sets** (`QuizBuilderService.js`): questions you missed last time first, then unseen ones, then revision.
- **Leaderboard**: points = sum of your best percentage in each quiz.

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
  seed/               demo data (edit demoContent.js to change it)
client/
  src/pages/          one file per screen (auth, student, teacher, shared)
  src/components/     reusable pieces (Modal, charts, forms, PerformanceView ...)
  src/context/        login, theme, toasts
  src/hooks/          useFetch, usePractice, useCountUp
  src/api/client.js   all server calls
  src/styles/         theme.css (colours, fonts) + component/layout/page CSS
  dist/               the built site (already included)
```

## Common changes

| I want to...                         | Edit                                          |
|--------------------------------------|-----------------------------------------------|
| Change colours or fonts              | `client/src/styles/theme.css`                 |
| Change weak/strong limits            | top of `server/services/PerformanceService.js`|
| Change how written answers are marked| `server/services/GradingService.js`           |
| Add a field to questions or quizzes  | the model in `server/models/`, then the form in `client/src/components/` |
| Add an API route                     | `server/routes/index.js` + a controller       |
| Change demo data                     | `server/seed/demoContent.js` (then reset DB)  |

After changing anything in `client/src`, rebuild the site with `npm run client:build`.
For live editing run two terminals: `npm run dev` and `npm run client:dev` (open http://localhost:5173).

## Troubleshooting

- **Port in use:** set `PORT=5001` in `.env`.
- **Reset database:** run `npm run reset-db`.
