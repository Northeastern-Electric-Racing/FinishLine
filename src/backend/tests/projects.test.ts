import prisma from '../src/prisma/prisma';
import { getHighestProjectNumber } from '../src/utils/projects.utils';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import { aquaman, batman, superman, theVisitor, wonderwoman } from './test-data/users.test-data';
import {
  prismaProject1,
  sharedProject1,
  prismaAssembly1,
  toolMaterial,
  prismaManufacturer1,
  prismaManufacturer2,
  prismaMaterial,
  prismaMaterialType,
  prismaUnit
} from './test-data/projects.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import { primsaTeam2, prismaTeam1 } from './test-data/teams.test-data';
import * as projectTransformer from '../src/transformers/projects.transformer';
import ProjectsService from '../src/services/projects.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import WorkPackagesService from '../src/services/work-packages.services';
import { validateWBS, WbsNumber } from 'shared';
import { Material_Status, User } from '@prisma/client';

vi.mock('../src/utils/projects.utils');
const mockGetHighestProjectNumber = getHighestProjectNumber as jest.Mock<Promise<number>>;

describe('Projects', () => {
  beforeEach(() => {
    vi.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      return { ...prismaChangeRequest1, changes: [] };
    });
    vi.spyOn(projectTransformer, 'default').mockReturnValue(sharedProject1);
    vi.spyOn(WorkPackagesService, 'deleteWorkPackage').mockImplementation(async (_user: User, _wbsNum: WbsNumber) => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('getSingleProject fails given invalid project wbs number', async () => {
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
    ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));
  });

  test('getSingleProject fails when associated wbsElement doesnt exist', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
    ).rejects.toThrow(new NotFoundException('Project', '1.1.0'));
  });

  test('getSingleProject fails when project has been deleted', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
      wbsElement: { ...prismaProject1.wbsElement, dateDeleted: new Date() },
      projectId: prismaProject1.projectId
    } as any);
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
    ).rejects.toThrow(new DeletedException('Project', prismaProject1.projectId));
  });

  test('getSingleProject works', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

    const res = await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 });

    expect(res).toStrictEqual(sharedProject1);
  });

  test('getAllProjects works', async () => {
    vi.spyOn(prisma.project, 'findMany').mockResolvedValue([]);

    const res = await ProjectsService.getAllProjects();

    expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual([]);
  });

  test('createProject fails when unknown teamId provided', async () => {
    vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    await expect(
      async () => await ProjectsService.createProject(batman, 1, 2, 'name', 'summary', ['teamId'])
    ).rejects.toThrow(new NotFoundException('Team', 'teamId'));
  });

  test('createProject works', async () => {
    mockGetHighestProjectNumber.mockResolvedValue(0);
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    vi.spyOn(prisma.wBS_Element, 'create').mockResolvedValue(prismaWbsElement1);

    const res = await ProjectsService.createProject(batman, 1, 2, 'name', 'summary', []);

    expect(res).toStrictEqual({
      carNumber: prismaWbsElement1.carNumber,
      projectNumber: prismaWbsElement1.projectNumber,
      workPackageNumber: prismaWbsElement1.workPackageNumber
    });
  });

  describe('setProjectTeam', () => {
    test('setProjectTeam fails given invalid project wbs number', async () => {
      await expect(
        async () =>
          await ProjectsService.setProjectTeam(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 1 }, 'teamId')
      ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));
    });

    test('setProjectTeam fails when the team is not found', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId')
      ).rejects.toThrow(new NotFoundException('Team', 'teamId'));
    });

    test('setProjectTeam fails with no permission from submitter (guest)', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(
            wonderwoman,
            { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
            'teamId'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set project teams'));
    });

    test('setProjectTeam fails with no permission from submitter (leadership)', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(aquaman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId')
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set project teams'));
    });

    test('setProjectTeam works if the submitter is not an admin but is the head of the team', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...prismaTeam1, headId: aquaman.userId });
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      // no error, no return value
      await ProjectsService.setProjectTeam(aquaman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId');
    });
  });

  describe('deleteProject', () => {
    test('deleteProject works correctly', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.work_Package, 'findMany').mockResolvedValue([]);

      const res = await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 });

      expect(res).toStrictEqual(sharedProject1);
      expect(prisma.project.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
    });

    test('deleteProject fails when bad role', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.deleteProject(wonderwoman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete projects'));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });

    test('deleteProject fails when wp, not project, given', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () => await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
      ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });

    test('deleteProject fails when project not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

      await expect(
        async () => await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new NotFoundException('Project', '1.1.0'));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });

    test('deleteProject fails when project has been deleted', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement, dateDeleted: new Date() },
        projectId: prismaProject1.projectId
      } as any);
      await expect(
        async () => await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new DeletedException('Project', prismaProject1.projectId));
    });
  });

  describe('toggleFavorite', () => {
    test('fails when project does not exist', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.user, 'update').mockResolvedValue(batman);

      const fakeProjectWBS = '100.100.0';
      await expect(() => ProjectsService.toggleFavorite(validateWBS(fakeProjectWBS), batman)).rejects.toThrow(
        new NotFoundException('Project', fakeProjectWBS)
      );
      expect(prisma.project.findFirst).toBeCalledTimes(1);
      expect(prisma.user.update).toBeCalledTimes(0);
    });

    test('fails when wbs num is not a project', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

      const fakeProjectWBS = '100.100.100';
      await expect(() => ProjectsService.toggleFavorite(validateWBS(fakeProjectWBS), batman)).rejects.toThrow(
        new HttpException(400, `${fakeProjectWBS} is not a valid project WBS #!`)
      );
      expect(prisma.project.findFirst).toBeCalledTimes(0);
    });

    test('fails when project has been deleted', async () => {
      const deletedWbsElement = { ...prismaProject1.wbsElement, dateDeleted: new Date() };
      // console.log(wbsElement);
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({ ...prismaProject1, wbsElement: deletedWbsElement } as any);

      const query = '1.1.0';
      await expect(() => ProjectsService.toggleFavorite(validateWBS(query), batman)).rejects.toThrow(
        new DeletedException('Project', prismaProject1.projectId)
      );
      expect(prisma.project.findFirst).toBeCalledTimes(1);
    });

    test('toggles successfully', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({ ...prismaProject1, favoritedBy: [] } as any);
      vi.spyOn(prisma.user, 'update').mockResolvedValue(batman);

      const res = await ProjectsService.toggleFavorite(validateWBS('1.1.0'), batman);

      expect(res).toBe(sharedProject1);
      expect(prisma.project.findFirst).toBeCalledTimes(1);
      expect(prisma.user.update).toBeCalledTimes(1);
    });
  });

  describe('createAssembly', () => {
    test('createAssembly fails given invalid project wbs number', async () => {
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'new assembly',
            batman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 1
            },
            'file.txt'
          )
      ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));
    });

    test('createAssembly fails when associated wbsElement doesnt exist', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'new assembly',
            batman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 0
            },
            'file.txt'
          )
      ).rejects.toThrow(new NotFoundException('Project', '1.1.0'));
    });

    test('createAssembly fails when project has been deleted', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement, dateDeleted: new Date() },
        projectId: prismaProject1.projectId
      } as any);
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'new assembly',
            batman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 0
            },
            'file.txt'
          )
      ).rejects.toThrow(new DeletedException('Project', prismaProject1.projectId));
    });

    test('createAssembly fails if name is not unique', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement },
        projectId: prismaProject1.projectId
      } as any);
      vi.spyOn(prisma.assembly, 'findUnique').mockResolvedValue({ ...prismaAssembly1, name: 'a1' });

      // no error, no return value
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'a1',
            batman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 0
            },
            'file.txt'
          )
      ).rejects.toThrow(new HttpException(400, `a1 already exists as an assembly!`));
    });

    test('createAssembly fails when no permissions', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement, dateDeleted: '' },
        projectId: prismaProject1.projectId,
        teams: [{ prismaTeam1, leads: [], members: [] }]
      } as any);
      vi.spyOn(prisma.assembly, 'findUnique').mockResolvedValue(null);
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'new assembly',
            wonderwoman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 0
            },
            'file.txt'
          )
      ).rejects.toThrow(new AccessDeniedException(`Users must be admin, or assigned to the team to create assemblies`));
    });

    test('createAssembly fails when no permissions - leadership', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement, dateDeleted: '' },
        projectId: prismaProject1.projectId,
        teams: [{ prismaTeam1, leads: [], members: [] }]
      } as any);
      vi.spyOn(prisma.assembly, 'findUnique').mockResolvedValue(null);
      await expect(
        async () =>
          await ProjectsService.createAssembly(
            'new assembly',
            aquaman,
            {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 0
            },
            'file.txt'
          )
      ).rejects.toThrow(new AccessDeniedException(`Users must be admin, or assigned to the team to create assemblies`));
    });

    test('createAssembly works if the submitter is admin', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue({
        wbsElement: { ...prismaProject1.wbsElement, dateDeleted: '' },
        projectId: prismaProject1.projectId,
        teams: [{ prismaTeam1, leads: [], members: [] }]
      } as any);
      vi.spyOn(prisma.assembly, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.assembly, 'create').mockResolvedValue(prismaAssembly1);

      // no error, no return value
      await ProjectsService.createAssembly(
        'new assembly',
        batman,
        {
          carNumber: 1,
          projectNumber: 1,
          workPackageNumber: 0
        },
        'file.txt'
      );
    });

    test('createAssembly works if the submitter is on the team', async () => {
      mockGetHighestProjectNumber.mockResolvedValue(0);
      vi.spyOn(prisma.assembly, 'create').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findUnique').mockResolvedValue(null);

      // no error, no return value
      await ProjectsService.createAssembly(
        'new assembly',
        superman,
        {
          carNumber: 1,
          projectNumber: 1,
          workPackageNumber: 0
        },
        'file.txt'
      );
    });
  });

  describe('Materials', () => {
    test('createMaterial fails when project is not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          batman,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new NotFoundException('Project', '1.1.1'));
    });
    test('createMaterial fails when assembly is not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          batman,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new NotFoundException('Assembly', 'assemblyName'));
    });
    test('createMaterial fails when material type is not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.material_Type, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          batman,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new NotFoundException('Material Type', 'type'));
    });
    test('createMaterial fails when manufacturer is not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.material_Type, 'findFirst').mockResolvedValue(prismaMaterialType);
      vi.spyOn(prisma.manufacturer, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          batman,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new NotFoundException('Manufacturer', 'manufacturer'));
    });
    test('createMaterial fails when unit is not found', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.material_Type, 'findFirst').mockResolvedValue(prismaMaterialType);
      vi.spyOn(prisma.manufacturer, 'findFirst').mockResolvedValue(prismaManufacturer2);
      vi.spyOn(prisma.unit, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          batman,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new NotFoundException('Unit', 'FT'));
    });
    test('createMaterial fails if the creator does not have perms', async () => {
      const customProject = { ...prismaProject1, teams: [primsaTeam2] };
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(customProject);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.material_Type, 'findFirst').mockResolvedValue(prismaMaterialType);
      vi.spyOn(prisma.manufacturer, 'findFirst').mockResolvedValue(prismaManufacturer2);
      vi.spyOn(prisma.unit, 'findFirst').mockResolvedValue(prismaUnit);
      vi.spyOn(prisma.material, 'findFirst').mockResolvedValue(null);

      await expect(() =>
        ProjectsService.createMaterial(
          theVisitor,
          'material',
          Material_Status.ORDERED,
          'type',
          'manufacturer',
          'partNum',
          6,
          'FT',
          800,
          400,
          'https://www.google.com',
          'none',
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          'assemblyName',
          'file'
        )
      ).rejects.toThrow(new AccessDeniedException('create materials'));
    });
    test('createMaterial works', async () => {
      vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.assembly, 'findFirst').mockResolvedValue(prismaAssembly1);
      vi.spyOn(prisma.material_Type, 'findFirst').mockResolvedValue(prismaMaterialType);
      vi.spyOn(prisma.manufacturer, 'findFirst').mockResolvedValue(prismaManufacturer2);
      vi.spyOn(prisma.unit, 'findFirst').mockResolvedValue(prismaUnit);
      vi.spyOn(prisma.material, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.material, 'create').mockResolvedValue(prismaMaterial);

      const res = await ProjectsService.createMaterial(
        batman,
        'material',
        Material_Status.ORDERED,
        prismaMaterialType.name,
        prismaManufacturer2.name,
        'partNum',
        6,
        'FT',
        800,
        400,
        'https://www.google.com',
        'none',
        { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
        'assemblyName',
        'file'
      );

      expect(res).toBeDefined();
    });
  });

  describe('Manufacturer Tests', () => {
    test('createManufacturer throws an error if user is a guest', async () => {
      await expect(ProjectsService.createManufacturer(wonderwoman, 'NAME')).rejects.toThrow(
        new AccessDeniedGuestException('create manufacturers')
      );
    });

    test('createManufacturer throws an error if manufacturer already exists', async () => {
      vi.spyOn(prisma.manufacturer, 'findUnique').mockResolvedValue(prismaManufacturer1);

      await expect(ProjectsService.createManufacturer(batman, 'Manufacturer1')).rejects.toThrow(
        new HttpException(400, 'Manufacturer1 already exists as a manufacturer!')
      );
    });

    test('createManufacturer works as intended and successfully returns correct name and creator ID', async () => {
      vi.spyOn(prisma.manufacturer, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.manufacturer, 'create').mockResolvedValue(prismaManufacturer1);

      const manufacturer = await ProjectsService.createManufacturer(batman, 'Manufacturer1');

      expect(manufacturer.name).toBe(prismaManufacturer1.name);
      expect(manufacturer.creatorId).toBe(prismaManufacturer1.creatorId);
    });

    test('Get all Manufacturer works', async () => {
      vi.spyOn(prisma.manufacturer, 'findMany').mockResolvedValue([]);

      const res = await ProjectsService.getAllManufacturers(batman);

      expect(prisma.manufacturer.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });

    test('Get all Manufacturer fails from guest', async () => {
      vi.spyOn(prisma.manufacturer, 'findMany').mockResolvedValue([]);

      await expect(ProjectsService.getAllManufacturers(theVisitor)).rejects.toThrow(
        new AccessDeniedGuestException('Get Manufacturers')
      );
    });
  });

  describe('materialType', () => {
    test('Create material type fails if user is not leader', async () => {
      await expect(ProjectsService.createMaterialType('Tools', wonderwoman)).rejects.toThrow(
        new AccessDeniedException('Only leadership or above can create a material type')
      );
    });

    test('Create material type fails if the material type with the given name already exists', async () => {
      vi.spyOn(prisma.material_Type, 'findUnique').mockResolvedValue(toolMaterial);

      await expect(ProjectsService.createMaterialType('NERSoftwareTools', batman)).rejects.toThrow(
        new HttpException(400, 'The following material type already exists: NERSoftwareTools')
      );
    });

    test('Create material type works', async () => {
      vi.spyOn(prisma.material_Type, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.material_Type, 'create').mockResolvedValue(toolMaterial);

      const materialType = await ProjectsService.createMaterialType('NERSoftwareTools', batman);
      expect(materialType.name).toBe('NERSoftwareTools');
      expect(prisma.material_Type.create).toBeCalledTimes(1);
    });

    test('Get all Material Types fails from guest', async () => {
      vi.spyOn(prisma.material_Type, 'findMany').mockResolvedValue([]);

      await expect(ProjectsService.getAllMaterialTypes(theVisitor)).rejects.toThrow(
        new AccessDeniedGuestException('Get Material Types')
      );
    });

    test('Get all Material Types works', async () => {
      vi.spyOn(prisma.material_Type, 'findMany').mockResolvedValue([]);

      const res = await ProjectsService.getAllMaterialTypes(batman);

      expect(prisma.material_Type.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
  });
});
