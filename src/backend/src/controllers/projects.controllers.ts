import { Manufacturer, MaterialType, Project, validateWBS, WbsNumber, wbsPipe } from 'shared';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { getCurrentUser } from '../utils/auth.utils';
import ProjectsService from '../services/projects.services';
import BillOfMaterialsService from '../services/boms.services';
import { getOrganizationId } from '../utils/utils';

export default class ProjectsController {
  static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const projects: Project[] = await ProjectsService.getAllProjects(organizationId);
      return res.status(200).json(projects);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleProject(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const organizationId = getOrganizationId(req.headers);

      const project: Project = await ProjectsService.getSingleProject(wbsNumber, organizationId);

      return res.status(200).json(project);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { name, crId, carNumber, teamIds, budget, summary, leadId, managerId, links, descriptionBullets } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const createdProject = await ProjectsService.createProject(
        user,
        crId,
        carNumber,
        name,
        summary,
        teamIds,
        budget,
        links,
        descriptionBullets,
        leadId,
        managerId,
        organizationId
      );

      return res.status(200).json(createdProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { projectId, crId, name, budget, summary, descriptionBullets, links, leadId, managerId } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const editedProject: Project = await ProjectsService.editProject(
        user,
        projectId,
        crId,
        name,
        budget,
        summary,
        descriptionBullets,
        links,
        leadId || null,
        managerId || null,
        organizationId
      );

      return res.status(200).json(editedProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setProjectTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const { teamId } = req.body;
      const organizationId = getOrganizationId(req.headers);

      await ProjectsService.setProjectTeam(user, wbsNumber, teamId, organizationId);

      return res.status(200).json({ message: `Project ${wbsPipe(wbsNumber)}'s teams successfully updated.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const organizationId = getOrganizationId(req.headers);

      const deletedProject: Project = await ProjectsService.deleteProject(user, wbsNumber, organizationId);
      res.status(200).json(deletedProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const targetProject = await ProjectsService.toggleFavorite(wbsNum, user, organizationId);

      res.status(200).json(targetProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllLinkTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);

      const linkTypes = await ProjectsService.getAllLinkTypes(organizationId);
      res.status(200).json(linkTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createLinkType(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { name, iconName, required } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const newLinkType = await ProjectsService.createLinkType(user, name, iconName, required, organizationId);
      res.status(200).json(newLinkType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const { name, pdmFileName } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const createAssembly = await BillOfMaterialsService.createAssembly(name, user, wbsNum, pdmFileName, organizationId);
      res.status(200).json(createAssembly);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        assemblyId,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        pdmFileName,
        quantity,
        unitName,
        price,
        subtotal,
        linkUrl,
        notes
      } = req.body;
      const creator = await getCurrentUser(res);
      const wbsNum = validateWBS(req.params.wbsNum);
      const organizationId = getOrganizationId(req.headers);

      const material = await BillOfMaterialsService.createMaterial(
        creator,
        name,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        quantity,
        price,
        subtotal,
        linkUrl,
        wbsNum,
        organizationId,
        notes,
        assemblyId,
        pdmFileName,
        unitName
      );
      return res.status(200).json(material);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const createdManufacturer = await BillOfMaterialsService.createManufacturer(user, name, organizationId);
      res.status(200).json(createdManufacturer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { manufacturerName } = req.params;
      const organizationId = getOrganizationId(req.headers);

      const deletedManufacturer = await BillOfMaterialsService.deleteManufacturer(user, manufacturerName, organizationId);
      res.status(200).json(deletedManufacturer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { unitId } = req.params;
      const organizationId = getOrganizationId(req.headers);

      const deletedUnit = await BillOfMaterialsService.deleteUnit(user, unitId, organizationId);
      res.status(200).json(deletedUnit);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllManufacturers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const manufacturers: Manufacturer[] = await BillOfMaterialsService.getAllManufacturers(user, organizationId);
      return res.status(200).json(manufacturers);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllMaterialTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const materialTypes: MaterialType[] = await BillOfMaterialsService.getAllMaterialTypes(user, organizationId);
      return res.status(200).json(materialTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const createdMaterialType = await BillOfMaterialsService.createMaterialType(name, user, organizationId);
      res.status(200).json(createdMaterialType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async assignMaterialAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;
      const { assemblyId } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedMaterial = await BillOfMaterialsService.assignMaterialAssembly(
        user,
        materialId,
        assemblyId,
        organizationId
      );
      res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const { assemblyId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const deletedAssembly = await BillOfMaterialsService.deleteAssembly(assemblyId, user, organizationId);
      res.status(200).json(deletedAssembly);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialTypeName } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const deletedMaterial = await BillOfMaterialsService.deleteMaterialType(user, materialTypeName, organizationId);
      res.status(200).json(deletedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;
      const user: User = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedMaterial = await BillOfMaterialsService.deleteMaterial(user, materialId, organizationId);
      res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { materialId } = req.params;
      const {
        name,
        assemblyId,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        pdmFileName,
        quantity,
        unitName,
        price,
        subtotal,
        linkUrl,
        notes
      } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const updatedMaterial = await BillOfMaterialsService.editMaterial(
        user,
        materialId,
        name,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        quantity,
        price,
        subtotal,
        linkUrl,
        organizationId,
        notes,
        unitName,
        assemblyId,
        pdmFileName
      );
      res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const units = await BillOfMaterialsService.getAllUnits(user, organizationId);
      res.status(200).json(units);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const createdUnit = await BillOfMaterialsService.createUnit(name, user, organizationId);
      res.status(200).json(createdUnit);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { assemblyId } = req.params;
      const { name, pdmFileName } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const updatedAssembly = await BillOfMaterialsService.editAssembly(user, assemblyId, organizationId, name, pdmFileName);
      res.status(200).json(updatedAssembly);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editLinkType(req: Request, res: Response, next: NextFunction) {
    try {
      const { linkId } = req.params;
      const { iconName, required, linkTypeName } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const linkTypeUpdated = await ProjectsService.editLinkType(
        linkId,
        linkTypeName,
        iconName,
        required,
        submitter,
        organizationId
      );
      res.status(200).json(linkTypeUpdated);
    } catch (error: unknown) {
      next(error);
    }
  }
}
