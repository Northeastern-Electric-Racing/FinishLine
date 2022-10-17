import express from 'express';
import cors from 'cors';
import userRouter from './src/routes/users.routes';
import projectRouter from './src/routes/projects.routes';
import teamsRouter from './src/routes/teams.routes';
import workPackagesRouter from './src/routes/work-packages.routes';
import risksRouter from './src/routes/risks.routes';
import changeRequestsRouter from './src/routes/change-requests.routes';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT || 3001;

const options: cors.CorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: false,
  preflightContinue: true,
  allowedHeaders: '*'
};

app.use(cors(options));
app.use(express.json());

const PgSession = connectPg(session);

const pool = new Pool({
  host: 'localhost',
  database: 'nerpm',
  user: 'shaanhossain',
  password: ''
});

// req.session.id = userID

app.use(
  session({
    secret: 'ASDASDASDASDASD',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      domain: undefined
    },
    store: new PgSession({
      pool
    })
  })
);

app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/teams', teamsRouter);
app.use('/work-packages', workPackagesRouter);
app.use('/risks', risksRouter);
app.use('/change-requests', changeRequestsRouter);

app.use('/', (_req, res) => {
  res.json('Welcome to FinishLine');
});

app.listen(port, () => {
  console.log(`FinishLine listening at http://localhost:${port}`);
  console.log(`\n
  ███████╗██╗███╗   ██╗██╗███████╗██╗  ██╗██╗     ██╗███╗   ██╗███████╗
  ██╔════╝██║████╗  ██║██║██╔════╝██║  ██║██║     ██║████╗  ██║██╔════╝
  █████╗  ██║██╔██╗ ██║██║███████╗███████║██║     ██║██╔██╗ ██║█████╗  
  ██╔══╝  ██║██║╚██╗██║██║╚════██║██╔══██║██║     ██║██║╚██╗██║██╔══╝  
  ██║     ██║██║ ╚████║██║███████║██║  ██║███████╗██║██║ ╚████║███████╗
  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝`);
});
