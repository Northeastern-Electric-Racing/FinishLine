import prisma from '../src/prisma/prisma';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import { batman, wonderwoman } from './test-data/users.test-data';
import { prismaProject1, project1, sharedProject1 } from './test-data/projects.test-data';
import { projectQueryArgs } from '../src/prisma-query-args/projects.query-args';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import ProjectsService from '../src/services/projects.services';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { NotFoundException, AccessDeniedException, HttpException } from '../src/utils/errors.utils';
import teamQueryArgs from '../src/prisma-query-args/teams.query-args';
import { getHighestProjectNumber } from '../src/utils/projects.utils';

const { carNumber, projectNumber, workPackageNumber } = prismaWbsElement1;
const { projectId, budget, summary, teamId, wbsElement } = project1;
const { rules, googleDriveFolderLink, slideDeckLink, bomLink, taskListLink } = prismaProject1;
const { name } = wbsElement;
const crId = 10;
const projectLead = 2;
const projectManager = 5;
const teamIdNotNull = teamId as string;

//jest.mock('../src/utils/projects.utils');
//const mockGetHighestProjectNumber = getHighestProjectNumber as jest.Mock<Promise<number>>;
//const mockProjectTransformer = projectTransformer as jest.Mock;

describe('Projects', () => {
  //const mockDate = new Date('2022-12-25T00:00:00.000Z');
  beforeEach(() => {
    jest.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      return prismaChangeRequest1;
    });
    //jest.spyOn(projectTransformer).mockReturnValue(sharedProject1);
    //jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
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

  test('getAllProjects works 2', async () => {
    jest.spyOn(prisma.project, 'findMany').mockResolvedValue([project1]);

    const projects = await ProjectsService.getAllProjects();

    expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { wbsElement: { dateDeleted: null } },
      ...projectQueryArgs
    });
    expect(projects).toStrictEqual([sharedProject1]);
  });

  // GET SINGLE PROJECT

  test('getSingleProject fails when wbsNumber with workPackageNumber not equal to 0 is passed', async () => {
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber, projectNumber, workPackageNumber })
    ).rejects.toThrow(new HttpException(404, 'WBS Number 1.1.1 is not a valid project WBS #!'));
  });

  test('getSingleProject fails when null project provided', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber, projectNumber, workPackageNumber })
    ).rejects.toThrow(new NotFoundException('Project', `1.1.1`));
  });

  test('getSingleProject fails when dateDeleted of project is not null', async () => {
    project1.wbsElement.dateDeleted = new Date('10/18/2022');
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(project1);

    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber, projectNumber, workPackageNumber })
    ).rejects.toThrow(new AccessDeniedException('This project has been deleted!'));
  });

  test('getSingleProject works', async () => {
    jest.spyOn(prisma.wBS_Element, 'findFirst').mockResolvedValue(wbsElement);

    const project = await ProjectsService.getSingleProject(wbsElement);

    expect(prisma.wBS_Element.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.wBS_Element.findFirst).toHaveBeenCalledWith({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      ...projectQueryArgs
    });
    expect(project).toStrictEqual(sharedProject1);
  });

  // CREATE PROJECT

  test('createProject fails when unknown team id provided', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    await expect(
      async () => await ProjectsService.createProject(batman, teamIdNotNull, carNumber, name, summary, crId)
    ).rejects.toThrow(new NotFoundException('Team', '1'));
  });

  test('createProject fails when user role is a guest', async () => {
    await expect(
      async () => await ProjectsService.createProject(wonderwoman, teamIdNotNull, carNumber, name, summary, crId)
    ).rejects.toThrow(new AccessDeniedException());
  });

  test('createProject works', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.wBS_Element, 'create').mockResolvedValue({
      ...prismaWbsElement1
    });

    const wbsString = await ProjectsService.createProject(batman, teamIdNotNull, carNumber, name, summary, crId);

    expect(wbsString).toStrictEqual(`1.1.1`);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { teamIdNotNull },
      ...teamQueryArgs
    });
    expect(prisma.wBS_Element.create).toHaveBeenCalledTimes(1);

    const maxProjectNumber = await getHighestProjectNumber(carNumber);
    expect(prisma.wBS_Element.create).toHaveBeenCalledWith({
      data: {
        carNumber,
        projectNumber: maxProjectNumber + 1,
        workPackageNumber: 0,
        name,
        project: {
          create: {
            summary,
            teamIdNotNull
          }
        },
        changes: {
          create: {
            changeRequestId: crId,
            implementerId: batman.userId,
            detail: 'New Project Created'
          }
        }
      },
      include: { project: true, changes: true }
    });
  });

  // EDIT PROJECT

  test('editProject works', async () => {
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
      [],
      [],
      [],
      name,
      googleDriveFolderLink,
      slideDeckLink,
      bomLink,
      taskListLink,
      projectLead,
      projectManager
    );

    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: {
        projectId
      },
      include: {
        wbsElement: true,
        goals: true,
        features: true,
        otherConstraints: true
      }
    });
    expect(prisma.project.update).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: {
        wbsElementId: 3
      },
      data: {
        budget,
        summary,
        googleDriveFolderLink,
        slideDeckLink,
        bomLink,
        taskListLink,
        rules,
        wbsElement: {
          update: {
            name,
            projectLeadId: projectLead,
            projectManagerId: projectManager
          }
        }
      },
      ...projectQueryArgs
    });
    expect(prisma.change.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.project.createMany).toHaveBeenCalledWith({
      data: project1.wbsElement.changes
    });
  });

  test('editProject fails when user role is a guest', async () => {
    await expect(
      async () =>
        await ProjectsService.editProject(
          wonderwoman,
          projectId,
          crId,
          wonderwoman.userId,
          budget,
          summary,
          rules,
          [],
          [],
          [],
          name,
          googleDriveFolderLink,
          slideDeckLink,
          bomLink,
          taskListLink,
          projectLead,
          projectManager
        )
    ).rejects.toThrow(new AccessDeniedException());
  });

  test('editProject fails when null project provided', async () => {
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    await expect(
      async () =>
        await ProjectsService.editProject(
          batman,
          projectId,
          crId,
          batman.userId,
          budget,
          summary,
          rules,
          [],
          [],
          [],
          name,
          googleDriveFolderLink,
          slideDeckLink,
          bomLink,
          taskListLink,
          projectLead,
          projectManager
        )
    ).rejects.toThrow(new NotFoundException('Project', 1));
  });

  test('editProject fails when dateDeleted of project is not null', async () => {
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);

    await expect(
      async () =>
        await ProjectsService.editProject(
          batman,
          projectId,
          crId,
          batman.userId,
          budget,
          summary,
          rules,
          [],
          [],
          [],
          name,
          googleDriveFolderLink,
          slideDeckLink,
          bomLink,
          taskListLink,
          projectLead,
          projectManager
        )
    ).rejects.toThrow(new HttpException(400, 'Cannot edit a deleted project!'));
  });

  // SET PROJECT

  test('setProjectTeam works', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(project1);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);
    jest.spyOn(prisma.project, 'update').mockResolvedValue(project1);

    const project = await ProjectsService.setProjectTeam(wbsElement, teamIdNotNull, batman);

    expect(project).toStrictEqual(sharedProject1);
    expect(prisma.project.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      ...projectQueryArgs
    });
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: {
        teamIdNotNull
      }
    });
    expect(prisma.project.update).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { projectId },
      data: { teamIdNotNull }
    });
  });

  test('setProjectTeam fails when user role is a guest', async () => {
    await expect(async () => await ProjectsService.setProjectTeam(wbsElement, teamIdNotNull, wonderwoman)).rejects.toThrow(
      new AccessDeniedException('you must be an admin or the team lead to update the team!')
    );
  });

  test('setProjectTeam fails when unknown team id provided', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    await expect(async () => await ProjectsService.setProjectTeam(wbsElement, teamIdNotNull, wonderwoman)).rejects.toThrow(
      new NotFoundException('Team', 1)
    );
  });

  test('setProjectTeam fails when null project provided', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    await expect(async () => await ProjectsService.setProjectTeam(wbsElement, teamIdNotNull, wonderwoman)).rejects.toThrow(
      new NotFoundException('Project', `1.1.1`)
    );
  });

  test('setProjectTeam fails when wbsNumber with workPackageNumber not equal to 0 is passed', async () => {
    await expect(async () => await ProjectsService.setProjectTeam(wbsElement, teamIdNotNull, wonderwoman)).rejects.toThrow(
      new HttpException(404, 'WBS Number 1.1.1 is not a valid project WBS #!')
    );
  });
});
