import { project1 } from './test-data/projects.test-data';
import RisksService from '../src/services/risks.services';
import prisma from '../src/prisma/prisma';
import riskQueryArgs from '../src/prisma-query-args/risks.query-args';
import request from 'supertest';
import { risk1, risk2, editRiskFalsePayload, transformedRisk } from './test-data/risks.test-data';
import { batman } from './test-data/users.test-data';
import * as riskUtils from '../src/utils/risks.utils';

describe('Risks', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getRisksForProject works', async () => {
    const { projectId } = project1;
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);
    jest.spyOn(prisma.risk, 'findMany').mockResolvedValue([]);

    const risks = await RisksService.getRisksForProject(projectId);

    expect(risks).toStrictEqual([]);
    expect(prisma.risk.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.findMany).toHaveBeenCalledWith({ where: { projectId }, ...riskQueryArgs });
    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { projectId } });
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(risk2);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(risk2);
    jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);

    const resolved = true;
    const detail = 'detail';
    const res = await RisksService.editRisk(batman, 'riskId', detail, resolved);

    expect(res).toStrictEqual(risk2);
    expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledWith({
      where: { id: risk2.id },
      data: {
        detail,
        isResolved: resolved,
        resolvedByUserId: batman.userId,
        resolvedAt: new Date()
      },
      ...riskQueryArgs
    });
  });

  // test('the original risk was resolved and the payload is trying to unresolve it', async () => {
  //   jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(risk1);
  //   jest.spyOn(prisma.risk, 'update').mockResolvedValue(risk1);
  //   jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);

  //   const res = await request(app).post('/edit').send(editRiskFalsePayload);

  //   const { dateCreated, ...rest } = res.body;
  //   const { dateCreated: aaa, ...restOfTransformedRisk } = transformedRisk;

  //   expect(res.statusCode).toBe(200);
  //   expect(restOfTransformedRisk).toEqual(rest);

  //   expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
  //   expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  // });

  // test('the original risk and payload have the same resolved value', async () => {
  //   jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(risk2);
  //   jest.spyOn(prisma.risk, 'update').mockResolvedValue(risk2);
  //   jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);

  //   const res = await request(app).post('/edit').send(editRiskFalsePayload);

  //   const { dateCreated, ...rest } = res.body;
  //   const { dateCreated: aaa, ...restOfTransformedRisk } = transformedRisk;

  //   expect(res.statusCode).toBe(200);
  //   expect(restOfTransformedRisk).toEqual(rest);

  //   expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
  //   expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  // });
});
