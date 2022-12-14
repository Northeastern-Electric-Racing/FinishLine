import { project1 } from './test-data/projects.test-data';
import RisksService from '../src/services/risks.services';
import prisma from '../src/prisma/prisma';
import riskQueryArgs from '../src/prisma-query-args/risks.query-args';
import { prismaRisk1, prismaRisk2, sharedRisk1 } from './test-data/risks.test-data';
import { batman } from './test-data/users.test-data';
import * as riskUtils from '../src/utils/risks.utils';
import * as riskTransformer from '../src/transformers/risks.transformer';

describe('Risks', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');
  beforeEach(() => {
    jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);
    jest.spyOn(riskTransformer, 'default').mockReturnValue(sharedRisk1);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getRisksForProject works', async () => {
    const { projectId } = project1;
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);
    jest.spyOn(prisma.risk, 'findMany').mockResolvedValue([]);

    const risks = await RisksService.getRisksForProject(projectId);

    expect(risks).toStrictEqual([]);
    expect(prisma.risk.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
  });

  describe('editRisk', () => {
    test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
      jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(prismaRisk2);
      jest.spyOn(prisma.risk, 'update').mockResolvedValue(prismaRisk2);

      const riskId = 'riskId';
      const resolved = true;
      const detail = 'detail';
      const res = await RisksService.editRisk(batman, riskId, detail, resolved);

      expect(res).toStrictEqual(sharedRisk1);
      expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledWith({
        where: { id: riskId },
        data: {
          detail,
          isResolved: resolved,
          resolvedByUserId: batman.userId,
          resolvedAt: new Date()
        },
        ...riskQueryArgs
      });
    });

    test('the original risk was resolved and the payload is trying to unresolve it', async () => {
      jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(prismaRisk1);
      jest.spyOn(prisma.risk, 'update').mockResolvedValue(prismaRisk1);
      jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);

      const riskId = 'riskId';
      const resolved = false;
      const detail = 'detail';
      const res = await RisksService.editRisk(batman, riskId, detail, resolved);

      expect(res).toStrictEqual(sharedRisk1);
      expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledWith({
        where: { id: riskId },
        data: {
          detail,
          isResolved: resolved,
          resolvedByUserId: null,
          resolvedAt: null
        },
        ...riskQueryArgs
      });
    });

    test('the original risk and payload have the same resolved value', async () => {
      jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(prismaRisk2);
      jest.spyOn(prisma.risk, 'update').mockResolvedValue(prismaRisk2);
      jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);

      const riskId = 'riskId';
      const resolved = false;
      const detail = 'detail';
      const res = await RisksService.editRisk(batman, riskId, detail, resolved);

      expect(res).toStrictEqual(sharedRisk1);
      expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledTimes(1);
      expect(prisma.risk.update).toHaveBeenCalledWith({
        where: { id: riskId },
        data: {
          detail
        },
        ...riskQueryArgs
      });
    });
  });
});
