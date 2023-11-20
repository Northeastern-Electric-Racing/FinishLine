import { Manufacturer, MaterialType, Project, validateWBS, WbsNumber, wbsPipe } from 'shared';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { getCurrentUser } from '../utils/auth.utils';
import ProjectsService from '../services/projects.services';

export default class ProjectsController {
  static async getAllProjects(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects: Project[] = await ProjectsService.getAllProjects();
      return res.status(200).json(projects);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleProject(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);

      const project: Project = await ProjectsService.getSingleProject(wbsNumber);

      return res.status(200).json(project);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { crId, carNumber, name, summary, teamId } = req.body;

      const createdWbsNumber: WbsNumber = await ProjectsService.createProject(user, crId, carNumber, name, summary, [
        teamId
      ]);

      return res.status(200).json(wbsPipe(createdWbsNumber));
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const {
        projectId,
        crId,
        name,
        budget,
        summary,
        rules,
        goals,
        features,
        otherConstraints,
        links,
        projectLeadId,
        projectManagerId
      } = req.body;

      const editedProject: Project = await ProjectsService.editProject(
        user,
        projectId,
        crId,
        name,
        budget,
        summary,
        rules,
        goals,
        features,
        otherConstraints,
        links,
        projectLeadId || null,
        projectManagerId || null
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

      await ProjectsService.setProjectTeam(user, wbsNumber, teamId);

      return res.status(200).json({ message: `Project ${wbsPipe(wbsNumber)}'s teams successfully updated.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);
      const deletedProject: Project = await ProjectsService.deleteProject(user, wbsNumber);
      res.status(200).json(deletedProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const user = await getCurrentUser(res);

      const targetProject = await ProjectsService.toggleFavorite(wbsNum, user);

      res.status(200).json(targetProject);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllLinkTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const linkTypes = await ProjectsService.getAllLinkTypes();
      res.status(200).json(linkTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createAssembly(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);
      const { name, pdmFileName } = req.body;
      const createAssembly = await ProjectsService.createAssembly(name, user, wbsNum, pdmFileName);
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
      const material = await ProjectsService.createMaterial(
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
        notes,
        wbsNum,
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
      const createdManufacturer = await ProjectsService.createManufacturer(user, name);
      res.status(200).json(createdManufacturer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const user: User = await getCurrentUser(res);
      const { manufacturerName } = req.params;
      const deletedManufacturer = await ProjectsService.deleteManufacturer(user, manufacturerName);
      res.status(200).json(deletedManufacturer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllManufacturers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const manufacturers: Manufacturer[] = await ProjectsService.getAllManufacturers(user);
      return res.status(200).json(manufacturers);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllMaterialTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const materialTypes: MaterialType[] = await ProjectsService.getAllMaterialTypes(user);
      return res.status(200).json(materialTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const createdMaterialType = await ProjectsService.createMaterialType(name, user);
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
      const updatedMaterial = await ProjectsService.assignMaterialAssembly(user, materialId, assemblyId);
      res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteAssemblyType(req: Request, res: Response, next: NextFunction) {
    try {
      const { assemblyId } = req.params;
      const user = await getCurrentUser(res);
      const deletedAssembly = await ProjectsService.deleteAssembly(assemblyId, user);
      res.status(200).json(deletedAssembly);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMaterialType(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialTypeId } = req.params;
      const user = await getCurrentUser(res);
      const deletedMaterial = await ProjectsService.deleteMaterialType(materialTypeId, user);
      res.status(200).json(deletedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;
      const user: User = await getCurrentUser(res);
      const updatedMaterial = await ProjectsService.deleteMaterial(user, materialId);
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
      const updatedMaterial = await ProjectsService.editMaterial(
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
}
