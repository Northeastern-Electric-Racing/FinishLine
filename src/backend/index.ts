import express, { Router } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getUserAndOrganization, prodHeaders, requireJwtDev, requireJwtProd } from './src/utils/auth.utils.js';
import { errorHandler } from './src/utils/errors.utils.js';
import userRouter from './src/routes/users.routes.js';
import projectRouter from './src/routes/projects.routes.js';
import teamsRouter from './src/routes/teams.routes.js';
import workPackagesRouter from './src/routes/work-packages.routes.js';
import changeRequestsRouter from './src/routes/change-requests.routes.js';
import descriptionBulletsRouter from './src/routes/description-bullets.routes.js';
import tasksRouter from './src/routes/tasks.routes.js';
import reimbursementRequestsRouter from './src/routes/reimbursement-requests.routes.js';
import notificationsRouter from './src/routes/notifications.routes.js';
import wbsElementTemplatesRouter from './src/routes/wbs-element-templates.routes.js';
import carsRouter from './src/routes/cars.routes.js';
import organizationRouter from './src/routes/organizations.routes.js';
import recruitmentRouter from './src/routes/recruitment.routes.js';
import { getReceiver } from './src/integrations/slack.js';
import announcementsRouter from './src/routes/announcements.routes.js';
import onboardingRouter from './src/routes/onboarding.routes.js';
import popUpsRouter from './src/routes/pop-up.routes.js';
import statisticsRouter from './src/routes/statistics.routes.js';
import retrospectiveRouter from './src/routes/retrospective.routes.js';
import partsRouter from './src/routes/parts.routes.js';
import financeRouter from './src/routes/finance.routes.js';
import calendarRouter from './src/routes/calendar.routes.js';

const app = express();

const port = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// cors options
const allowedHeaders = isProd ? prodHeaders : '*';

// Build list of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://finishlinebyner.com',
  'https://qa.finishlinebyner.com'
];

const options: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin like postman or curl requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET, POST, DELETE',
  credentials: true,
  preflightContinue: true,
  exposedHeaders: '*',
  optionsSuccessStatus: 204,
  allowedHeaders
};

// Mount Slack Bolt receiver BEFORE other middleware to handle raw body parsing
// Bolt's receiver handles its own body parsing and request verification
// The receiver is configured to handle requests at /slack/events
// Only mount if Slack is configured (when SLACK_BOT_TOKEN is set)
const receiver = getReceiver();
if (receiver) {
  app.use(receiver.router as unknown as Router);
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// so that we can use cookies and json
app.use(cookieParser());
app.use(express.json());

// cors settings
app.use(cors(options));

// ensure each request is authorized using JWT
app.use(isProd ? requireJwtProd : requireJwtDev);

// get user and organization
app.use(getUserAndOrganization);

// routes
app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/teams', teamsRouter);
app.use('/work-packages', workPackagesRouter);
app.use('/change-requests', changeRequestsRouter);
app.use('/description-bullets', descriptionBulletsRouter);
app.use('/tasks', tasksRouter);
app.use('/reimbursement-requests', reimbursementRequestsRouter);
app.use('/notifications', notificationsRouter);
app.use('/templates', wbsElementTemplatesRouter);
app.use('/cars', carsRouter);
app.use('/organizations', organizationRouter);
app.use('/recruitment', recruitmentRouter);
app.use('/pop-ups', popUpsRouter);
app.use('/announcements', announcementsRouter);
app.use('/onboarding', onboardingRouter);
app.use('/statistics', statisticsRouter);
app.use('/retrospective', retrospectiveRouter);
app.use('/parts', partsRouter);
app.use('/finance', financeRouter);
app.use('/calendar', calendarRouter);
app.use('/', (_req, res) => {
  res.status(200).json('Welcome to FinishLine');
});

// custom error handler middleware
app.use(errorHandler);

// start the server
app.listen(port, () => {
  console.log(
    `FinishLine listening at http://localhost:${port}. Currently running in ${isProd ? 'production' : 'development'} mode.`
  );
  console.log(`\n
  ███████╗██╗███╗   ██╗██╗███████╗██╗  ██╗██╗     ██╗███╗   ██╗███████╗
  ██╔════╝██║████╗  ██║██║██╔════╝██║  ██║██║     ██║████╗  ██║██╔════╝
  █████╗  ██║██╔██╗ ██║██║███████╗███████║██║     ██║██╔██╗ ██║█████╗  
  ██╔══╝  ██║██║╚██╗██║██║╚════██║██╔══██║██║     ██║██║╚██╗██║██╔══╝  
  ██║     ██║██║ ╚████║██║███████║██║  ██║███████╗██║██║ ╚████║███████╗
  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝`);
});
