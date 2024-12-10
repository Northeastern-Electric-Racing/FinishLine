/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, equalsWbsNumber, Project, StandardChangeRequest, User, WorkPackage } from 'shared';
import { makeTeamList } from './teams.utils';

export const hasProposedChanges = (cr: StandardChangeRequest) => {
  return cr.workPackageProposedChanges || cr.projectProposedChanges;
};

export const getCRsToReview = (
  projects: Project[],
  workPackages: WorkPackage[],
  user: User,
  changeRequests: ChangeRequest[]
): ChangeRequest[] => {
  // projects whose change requests the user would have to review
  const myProjects = projects.filter((project: Project) => {
    const projectMemberIds = project.teams.flatMap((team) => makeTeamList(team)).map((user) => user.userId);
    return (
      projectMemberIds.includes(user.userId) ||
      (project.lead && project.lead.userId === user.userId) ||
      (project.manager && project.manager.userId === user.userId)
    );
  });

  // work packages whose change requests the user would have to review
  const myWorkPackages = workPackages.filter(
    (wp: WorkPackage) =>
      (wp.lead ? wp.lead.userId === user.userId : false) || (wp.manager ? wp.manager.userId === user.userId : false)
  );

  // all of the wbs numbers (in x.x.x string format) corresponding to projects and work packages
  // whose change requests the user would have to review
  const myWbsNumbers = myProjects
    .map((project: Project) => project.wbsNum)
    .concat(myWorkPackages.map((wp: WorkPackage) => wp.wbsNum));
  const crToReview = changeRequests
    .filter(
      (cr) =>
        !cr.dateReviewed &&
        cr.submitter.userId !== user.userId &&
        (myWbsNumbers.some((wbsNum) => equalsWbsNumber(wbsNum, cr.wbsNum)) ||
          cr.requestedReviewers.map((user) => user.userId).includes(user.userId))
    )
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());
  return crToReview;
};

export const getCRsUnreviewed = (user: User, changeRequests: ChangeRequest[]) => {
  const crUnreviewed = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && cr.submitter.userId === user.userId)
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());
  return crUnreviewed;
};

export const getCRsApproved = (user: User, changeRequests: ChangeRequest[]) => {
  const currentDate = new Date();
  const crApproved = changeRequests
    .filter(
      (cr: ChangeRequest) =>
        cr.dateReviewed &&
        cr.accepted &&
        cr.submitter.userId === user.userId &&
        currentDate.getTime() - cr.dateReviewed.getTime() <= 1000 * 60 * 60 * 24 * 5
    )
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

  return crApproved;
};
