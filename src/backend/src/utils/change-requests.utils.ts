import { Prisma, Scope_CR_Why_Type, Team, User } from '@prisma/client';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestReason,
  StageGateChangeRequest,
  StandardChangeRequest
} from 'shared';
import { sendMessage } from '../integrations/slack.utils';
import { userTransformer } from './users.utils';
import { wbsNumOf } from './utils';

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

export const changeRequestRelationArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: true,
    reviewer: true,
    changes: {
      include: {
        implementer: true,
        wbsElement: true
      }
    },
    scopeChangeRequest: { include: { why: true } },
    stageGateChangeRequest: true,
    activationChangeRequest: { include: { projectLead: true, projectManager: true } }
  }
});

export const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestRelationArgs>
): ChangeRequest | StandardChangeRequest | ActivationChangeRequest | StageGateChangeRequest => {
  return {
    // all cr fields
    crId: changeRequest.crId,
    wbsNum: wbsNumOf(changeRequest.wbsElement),
    submitter: userTransformer(changeRequest.submitter),
    dateSubmitted: changeRequest.dateSubmitted,
    type: changeRequest.type,
    reviewer: changeRequest.reviewer ? userTransformer(changeRequest.reviewer) : undefined,
    dateReviewed: changeRequest.dateReviewed ?? undefined,
    accepted: changeRequest.accepted ?? undefined,
    reviewNotes: changeRequest.reviewNotes ?? undefined,
    dateImplemented: changeRequest.changes.reduce(
      (res: Date | undefined, change) =>
        !res || change.dateImplemented.valueOf() > res.valueOf() ? change.dateImplemented : res,
      undefined
    ),
    implementedChanges: changeRequest.changes.map((change) => ({
      wbsNum: wbsNumOf(change.wbsElement),
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    // scope cr fields
    what: changeRequest.scopeChangeRequest?.what ?? undefined,
    why: changeRequest.scopeChangeRequest?.why.map((why) => ({
      type: convertCRScopeWhyType(why.type),
      explain: why.explain
    })),
    scopeImpact: changeRequest.scopeChangeRequest?.scopeImpact ?? undefined,
    budgetImpact: changeRequest.scopeChangeRequest?.budgetImpact ?? undefined,
    timelineImpact: changeRequest.scopeChangeRequest?.timelineImpact ?? undefined,
    // activation cr fields
    projectLead: changeRequest.activationChangeRequest?.projectLead
      ? userTransformer(changeRequest.activationChangeRequest?.projectLead)
      : undefined,
    projectManager: changeRequest.activationChangeRequest?.projectManager
      ? userTransformer(changeRequest.activationChangeRequest?.projectManager)
      : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    // stage gate cr fields
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined
  };
};

export const sendSlackChangeRequestNotification = async (
  team: Team & {
    leader: User;
  },
  message: string,
  crId: number,
  budgetImpact?: number
) => {
  const msgs = [];
  const fullMsg = `:tada: New Change Request! :tada: ${message}`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR #${crId}`;
  msgs.push(sendMessage(team.slackId, fullMsg, fullLink, btnText));

  if (budgetImpact && budgetImpact > 100) {
    msgs.push(
      sendMessage(
        process.env.SLACK_EBOARD_CHANNEL!,
        `${fullMsg} with $${budgetImpact} requested`,
        fullLink,
        btnText
      )
    );
  }
  return Promise.all(msgs);
};
