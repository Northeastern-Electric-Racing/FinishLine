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

const options: cors.CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://finishlinebyner.com',
    'https://magenta-mochi-275e56.netlify.app'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: true,
  allowedHeaders: '*'
};

app.use(cookieParser());
app.use(
  requireJwtUnlessLogin(
    expressjwt({
      secret: process.env.TOKEN_SECRET || 'asdfjasdlfjsdlfjaskdjfsadlkjfskj',
      algorithms: ['HS256'],
      getToken: (req) => {
        console.log(req.cookies);
        return req.cookies.token;
      }
    })
  )
);
app.use(cors(options));
app.use(express.json());

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
