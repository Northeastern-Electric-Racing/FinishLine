import { Scope_CR_Why_Type, Team, User, WBS_Element, Prisma } from '@prisma/client';
import { ChangeRequestReason } from 'shared';
import { sendMessage } from '../integrations/slack.utils';
import prisma from '../prisma/prisma';
import { buildChangeDetail } from './utils';
import workPackageDependencyQueryArgs from '../prisma-query-args/work-package-depedencies.query-args';

export const convertCRScopeWhyType = (whyType: Scope_CR_Why_Type): ChangeRequestReason =>
  ({
    ESTIMATION: ChangeRequestReason.Estimation,
    SCHOOL: ChangeRequestReason.School,
    DESIGN: ChangeRequestReason.Design,
    MANUFACTURING: ChangeRequestReason.Manufacturing,
    RULES: ChangeRequestReason.Rules,
    INITIALIZATION: ChangeRequestReason.Initialization,
    COMPETITION: ChangeRequestReason.Competition,
    MAINTENANCE: ChangeRequestReason.Maintenance,
    OTHER_PROJECT: ChangeRequestReason.OtherProject,
    OTHER: ChangeRequestReason.Other
  }[whyType]);

export const sendSlackChangeRequestNotification = async (
  team: Team & {
    leader: User;
  },
  message: string,
  crId: number,
  budgetImpact?: number
) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: New Change Request! :tada: ${message}`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR #${crId}`;
  msgs.push(sendMessage(team.slackId, fullMsg, fullLink, btnText));

  if (budgetImpact && budgetImpact > 100) {
    msgs.push(
      sendMessage(process.env.SLACK_EBOARD_CHANNEL!, `${fullMsg} with $${budgetImpact} requested`, fullLink, btnText)
    );
  }
  return Promise.all(msgs);
};

export const sendSlackCRReviewedNotification = async (slackId: string, crId: number) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: Your Change Request was just reviewed! Clink the link to view! :tada:`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${crId}`;
  msgs.push(sendMessage(slackId, fullMsg, fullLink, btnText));

  return Promise.all(msgs);
};

/**
 *
 * @param workPackages The Projects work Packages to be checked
 * @param wbsElement The wbs element to check for
 * @param timelineImpact the timeline impact of the proposed solution
 * @param crId the change request id
 * @param reviewer the reviewer of the change request
 *
 * This function will recursively update the start date of all work packages that depend on the wbs element to be finished
 */
export const updateDependencies = async (
  workPackages: Prisma.Work_PackageGetPayload<typeof workPackageDependencyQueryArgs>[],
  wbsElement: WBS_Element,
  timelineImpact: number,
  crId: number,
  reviewer: User
) => {
  //cycle through all the work packages
  workPackages.forEach(async (wp) => {
    //if the work package depends on the wbs element
    if (wp.dependencies.map((d: WBS_Element) => d.wbsElementId).includes(wbsElement.wbsElementId)) {
      //update the start date of the work package
      const copyStartDate = new Date(wp.startDate);
      const newStartDate = new Date(wp.startDate.setDate(wp.startDate.getDate() + 7 * timelineImpact));

      //create a change to reflect the changing start date
      const change = {
        changeRequestId: crId,
        implementerId: reviewer.userId,
        detail: buildChangeDetail('Start Date', String(copyStartDate), String(newStartDate))
      };

      //update the work package
      await prisma.work_Package.update({
        where: { workPackageId: wp.workPackageId },
        data: {
          startDate: newStartDate,
          wbsElement: {
            update: {
              changes: {
                create: change
              }
            }
          }
        }
      });
      //recursively update the work packages that depends on the updated work package
      updateDependencies(workPackages, wp.wbsElement, timelineImpact, crId, reviewer);
    }
  });
};
