import express from 'express';
import cors from 'cors';
import { expressjwt } from 'express-jwt';
import cookieParser from 'cookie-parser';
import { requireJwtUnlessLogin } from './src/utils/utils';
import userRouter from './src/routes/users.routes';
import projectRouter from './src/routes/projects.routes';
import teamsRouter from './src/routes/teams.routes';
import workPackagesRouter from './src/routes/work-packages.routes';
import risksRouter from './src/routes/risks.routes';
import changeRequestsRouter from './src/routes/change-requests.routes';
import descriptionBulletsRouter from './src/routes/description-bullets.routes';

const app = express();
const port = process.env.PORT || 3001;

const allowedHeaders =
  process.env.NODE_ENV === 'production'
    ? 'Origin, X-Requested-With, Content-Type, Accept, Authorization, XMLHttpRequest, X-Auth-Token, Client-Security-Token'
    : '*';

export const TOKEN_SECRET = process.env.TOKEN_SECRET || 'i<3security';

const options: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'https://finishlinebyner.com', 'https://qa.finishlinebyner.com'],
  methods: 'GET, POST',
  credentials: true,
  preflightContinue: false,
  allowedHeaders
};

// so that we can use cookies and json
app.use(cookieParser());
app.use(express.json());

// express jwt setup
app.use(
  requireJwtUnlessLogin(
    expressjwt({
      secret: TOKEN_SECRET,
      algorithms: ['HS256'],
      getToken: (req) => req.cookies.token
    })
  )
);

// cors settings
app.use(cors(options));

// routes
app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/teams', teamsRouter);
app.use('/work-packages', workPackagesRouter);
app.use('/risks', risksRouter);
app.use('/change-requests', changeRequestsRouter);
app.use('/description-bullets', descriptionBulletsRouter);
app.use('/', (_req, res) => {
  res.json('Welcome to FinishLine');
});

// start the server
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
