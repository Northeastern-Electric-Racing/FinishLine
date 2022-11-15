import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prodHeaders, requireJwtDev, requireJwtProd } from './src/utils/utils';
import userRouter from './src/routes/users.routes';
import projectRouter from './src/routes/projects.routes';
import teamsRouter from './src/routes/teams.routes';
import workPackagesRouter from './src/routes/work-packages.routes';
import risksRouter from './src/routes/risks.routes';
import changeRequestsRouter from './src/routes/change-requests.routes';
import descriptionBulletsRouter from './src/routes/description-bullets.routes';
import { customerErrorHandler } from './src/middleware/CustomErrorHandler';

const app = express();
const port = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// cors options
const allowedHeaders = isProd ? prodHeaders : '*';
const options: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'https://finishlinebyner.com', 'https://qa.finishlinebyner.com'],
  methods: 'GET, POST',
  credentials: true,
  preflightContinue: true,
  exposedHeaders: '*',
  optionsSuccessStatus: 204,
  allowedHeaders
};

// so that we can use cookies and json
app.use(cookieParser());
app.use(express.json());

// cors settings
app.use(cors(options));

// ensure each request is authorized using JWT
app.use(isProd ? requireJwtProd : requireJwtDev);

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

app.use(customerErrorHandler);

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
