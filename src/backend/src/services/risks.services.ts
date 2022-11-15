import { Role, User } from '@prisma/client';
import { Risk } from 'shared';
import prisma from '../prisma/prisma';
import { throwAccessDeniedError, throwNotFoundError } from '../utils/response.utils';
import { riskQueryArgs, riskTransformer } from '../utils/risks.utils';

/**
 * Gets all the risks for the given project
 * @param projectId the project to get the risks for
 * @returns a list of risks
 * @throws if the given project doesn't exist
 */
export const getRisksForProject = async (projectId: number): Promise<Risk[]> => {
  const requestedProject = await prisma.project.findUnique({ where: { projectId } });
  if (!requestedProject) throwNotFoundError('Project', projectId);

  const risks = await prisma.risk.findMany({ where: { projectId }, ...riskQueryArgs });

  return risks.map(riskTransformer);
};

/**
 * Creates a Risk in the database
 * @param user the user creating the risk
 * @param projectId the project to create the risk for
 * @param detail the detail (description) of the risk
 * @returns the id of the successfully created risk
 * @throws if the user does not have access to create a risk
 */
export const createRisk = async (user: User, projectId: number, detail: string): Promise<string> => {
  if (user.role === Role.GUEST) throwAccessDeniedError('Guests cannot create risks!');

  const createdRisk = await prisma.risk.create({
    data: {
      project: { connect: { projectId } },
      detail,
      createdBy: { connect: { userId: user.userId } }
    }
  });

  return createdRisk.id;
};
