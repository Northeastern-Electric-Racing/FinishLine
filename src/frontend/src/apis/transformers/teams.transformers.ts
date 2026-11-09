import { Team, TeamJoinRequest, TeamPreview, TeamWithProjects } from 'shared';
import { projectGanttTransformer } from './projects.transformers';

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
    projects: team.projects.map(projectGanttTransformer)
  };
};

export const teamPreviewTransformer = (team: TeamPreview): TeamPreview => {
  return {
    dateArchived: team.dateArchived ? new Date(team.dateArchived) : undefined,
    ...team
  };
};

export const teamWithProjectsTransformer = (team: TeamWithProjects): TeamWithProjects => {
  return {
    ...team,
    dateArchived: team.dateArchived ? new Date(team.dateArchived) : undefined
  };
};

export const teamJoinRequestTransformer = (teamJoinRequest: TeamJoinRequest): TeamJoinRequest => {
  return {
    ...teamJoinRequest,
    team: teamPreviewTransformer(teamJoinRequest.team),
    dateRequested: new Date(teamJoinRequest.dateRequested),
    dateReviewed: teamJoinRequest.dateReviewed ? new Date(teamJoinRequest.dateReviewed) : undefined
  };
};
