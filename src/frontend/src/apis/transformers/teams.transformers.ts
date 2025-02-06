import { Team } from 'shared';
import { projectPreviewTranformer } from './projects.transformers';

/**
 * Transforms a team to ensure deep field transformation of date objects.
 *
 * @param team Incoming team object supplied by the HTTP response.
 * @returns Properly transformed team object.
 */
export const teamTransformer = (team: Team): Team => {
  return {
    ...team,
    dateArchived: team.dateArchived ? new Date(team.dateArchived) : undefined,
    projects: team.projects.map(projectPreviewTranformer)
  };
};
