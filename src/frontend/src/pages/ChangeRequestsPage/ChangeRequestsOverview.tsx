/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isLeadership, isHead, ChangeRequest, Project, WorkPackage, equalsWbsNumber } from 'shared';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { makeTeamList } from '../../utils/teams.utils';
import ChangeRequestRow from '../../components/ChangeRequestRow';

const ChangeRequestsOverview: React.FC = () => {
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
  const myProjects = projects.filter((project: Project) => {
    const projectMemberIds = project.teams.flatMap((team) => makeTeamList(team)).map((user) => user.userId);
    return (
      projectMemberIds.includes(user.userId) ||
      (project.projectLead && project.projectLead.userId === user.userId) ||
      (project.projectManager && project.projectManager.userId === user.userId)
    );
  });

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
        cr.dateReviewed &&
        cr.accepted &&
        cr.submitter.userId === user.userId &&
        currentDate.getTime() - cr.dateReviewed.getTime() <= 1000 * 60 * 60 * 24 * 5
    )
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

  const crToReviewRow = {
    title: 'To Review',
    changeRequests: crToReview,
    noChangeRequestsMessage: 'No change requests to review'
  };
  const crUnreviewedRow = {
    title: 'My Un-reviewed Change Requests',
    changeRequests: crUnreviewed,
    noChangeRequestsMessage: 'No un-reviewed change requests'
  };

  const crApprovedRow = {
    title: 'My Recently Approved Change Requests',
    changeRequests: crApproved,
    noChangeRequestsMessage: 'No recently approved change requests'
  };

  const overviewRowList = [crUnreviewedRow, crApprovedRow];
  if (showToReview) overviewRowList.unshift(crToReviewRow);

  return (
    <>
      {overviewRowList.map((crRow) => (
        <ChangeRequestRow
          title={crRow.title}
          changeRequests={crRow.changeRequests}
          noChangeRequestsMessage={crRow.noChangeRequestsMessage}
        />
      ))}
    </>
  );
};

export default ChangeRequestsOverview;
