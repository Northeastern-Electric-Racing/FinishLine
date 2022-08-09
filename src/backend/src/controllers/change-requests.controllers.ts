import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import {
  changeRequestRelationArgs,
  changeRequestTransformer
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
  const { reviewerId, crId, reviewNotes, accepted } = body;

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

  const createdChangeRequest = await prisma.change_Request.create({
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
    }
  });

  return res.status(200).json({
    message: `Successfully created activation change request #${createdChangeRequest.crId}.`
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
    }
  });

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

  const createdChangeRequest = await prisma.change_Request.create({
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
    }
  });

  return res.status(200).json({
    message: `Successfully created standard change request #${createdChangeRequest.crId}.`
  });
};
