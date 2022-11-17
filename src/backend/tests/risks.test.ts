import { project1 } from './test-data/projects.test-data';
import RisksService from '../src/services/risks.services';
import prisma from '../src/prisma/prisma';
import riskQueryArgs from '../src/prisma-query-args/risks.query-args';

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
});
