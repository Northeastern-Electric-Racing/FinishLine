/**
 * Builds links back into the FinishLine client from the backend.
 *
 * Mirrors the environment check already used in slack.utils.ts so that links generated locally
 * point at the local client rather than production.
 */
export const getFrontendBaseUrl = (): string => {
  return process.env.NODE_ENV === 'production' ? 'https://finishlinebyner.com' : 'http://localhost:3000';
};

/**
 * Projects and work packages share a single client route, which dispatches on whether the work
 * package number is zero, so both link the same way.
 * @param wbsNum the piped wbs number, e.g. "1.2.0"
 */
export const wbsElementUrl = (wbsNum: string): string => {
  return `${getFrontendBaseUrl()}/projects/${wbsNum}`;
};

/**
 * There is no per task route in the client, so tasks link to their project's tasks tab.
 * @param projectWbsNum the piped wbs number of the task's project
 */
export const projectTasksUrl = (projectWbsNum: string): string => {
  return `${wbsElementUrl(projectWbsNum)}/tasks`;
};

/**
 * @param eventId the id of the event
 */
export const eventUrl = (eventId: string): string => {
  return `${getFrontendBaseUrl()}/calendar/event/${eventId}`;
};
