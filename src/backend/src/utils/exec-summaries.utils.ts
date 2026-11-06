/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import prisma from '../prisma/prisma.js';
import { HttpException } from './errors.utils.js';
import { isUserOnTeam } from './teams.utils.js';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';

const getOpsTeam = async (organizationId: string) => {
  const opsTeam = await prisma.team.findFirst({
    where: { operationsTeam: true, organizationId },
    include: {
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId),
      members: getUserQueryArgs(organizationId)
    }
  });

  if (!opsTeam) throw new HttpException(500, 'Ops team does not exist!');
  return opsTeam;
};

/**
 * Determines if a user is part of the ops team.
 *
 * Modeled after isUserOnFinanceTeam in reimbursement-requests.utils.ts as requested
 *
 * @param user the user to authenticate
 * @param organizationId the organization id to check if the user is on the ops team
 * @returns whether the user is on the ops team
 * @throws {HttpException} if the ops team is not found in the database
 */
export const isUserOnOpsTeam = async (user: User, organizationId: string): Promise<boolean> => {
  return isUserOnTeam(await getOpsTeam(organizationId), user);
};
