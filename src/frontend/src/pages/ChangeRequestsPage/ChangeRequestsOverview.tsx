/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, useTheme } from '@mui/material';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isLeadership, isHead, ChangeRequest, Project, WorkPackage, equalsWbsNumber } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import ChangeRequestDetailCard from '../../components/ChangeRequestDetailCard';
import { useCurrentUser } from '../../hooks/users.hooks';

const ChangeRequestsOverview: React.FC = () => {
  const theme = useTheme();
  const user = useCurrentUser();

  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const { data: projects, isError: projectIsError, isLoading: projectLoading, error: projectError } = useAllProjects();
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  // whether to show To Review section
  const showToReview = isHead(user.role) || isLeadership(user.role);

  if (crIsLoading || projectLoading || wpLoading || !changeRequests || !projects || !workPackages)
    return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (wpIsError) return <ErrorPage message={wpError?.message} />;

  // projects whose change requests the user would have to review
  const myProjects = projects.filter(
    (project: Project) =>
      (project.team && project.team.teamId === user.teamAsLeadId) ||
      (project.projectLead && project.projectLead.userId === user.userId) ||
      (project.projectManager && project.projectManager.userId === user.userId)
  );

  // work packages whose change requests the user would have to review
  const myWorkPackages = workPackages.filter(
    (wp: WorkPackage) =>
      (wp.projectLead ? wp.projectLead.userId === user.userId : false) ||
      (wp.projectManager ? wp.projectManager.userId === user.userId : false)
  );

  // all of the wbs numbers (in x.x.x string format) corresponding to projects and work packages
  // whose change requests the user would have to review
  const myWbsNumbers = myProjects
    .map((project: Project) => project.wbsNum)
    .concat(myWorkPackages.map((wp: WorkPackage) => wp.wbsNum));

  const currentDate = new Date();

  const crToReview = changeRequests
    .filter(
      (cr) =>
        !cr.dateReviewed &&
        cr.submitter.userId !== user.userId &&
        myWbsNumbers.some((wbsNum) => equalsWbsNumber(wbsNum, cr.wbsNum))
    )
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const crUnreviewed = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && cr.submitter.userId === user.userId)
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const crApproved = changeRequests
    .filter(
      (cr: ChangeRequest) =>
        cr.dateImplemented &&
        cr.submitter.userId === user.userId &&
        currentDate.getTime() - cr.dateImplemented.getTime() <= 1000 * 60 * 60 * 24 * 5
    )
    .sort((a, b) =>
      a.dateImplemented && b.dateImplemented ? b.dateImplemented?.getTime() - a.dateImplemented?.getTime() : 0
    );

  const displayCRCards = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  return (
    <Box>
      {showToReview && (
        <PageBlock title={'To Review'} headerRight={`${crToReview.length} Left`}>
          <Grid container>{displayCRCards(crToReview)}</Grid>
        </PageBlock>
      )}
      <PageBlock title={'My Un-reviewed Change Requests'} headerRight={`${crUnreviewed.length} Left`}>
        <Grid container>{displayCRCards(crUnreviewed)}</Grid>
      </PageBlock>
      <PageBlock title={'My Recently Approved Change Requests'} headerRight={`${crApproved.length} Left`} defaultClosed>
        <Grid container>{displayCRCards(crApproved)}</Grid>
      </PageBlock>
    </Box>
  );
};

export default ChangeRequestsOverview;
