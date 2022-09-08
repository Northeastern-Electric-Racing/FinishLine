import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import {
  changeRequestRelationArgs,
  changeRequestTransformer,
  sendSlackChangeRequestNotification
} from '../utils/change-requests.utils';
import { validationResult } from 'express-validator';
import { Role } from '@prisma/client';

export const getAllChangeRequests = async (req: Request, res: Response) => {
  const changeRequests = await prisma.change_Request.findMany(changeRequestRelationArgs);
  return res.status(200).json(changeRequests.map(changeRequestTransformer));
};

// Fetch the specific change request by its integer ID
export const getChangeRequestByID = async (req: Request, res: Response) => {
  const crId: number = parseInt(req.params.crId);
  const requestedCR = await prisma.change_Request.findUnique({
    where: { crId },
    ...changeRequestRelationArgs
  });
  if (requestedCR === null) {
    return res.status(404).json({ message: `change request with id ${crId} not found!` });
  }
  return res.status(200).json(changeRequestTransformer(requestedCR));
};

// handle reviewing of change requests
export const reviewChangeRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { reviewerId, crId, reviewNotes, accepted, psId } = body;

  // verify that the user is allowed review change requests
  const reviewer = await prisma.user.findUnique({ where: { userId: reviewerId } });
  if (!reviewer) return res.status(404).json({ message: `User with id #${reviewerId} not found` });
  if (reviewer.role === Role.GUEST || reviewer.role === Role.MEMBER)
    return res.status(401).json({ message: 'Access Denied' });

  // ensure existence of change request
  const foundCR = await prisma.change_Request.findUnique({ where: { crId } });
  if (!foundCR)
    return res.status(404).json({ message: `change request with id #${crId} not found` });

  // verify that the user is not reviewing their own change request
  if (reviewerId === foundCR.submitterId) return res.status(401).json({ message: 'Access Denied' });

  // if Scope CR, make sure that a proposed solution is selected before approving
  const foundScopeCR = await prisma.scope_CR.findUnique({ where: { changeRequestId: crId } });
  if (foundScopeCR) {
    if (!psId)
      return res
        .status(400)
        .json({ message: 'No proposed solution selected for scope change request' });
    const foundPs = await prisma.proposed_Solution.findUnique({
      where: { proposedSolutionId: psId }
    });
    if (!foundPs)
      return res.status(400).json({ message: `Proposed solution with id #${psId} not found` });
    // update proposed solution
    await prisma.proposed_Solution.update({
      where: { proposedSolutionId: psId },
      data: {
        approved: true
      }
    });
  }

  // update change request
  const update = await prisma.change_Request.update({
    where: { crId },
    data: {
      reviewer: { connect: { userId: reviewerId } },
      reviewNotes,
      accepted,
      dateReviewed: new Date()
    }
  });

  // TODO: handle errors
  return res.status(200).json({ message: `Change request #${update.crId} successfully reviewed.` });
};

export const createActivationChangeRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;

  // verify user is allowed to create activation change requests
  const user = await prisma.user.findUnique({ where: { userId: body.submitterId } });
  if (!user) {
    return res.status(404).json({ message: `user with id #${body.submitterId} not found` });
  }
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  // verify wbs element exists
  const wbsElement = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        carNumber: body.wbsNum.carNumber,
        projectNumber: body.wbsNum.projectNumber,
        workPackageNumber: body.wbsNum.workPackageNumber
      }
    }
  });

  if (wbsElement === null) {
    return res.status(404).json({ message: `wbs number ${body.wbsNum} not found` });
  }

  const createdCR = await prisma.change_Request.create({
    data: {
      submitter: { connect: { userId: body.submitterId } },
      wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
      type: body.type,
      activationChangeRequest: {
        create: {
          projectLead: { connect: { userId: body.projectLeadId } },
          projectManager: { connect: { userId: body.projectManagerId } },
          startDate: new Date(body.startDate),
          confirmDetails: body.confirmDetails
        }
      }
    },
    include: {
      wbsElement: {
        include: {
          workPackage: {
            include: {
              project: { include: { team: { include: { leader: true } }, wbsElement: true } }
            }
          }
        }
      }
    }
  });

  const team = createdCR.wbsElement.workPackage?.project.team;
  if (team) {
    const slackMsg =
      `${user.firstName} ${user.lastName} wants to activate ${createdCR.wbsElement.name}` +
      ` in ${createdCR.wbsElement.workPackage?.project.wbsElement.name}`;
    await sendSlackChangeRequestNotification(team, slackMsg, createdCR.crId);
  }

  return res.status(200).json({
    message: `Successfully created activation change request #${createdCR.crId}.`
  });
};

export const createStageGateChangeRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;

  // verify user is allowed to create stage gate change requests
  const user = await prisma.user.findUnique({ where: { userId: body.submitterId } });
  if (!user)
    return res.status(404).json({ message: `user with id #${body.submitterId} not found` });
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  // verify wbs element exists
  const wbsElement = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        carNumber: body.wbsNum.carNumber,
        projectNumber: body.wbsNum.projectNumber,
        workPackageNumber: body.wbsNum.workPackageNumber
      }
    }
  });
  if (wbsElement === null) {
    return res.status(404).json({ message: `wbs number ${body.wbsNum} not found` });
  }

  const createdChangeRequest = await prisma.change_Request.create({
    data: {
      submitter: { connect: { userId: body.submitterId } },
      wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
      type: body.type,
      stageGateChangeRequest: {
        create: {
          leftoverBudget: body.leftoverBudget,
          confirmDone: body.confirmDone
        }
      }
    },
    include: {
      wbsElement: {
        include: {
          workPackage: {
            include: {
              project: { include: { team: { include: { leader: true } }, wbsElement: true } }
            }
          }
        }
      }
    }
  });

  const team = createdChangeRequest.wbsElement.workPackage?.project.team;
  if (team) {
    const slackMsg =
      `${user.firstName} ${user.lastName} wants to stage gate ${createdChangeRequest.wbsElement.name}` +
      ` in ${createdChangeRequest.wbsElement.workPackage?.project.wbsElement.name}`;
    await sendSlackChangeRequestNotification(team, slackMsg, createdChangeRequest.crId);
  }

  return res.status(200).json({
    message: `Successfully created stage gate change request #${createdChangeRequest.crId}.`
  });
};

export const createStandardChangeRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;

  // verify user is allowed to create stage gate change requests
  const user = await prisma.user.findUnique({ where: { userId: body.submitterId } });
  if (!user) {
    return res.status(404).json({ message: `user with id #${body.submitterId} not found` });
  }
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  // verify wbs element exists
  const wbsElement = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        carNumber: body.wbsNum.carNumber,
        projectNumber: body.wbsNum.projectNumber,
        workPackageNumber: body.wbsNum.workPackageNumber
      }
    }
  });

  if (!wbsElement) {
    return res.status(404).json({ message: `wbs number ${body.wbsNum} not found` });
  }

  const createdCR = await prisma.change_Request.create({
    data: {
      submitter: { connect: { userId: body.submitterId } },
      wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
      type: body.type,
      scopeChangeRequest: {
        create: {
          what: body.what,
          scopeImpact: body.scopeImpact,
          timelineImpact: body.timelineImpact,
          budgetImpact: body.budgetImpact,
          why: { createMany: { data: body.why } }
        }
      }
    },
    include: {
      wbsElement: {
        include: {
          project: { include: { team: { include: { leader: true } }, wbsElement: true } },
          workPackage: {
            include: {
              project: { include: { team: { include: { leader: true } }, wbsElement: true } }
            }
          }
        }
      }
    }
  });

  const project = createdCR.wbsElement.workPackage?.project || createdCR.wbsElement.project;
  if (project?.team) {
    const slackMsg = `${body.type} CR submitted by ${user.firstName} ${user.lastName} for the ${project.wbsElement.name} project`;
    await sendSlackChangeRequestNotification(
      project.team,
      slackMsg,
      createdCR.crId,
      body.budgetImpact
    );
  }
  return res.status(200).json({
    message: `Successfully created standard change request #${createdCR.crId}.`
  });
};
