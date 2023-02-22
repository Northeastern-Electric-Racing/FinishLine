import prisma from '../src/prisma/prisma';
import { projectTransformer } from '../src/utils/projects.utils';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import { batman, wonderwoman } from './test-data/users.test-data';
import { project1, sharedProject1 } from './test-data/projects.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import ProjectsService from '../src/services/projects.services';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { NotFoundException, AccessDeniedException, HttpException } from '../src/utils/errors.utils';

//jest.mock('../src/utils/projects.utils');
//const mockGetHighestProjectNumber = getHighestProjectNumber as jest.Mock<Promise<number>>;
//const mockProjectTransformer = projectTransformer as jest.Mock;

describe('Projects', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');
  beforeEach(() => {
    jest.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      return prismaChangeRequest1;
    });
    jest.spyOn(projectTransformer, 'default').mockReturnValue(sharedProject1);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET ALL PROJECTS

  test('getAllProjects works', async () => {
    jest.spyOn(prisma.project, 'findMany').mockResolvedValue([]);

    const projects = await ProjectsService.getAllProjects();

    expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
    expect(projects).toStrictEqual([]);
  });

  // GET SINGLE PROJECT

  test('getSingleProject fails when wbsNumber with workPackageNumber not equal to 0 is passed', async () => {
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 2, projectNumber: 2, workPackageNumber: 2 })
    ).rejects.toThrow(new HttpException(404, 'WBS Number 2.2.2 is not a valid project WBS #!'));
  });

  test('getSingleProject fails when null project provided', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 2, projectNumber: 2, workPackageNumber: 0 })
    ).rejects.toThrow(new NotFoundException('Project', '2.2.0'));
  });

  test('getSingleProject fails when dateDeleted of project is not null', async () => {
    project1.wbsElement.dateDeleted = null;
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(project1);

    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 2, projectNumber: 2, workPackageNumber: 0 })
    ).rejects.toThrow(new AccessDeniedException('This project has been deleted!'));
  });

  test('getSingleProject works', async () => {
    const { wbsElement } = project1;
    jest.spyOn(prisma.wBS_Element, 'findFirst').mockResolvedValue(wbsElement);

    const project = await ProjectsService.getSingleProject(wbsElement);

    expect(prisma.wBS_Element.findFirst).toHaveBeenCalledTimes(1);
    expect(project).toStrictEqual(sharedProject1);
  });

  // CREATE PROJECT

  test('createProject fails when unknown team id provided', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(async () => await ProjectsService.createProject(batman, 'teamId', 1, 'name', 'summary', 2)).rejects.toThrow(
      new NotFoundException('Team', 'teamId')
    );
  });

  test('createProject fails when user role is a guest', async () => {
    await expect(
      async () => await ProjectsService.createProject(wonderwoman, 'teamId', 1, 'name', 'summary', 2)
    ).rejects.toThrow(new AccessDeniedException());
  });

  test('createProject works', async () => {
    const { teamId, wbsElement, summary } = project1;
    const { carNumber, name } = wbsElement;
    const crId = 10;
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.wBS_Element, 'create').mockResolvedValue({
      ...prismaWbsElement1
    });

    const teamIdNotNull = teamId as string;
    const wbsString = await ProjectsService.createProject(batman, teamIdNotNull, carNumber, name, summary, crId);

    expect(wbsString).toStrictEqual(
      `${prismaWbsElement1.carNumber}.${prismaWbsElement1.projectNumber}.${prismaWbsElement1.workPackageNumber}`
    );
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wBS_Element.create).toHaveBeenCalledTimes(1);
  });

  // EDIT PROJECT

  test('editProject works', async () => {
    const { projectId, budget, summary, rules, googleDriveFolderLink, slideDeckLink, bomLink, taskListLink, wbsElement } =
      project1;
    const { name } = wbsElement;
    const crId = 10;
    const goals = [];
    const features = [];
    const otherConstraints = [];
    const projectLead = 10;
    const projectManager = 11;

    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);
    jest.spyOn(prisma.project, 'update').mockResolvedValue(project1);

    await ProjectsService.editProject(
      batman,
      projectId,
      crId,
      batman.userId,
      budget,
      summary,
      rules,
      goals,
      features,
      otherConstraints,
      name,
      googleDriveFolderLink,
      slideDeckLink,
      bomLink,
      taskListLink,
      projectLead,
      projectManager
    );

    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledTimes(1);
  });

  test('editProject fails when user role is a guest', async () => {
    await expect(
      async () =>
        await ProjectsService.editProject(
          wonderwoman,
          1,
          2,
          wonderwoman.userId,
          200,
          'sum',
          [],
          [],
          [],
          [],
          'name',
          'link1',
          'link2',
          'link3',
          'link4',
          2,
          5
        )
    ).rejects.toThrow(new AccessDeniedException());
  });

  test('editProject fails when null project provided', async () => {
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    await expect(
      async () =>
        await ProjectsService.editProject(
          wonderwoman,
          1,
          2,
          wonderwoman.userId,
          200,
          'sum',
          [],
          [],
          [],
          [],
          'name',
          'link1',
          'link2',
          'link3',
          'link4',
          2,
          5
        )
    ).rejects.toThrow(new NotFoundException('Project', 'projectId'));
  });

  test('editProject fails when dateDeleted of project is not null', async () => {
    project1.wbsElement.dateDeleted = null;
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);

    await expect(
      async () =>
        await ProjectsService.editProject(
          wonderwoman,
          1,
          2,
          wonderwoman.userId,
          200,
          'sum',
          [],
          [],
          [],
          [],
          'name',
          'link1',
          'link2',
          'link3',
          'link4',
          2,
          5
        )
    ).rejects.toThrow(new HttpException(400, 'Cannot edit a deleted project!'));
  });

  // SET PROJECT

  test('setProjectTeam works', async () => {
    const { wbsElement, teamId } = project1;

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(project1);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);

    await ProjectsService.setProjectTeam(wbsElement, teamId, batman);

    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledTimes(1);
  });

  test('setProjectTeam fails when user role is a guest', async () => {
    await expect(
      async () =>
        await ProjectsService.setProject(
          wonderwoman,
          1,
          2,
          wonderwoman.userId,
          200,
          'sum',
          [],
          [],
          [],
          [],
          'name',
          'link1',
          'link2',
          'link3',
          'link4',
          2,
          5
        )
    ).rejects.toThrow(new AccessDeniedException());
  });
});
