import { WebClient, LogLevel } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN, {
  logLevel: LogLevel.DEBUG
});

export default slack;
