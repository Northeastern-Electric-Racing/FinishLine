import { Manufacturer, MaterialType, Project, validateWBS, WbsNumber, wbsPipe } from 'shared';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { getCurrentUser } from '../utils/auth.utils';
import ProjectsService from '../services/projects.services';
import BillOfMaterialsService from '../services/boms.services';

export default class ProjectsController {
  static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const includeDeleted = req.params.deleted === 'true';
      const projects: Project[] = await ProjectsService.getAllProjects(req.organization, includeDeleted);
      return res.status(200).json(projects);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);

      const project: Project = await ProjectsService.getSingleProject(wbsNumber, req.organization);

      return res.status(200).json(project);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user: User = await getCurrentUser(res);
      const { name, crId, carNumber, teamIds, budget, summary, leadId, managerId, links, descriptionBullets } = req.body;

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
        req.organization
      );

      return res.status(200).json(createdProject);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user = await getCurrentUser(res);
      const { projectId, crId, name, budget, summary, descriptionBullets, links, leadId, managerId } = req.body;
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
        req.organization
      );

      return res.status(200).json(editedProject);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setProjectTeam(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user: User = await getCurrentUser(res);
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const { teamId } = req.body;

      await ProjectsService.setProjectTeam(user, wbsNumber, teamId, req.organization);

      return res.status(200).json({ message: `Project ${wbsPipe(wbsNumber)}'s teams successfully updated.` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user: User = await getCurrentUser(res);
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const deletedProject: Project = await ProjectsService.deleteProject(user, wbsNumber, req.organization);
      return res.status(200).json(deletedProject);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const user = await getCurrentUser(res);

      const targetProject = await ProjectsService.toggleFavorite(wbsNum, user, req.organization);

      return res.status(200).json(targetProject);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllLinkTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const linkTypes = await ProjectsService.getAllLinkTypes(req.organization);
      return res.status(200).json(linkTypes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createLinkType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user: User = await getCurrentUser(res);
      const { name, iconName, required } = req.body;

      const newLinkType = await ProjectsService.createLinkType(user, name, iconName, required, req.organization);
      return res.status(200).json(newLinkType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const { name, pdmFileName } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const createAssembly = await BillOfMaterialsService.createAssembly(name, user, wbsNum, req.organization, pdmFileName);
      return res.status(200).json(createAssembly);
    } catch (error: unknown) {
      return next(error);
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
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
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
        req.organization,
        notes,
        assemblyId,
        pdmFileName,
        unitName
      );
      return res.status(200).json(material);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const createdManufacturer = await BillOfMaterialsService.createManufacturer(user, name, req.organization);
      return res.status(200).json(createdManufacturer);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { manufacturerName } = req.params;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const deletedManufacturer = await BillOfMaterialsService.deleteManufacturer(user, manufacturerName, req.organization);
      return res.status(200).json(deletedManufacturer);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { unitId } = req.params;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const deletedUnit = await BillOfMaterialsService.deleteUnit(user, unitId, req.organization);
      return res.status(200).json(deletedUnit);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllManufacturers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const manufacturers: Manufacturer[] = await BillOfMaterialsService.getAllManufacturers(user, req.organization);
      return res.status(200).json(manufacturers);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllMaterialTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const materialTypes: MaterialType[] = await BillOfMaterialsService.getAllMaterialTypes(user, req.organization);
      return res.status(200).json(materialTypes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const createdMaterialType = await BillOfMaterialsService.createMaterialType(name, user, req.organization);
      return res.status(200).json(createdMaterialType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async assignMaterialAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;
      const { assemblyId } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const updatedMaterial = await BillOfMaterialsService.assignMaterialAssembly(
        user,
        materialId,
        req.organization,
        assemblyId
      );
      return res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const { assemblyId } = req.params;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const deletedAssembly = await BillOfMaterialsService.deleteAssembly(assemblyId, user, req.organization);
      return res.status(200).json(deletedAssembly);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialTypeName } = req.params;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const deletedMaterial = await BillOfMaterialsService.deleteMaterialType(user, materialTypeName, req.organization);
      return res.status(200).json(deletedMaterial);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;
      const user: User = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const updatedMaterial = await BillOfMaterialsService.deleteMaterial(user, materialId, req.organization);
      return res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      return next(error);
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
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
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
        req.organization,
        notes,
        unitName,
        assemblyId,
        pdmFileName
      );
      return res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const units = await BillOfMaterialsService.getAllUnits(user, req.organization);
      return res.status(200).json(units);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const createdUnit = await BillOfMaterialsService.createUnit(name, user, req.organization);
      return res.status(200).json(createdUnit);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { assemblyId } = req.params;
      const { name, pdmFileName } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const updatedAssembly = await BillOfMaterialsService.editAssembly(
        user,
        assemblyId,
        req.organization,
        name,
        pdmFileName
      );
      return res.status(200).json(updatedAssembly);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editLinkType(req: Request, res: Response, next: NextFunction) {
    try {
      const { linkTypeName } = req.params;
      const { iconName, required } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const linkTypeUpdated = await ProjectsService.editLinkType(
        linkTypeName,
        iconName,
        required,
        submitter,
        req.organization
      );
      return res.status(200).json(linkTypeUpdated);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
