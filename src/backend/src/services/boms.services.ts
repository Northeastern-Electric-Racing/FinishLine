import { Material_Status, Material_Type, Organization } from '@prisma/client';
import { Decimal } from 'decimal.js';
import {
  Manufacturer,
  Assembly,
  WbsNumber,
  isAdmin,
  isGuest,
  isLeadership,
  wbsPipe,
  isHead,
  MaterialType,
  Material,
  Unit,
  User
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { isUserPartOfTeams } from '../utils/teams.utils.js';
import ProjectsService from './projects.services.js';
import {
  assemblyTransformer,
  materialPreviewTransformer,
  materialTransformer
} from '../transformers/material.transformer.js';
import manufacturerTransformer from '../transformers/manufacturer.transformer.js';
import { materialTypeTransformer } from '../transformers/material-type.transformer.js';
import {
  getAssemblyQueryArgs,
  getMaterialPreviewQueryArgs,
  getMaterialQueryArgs
} from '../prisma-query-args/bom.query-args.js';
import { getManufacturerQueryArgs } from '../prisma-query-args/manufacturers.query-args.js';
import { getMaterialTypeQueryArgs } from '../prisma-query-args/material-type.query-args.js';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';

export default class BillOfMaterialsService {
  /**
   * Creates a new Material
   * @param creator the user creating the material
   * @param name the name of the material
   * @param status the Material Status of the material
   * @param materialTypeName the name of the Material Type
   * @param linkUrl the url for the material's link as a string
   * @param wbsNumber the WBS number of the project associated with this material
   * @param organization the organization the user is currently in
   * @param manufacturerName the name of the material's manufacturer (optional)
   * @param manufacturerPartNumber the manufacturer part number for the material (optional)
   * @param quantity the quantity of material as a number (optional)
   * @param price the price of the material in whole cents (optional)
   * @param subtotal the subtotal of the price for the material in whole cents (optional)
   * @param notes any notes about the material as a string (optional)
   * @param assemblyId the id of the Assembly for the material (optional)
   * @param pdmFileName the name of the pdm file for the material (optional)
   * @param unitName the name of the Quantity Unit the quantity is measured in (optional)
   * @returns the created material
   */
  static async createMaterial(
    creator: User,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    linkUrl: string,
    wbsNumber: WbsNumber,
    organization: Organization,
    manufacturerName?: string,
    manufacturerPartNumber?: string,
    quantity?: Decimal,
    price?: number,
    subtotal?: number,
    notes?: string,
    assemblyId?: string,
    pdmFileName?: string,
    unitName?: string
  ): Promise<Material> {
    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization);

    if (assemblyId) {
      const assembly = await prisma.assembly.findUnique({ where: { assemblyId } });
      if (!assembly) throw new NotFoundException('Assembly', assemblyId);
      if (assembly.wbsElementId !== project.wbsElementId) throw new HttpException(400, 'Assembly not found on this project');
      if (assembly.dateDeleted) throw new DeletedException('Assembly', assemblyId);
    }

    const materialType = await prisma.material_Type.findUnique({
      where: { uniqueMaterialType: { name: materialTypeName, organizationId: organization.organizationId } }
    });
    if (!materialType) throw new NotFoundException('Material Type', materialTypeName);
    if (materialType.dateDeleted) throw new DeletedException('Material Type', materialTypeName);

    let manufacturer = null;
    if (manufacturerName) {
      manufacturer = await prisma.manufacturer.findUnique({
        where: { uniqueManufacturer: { name: manufacturerName, organizationId: organization.organizationId } }
      });
      if (!manufacturer) throw new NotFoundException('Manufacturer', manufacturerName);
      if (manufacturer.dateDeleted) throw new DeletedException('Manufacturer', manufacturerName);
    }

    let unit = null;
    if (unitName) {
      unit = await prisma.unit.findUnique({
        where: { uniqueUnit: { name: unitName, organizationId: organization.organizationId } }
      });
      if (!unit) throw new NotFoundException('Unit', unitName);
    }

    const perms =
      (await userHasPermission(creator.userId, organization.organizationId, isLeadership)) ||
      isUserPartOfTeams(project.teams, creator);

    if (!perms) throw new AccessDeniedException('create materials');

    const createdMaterial = await prisma.material.create({
      data: {
        userCreatedId: creator.userId,
        name,
        assemblyId,
        status,
        materialTypeId: materialType.id,
        manufacturerId: manufacturer ? manufacturer.id : null,
        manufacturerPartNumber,
        pdmFileName,
        quantity,
        unitId: unit ? unit.id : null,
        price,
        subtotal,
        linkUrl,
        notes,
        dateCreated: new Date(),
        wbsElementId: project.wbsElementId
      },
      ...getMaterialQueryArgs(organization.organizationId)
    });

    return materialTransformer(createdMaterial);
  }

  /**
   * Copy materials to project
   * @param user The user making the copy
   * @param materialIds The ids of the materials to be copied
   * @param destinationProjectId The id of the project to copy the materials to
   * @param organization The organization the user is currently in
   * @returns an array of the newly created material ids
   * @throws errors that will be added here later
   */
  static async copyMaterialsToProject(
    user: User,
    materialIds: string[],
    destinationProjectId: WbsNumber,
    organization: Organization
  ): Promise<string[]> {
    // Fetch materials to be copied
    const materials = await prisma.material.findMany({
      where: {
        materialId: { in: materialIds },
        dateDeleted: null
      },
      ...getMaterialQueryArgs(organization.organizationId)
    });

    if (materials.length !== materialIds.length) throw new NotFoundException('Material', 'Not all materials found');

    const invalidMaterials = materials.filter(
      (material) => material.materialType.organizationId !== organization.organizationId
    );
    if (invalidMaterials.length > 0) throw new HttpException(400, 'All materials must be from the current organization');

    const destinationProject = await ProjectsService.getSingleProjectWithQueryArgs(destinationProjectId, organization);

    const perms =
      (await userHasPermission(user.userId, organization.organizationId, isLeadership)) ||
      isUserPartOfTeams(destinationProject.teams, user);

    if (!perms) throw new AccessDeniedException('Permission to copy materials denied');

    return await prisma.$transaction(async (tx) => {
      const newMaterialIds: string[] = [];

      for (const material of materials) {
        const newMaterial = await tx.material.create({
          data: {
            name: material.name,
            status: Material_Status.NOT_READY_TO_ORDER,
            materialTypeId: material.materialTypeId,
            manufacturerId: material.manufacturerId,
            manufacturerPartNumber: material.manufacturerPartNumber,
            pdmFileName: material.pdmFileName,
            quantity: material.quantity,
            unitId: material.unitId,
            price: material.price,
            subtotal: material.subtotal,
            linkUrl: material.linkUrl,
            notes: material.notes,
            dateCreated: new Date(),
            userCreatedId: user.userId,
            wbsElementId: destinationProject.wbsElementId,
            assemblyId: null,
            isCopied: true
          },
          ...getMaterialQueryArgs(organization.organizationId)
        });

        newMaterialIds.push(newMaterial.materialId);
      }

      return newMaterialIds;
    });
  }

  /**
   * Create an assembly
   * @param name The name of the assembly to be created
   * @param userCreated The user creating the assembly
   * @param wbsElementId The wbsElement that the created assembly is associated with
   * @param organizationId The id of the organization the user is currently in
   * @param pdmFileName optional - The name of the file holding the assembly
   * @returns the project that the user has favorited/unfavorited
   * @throws if the project wbs doesn't exist or is not corresponding to a project
   */
  static async createAssembly(
    name: string,
    userCreated: User,
    wbsNumber: WbsNumber,
    organization: Organization,
    pdmFileName?: string
  ): Promise<Assembly> {
    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization);

    const { teams, wbsElementId } = project;

    if (
      !(await userHasPermission(userCreated.userId, organization.organizationId, isAdmin)) &&
      !isUserPartOfTeams(teams, userCreated)
    )
      throw new AccessDeniedException('Users must be admin, or assigned to the team to create assemblies');

    const userCreatedId = userCreated.userId;

    const assembly = await prisma.assembly.create({
      data: {
        name,
        dateCreated: new Date(),
        userCreatedId,
        wbsElementId,
        pdmFileName
      },
      ...getAssemblyQueryArgs(organization.organizationId)
    });

    return assemblyTransformer(assembly);
  }

  /**
   * Creates a new Manufacturer
   * @param submitter the user who's creating the manufacturer
   * @param name the name of the manufacturer
   * @param organizationId the id of the organization the manufacturer is associated with
   * @returns the newly created manufacturer
   * @throws if the submitter is a guest or the given manufacturer name already exists
   */
  static async createManufacturer(submitter: User, name: string, organization: Organization): Promise<Manufacturer> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create manufacturers');

    const manufacturer = await prisma.manufacturer.findUnique({
      where: {
        uniqueManufacturer: { name, organizationId: organization.organizationId }
      }
    });

    if (manufacturer && manufacturer.dateDeleted) {
      const manufacturer = await prisma.manufacturer.update({
        where: { uniqueManufacturer: { name, organizationId: organization.organizationId } },
        data: {
          dateDeleted: null
        },
        ...getManufacturerQueryArgs(organization.organizationId)
      });

      return manufacturerTransformer(manufacturer);
    } else if (manufacturer) throw new HttpException(400, `${name} already exists as a manufacturer!`);

    const newManufacturer = await prisma.manufacturer.create({
      data: {
        name,
        dateCreated: new Date(),
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getManufacturerQueryArgs(organization.organizationId)
    });

    return manufacturerTransformer(newManufacturer);
  }

  /**
   * Deletes a unit
   * @param user the user who's deleting the unit
   * @param name the name of the unit
   * @param organizationId the id of the organization the unit is associated with
   * @throws if the user is not at least a head, or if the provided name isn't a unit
   * @returns the deleted unit
   */
  static async deleteUnit(user: User, name: string, organization: Organization) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can delete a unit');
    }

    const unit = await prisma.unit.findUnique({
      where: {
        uniqueUnit: { name, organizationId: organization.organizationId }
      }
    });

    if (!unit) throw new NotFoundException('Unit', name);
    if (unit.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Unit');

    const deletedUnit = await prisma.unit.delete({
      where: {
        uniqueUnit: { name, organizationId: organization.organizationId }
      }
    });

    return deletedUnit;
  }

  /**
   * Deletes a manufacturer
   * @param user the user who's deleting the manufacturer
   * @param name the name of the manufacturer
   * @throws if the user is not at least a head, or if the provided name isn't a manufacturer, or if the manufacturer has already been soft-deleted
   * @returns the deleted manufacturer
   */
  static async deleteManufacturer(user: User, name: string, organization: Organization) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can delete a manufacturer');
    }

    const manufacturer = await BillOfMaterialsService.getSingleManufacturerWithQueryArgs(name, organization);

    const deletedManufacturer = await prisma.manufacturer.update({
      where: {
        uniqueManufacturer: { name, organizationId: manufacturer.organizationId }
      },
      data: {
        dateDeleted: new Date()
      }
    });

    return deletedManufacturer;
  }
  /**
   * Get all the manufacturers in the database.
   * @param submitter the user who's getting all manufacturers
   * @param organizationId the id of the organization the manufacturers are associated with
   * @returns all the manufacturers
   */
  static async getAllManufacturers(submitter: User, organization: Organization): Promise<Manufacturer[]> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('Get Manufacturers');
    }

    return (
      await prisma.manufacturer.findMany({
        where: { dateDeleted: null, organizationId: organization.organizationId },
        ...getManufacturerQueryArgs(organization.organizationId)
      })
    ).map(manufacturerTransformer);
  }

  /**
   * Get all the material types in the database.
   * @param submitter the user who's getting all material types
   * @param organizationId the id of the organization the material types are associated with
   * @returns all the material types
   */
  static async getAllMaterialTypes(submitter: User, organization: Organization): Promise<MaterialType[]> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('Get Material Types');
    }

    return (
      await prisma.material_Type.findMany({
        where: { dateDeleted: null, organizationId: organization.organizationId },
        ...getMaterialTypeQueryArgs(organization.organizationId)
      })
    ).map(materialTypeTransformer);
  }

  /**
   * Create a new material type
   * @param name the name of the new material type
   * @param submitter the user who is creating the material type
   * @param organizationId the id of the organization the material type is associated with
   * @throws if the submitter is not a leader or the material type with the given name already exists
   */
  static async createMaterialType(name: string, submitter: User, organization: Organization): Promise<MaterialType> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('Only leadership or above can create a material type');

    const materialType = await prisma.material_Type.findUnique({
      where: {
        uniqueMaterialType: { name, organizationId: organization.organizationId }
      }
    });

    if (materialType && materialType.dateDeleted) {
      const materialType = await prisma.material_Type.update({
        where: { uniqueMaterialType: { name, organizationId: organization.organizationId } },
        data: {
          dateDeleted: null
        },
        ...getMaterialTypeQueryArgs(organization.organizationId)
      });

      return materialTypeTransformer(materialType);
    } else if (materialType) throw new HttpException(400, `The following material type already exists: ${name}`);

    const newMaterialType = await prisma.material_Type.create({
      data: {
        name,
        dateCreated: new Date(),
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getMaterialTypeQueryArgs(organization.organizationId)
    });

    return materialTypeTransformer(newMaterialType);
  }

  /**
   * Assign a material on a project to a different assembly
   * @param submitter the submitter
   * @param materialId the material that will be moved
   * @param organizationId the organization the submitter is in
   * @param assemblyId the assembly to change the material to, or undefined to unassign the material
   * @throws if the submitter does not have the relevant positions
   * @returns the updated material
   */
  static async assignMaterialAssembly(submitter: User, materialId: string, organization: Organization, assemblyId?: string) {
    const material = await BillOfMaterialsService.getSingleMaterialWithQueryArgs(materialId, organization);

    const project = await ProjectsService.getSingleProjectWithQueryArgs(material.wbsElement, organization);

    // Permission: leadership and up, anyone on project team
    if (
      !(
        (await userHasPermission(submitter.userId, project.wbsElement.organizationId, isLeadership)) ||
        isUserPartOfTeams(project.teams, submitter)
      )
    )
      throw new AccessDeniedException(
        `Only leadership or above, or someone on the project's team can assign materials to assemblies`
      );

    //assigning the material to a new assembly
    if (assemblyId) {
      const assembly = await BillOfMaterialsService.getSingleAssemblyWithQueryArgs(assemblyId, organization);

      // Confirm that the assembly's wbsElement is the same as the material's wbsElement
      if (material.wbsElementId !== assembly.wbsElementId)
        throw new HttpException(
          400,
          `The WBS element of the material (${wbsPipe(material.wbsElement)}) and assembly (${wbsPipe(
            assembly.wbsElement
          )}) do not match`
        );
      const updatedMaterial = await prisma.material.update({
        where: { materialId },
        data: { assemblyId }
      });

      return updatedMaterial;
    }
    //unassigning material from an existing assembly
    if (material.assemblyId) {
      await prisma.assembly.update({
        where: { assemblyId: material.assemblyId },
        data: { materials: { disconnect: { materialId } } },
        include: { materials: true }
      });

      const updatedMaterial = await prisma.material.findUnique({
        where: { materialId }
      });

      return updatedMaterial;
    }
    return material;
  }

  /**
   * Deletes an assembly type
   * @param assemblyId the id of the assembly
   * @param submitter the user who is deleting the assembly type
   * @param organizationId the id of the organization the user is currently in
   * @throws if the user is not an admin/head, the assembly does not exist, or has already been deleted
   * @returns
   */
  static async deleteAssembly(assemblyId: string, submitter: User, organization: Organization): Promise<Assembly> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only an Admin or a head can delete an Assembly');

    const assembly = await BillOfMaterialsService.getSingleAssemblyWithQueryArgs(assemblyId, organization);

    const materialPromises = assembly.materials.map(async (material) => {
      return await prisma.material.update({
        where: {
          materialId: material.materialId
        },
        data: {
          assembly: {
            disconnect: true
          }
        }
      });
    });

    await Promise.all(materialPromises);

    const deletedAssembly = await prisma.assembly.update({
      where: {
        assemblyId
      },
      data: {
        userDeletedId: submitter.userId,
        dateDeleted: new Date()
      },
      ...getAssemblyQueryArgs(organization.organizationId)
    });

    return assemblyTransformer(deletedAssembly);
  }

  /**
   * Deletes a material type based on the given Id
   * @param submitter the user who is deleting the material type
   * @param materialTypeName the name of the material type being deleted
   * @param organizationId the id of the organization the user is currently in
   * @throws if the submitter is not an admin/head or if the material type is not found
   * @returns the deleted material type
   */
  static async deleteMaterialType(
    submitter: User,
    materialTypeName: string,
    organization: Organization
  ): Promise<Material_Type> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only an admin or head can delete a material type');
    }

    const materialType = await BillOfMaterialsService.getSingleMaterialTypeWithQueryArgs(materialTypeName, organization);

    const deletedMaterialType = await prisma.material_Type.update({
      where: {
        id: materialType.id
      },
      data: {
        dateDeleted: new Date()
      }
    });

    return deletedMaterialType;
  }

  /**
   * Delete material in the database
   * @param materialId the id of the given material
   * @param currentUser the current user currently accessing the material
   * @param organizationId the id of the organization the user is currently in
   * @returns the deleted material
   * @throws if the user does not have permission, or materidal already deleted
   */
  static async deleteMaterial(currentUser: User, materialId: string, organization: Organization): Promise<Material> {
    if (!(await userHasPermission(currentUser.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('Only Leadership can delete materials');
    }

    const material = await BillOfMaterialsService.getSingleMaterialWithQueryArgs(materialId, organization);

    const deletedMaterial = await prisma.material.update({
      where: { materialId: material.materialId },
      data: { dateDeleted: new Date(), userDeletedId: currentUser.userId },
      ...getMaterialQueryArgs(organization.organizationId)
    });

    return materialTransformer(deletedMaterial);
  }

  /**
   * Update a material
   * @param submitter the submitter of the request
   * @param materialId the material id of the material being edited
   * @param name the name of the edited material
   * @param status the status of the edited material
   * @param materialTypeName the material type of the edited material
   * @param linkUrl the linkUrl of the edited material
   * @param organization the organization the user is currently in
   * @param manufacturerName the manufacturerName of the edited material (optional)
   * @param manufacturerPartNumber the manufacturerPartNumber of the edited material (optional)
   * @param quantity the quantity of the edited material (optional)
   * @param price the price of the edited material (optional)
   * @param subtotal the subtotal of the edited material (optional)
   * @param notes the notes of the edited material (optional)
   * @param unitName the unit name of the edited material (optional)
   * @param assemblyId the assembly id of the edited material (optional)
   * @param pdmFileName the pdm file name of the edited material (optional)
   * @throws if permission denied or material's wbsElement is undefined/deleted
   * @returns the updated material
   */
  static async editMaterial(
    submitter: User,
    materialId: string,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    linkUrl: string,
    organization: Organization,
    manufacturerName?: string,
    manufacturerPartNumber?: string,
    quantity?: Decimal,
    price?: number,
    subtotal?: number,
    notes?: string,
    unitName?: string,
    assemblyId?: string,
    pdmFileName?: string
  ): Promise<Material> {
    const material = await BillOfMaterialsService.getSingleMaterialWithQueryArgs(materialId, organization);

    const project = await ProjectsService.getSingleProjectWithQueryArgs(material.wbsElement, organization);

    const perms =
      (await userHasPermission(submitter.userId, project.wbsElement.organizationId, isLeadership)) ||
      isUserPartOfTeams(project.teams, submitter);

    if (!perms) throw new AccessDeniedException('update material');

    if (assemblyId) {
      const assembly = await BillOfMaterialsService.getSingleAssemblyWithQueryArgs(
        assemblyId,
        project.wbsElement.organization
      );
      if (assembly.wbsElementId !== project.wbsElementId) throw new HttpException(400, 'Assembly not found on this project');
    }

    const materialType = await BillOfMaterialsService.getSingleMaterialTypeWithQueryArgs(materialTypeName, organization);

    let unit = null;
    if (unitName) {
      unit = await prisma.unit.findUnique({
        where: { uniqueUnit: { name: unitName, organizationId: project.wbsElement.organizationId } }
      });
      if (!unit) throw new NotFoundException('Unit', unitName);
    }

    let manufacturer = null;
    if (manufacturerName) {
      manufacturer = await BillOfMaterialsService.getSingleManufacturerWithQueryArgs(manufacturerName, organization);
    }

    // recalculate subtotal on edits
    const finalPrice = price !== undefined ? price : (material.price ?? undefined);
    const finalQuantity = quantity !== undefined ? quantity : (material.quantity ?? undefined);
    const computedSubtotal =
      finalPrice !== undefined && finalQuantity !== undefined ? Math.round(finalPrice * Number(finalQuantity)) : undefined;

    const updatedMaterial = await prisma.material.update({
      where: { materialId },
      data: {
        name,
        status,
        materialTypeId: materialType.id,
        manufacturerId: manufacturer ? manufacturer.id : null,
        manufacturerPartNumber,
        quantity,
        unitId: unit ? unit.id : null,
        price,
        subtotal: computedSubtotal,
        linkUrl,
        notes,
        wbsElementId: project.wbsElementId,
        assemblyId,
        pdmFileName: pdmFileName !== undefined ? pdmFileName || null : undefined
      },
      ...getMaterialQueryArgs(organization.organizationId)
    });

    return materialTransformer(updatedMaterial);
  }

  /**
   * Gets all the units in the database for the given organization with all their materials
   * @param user the user who's getting all the units
   * @param organizationId the id of the organization the units are associated with
   * @returns all the units in the database
   */
  static async getAllUnits(user: User, organization: Organization): Promise<Unit[]> {
    if (await userHasPermission(user.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('get units');

    const units = await prisma.unit.findMany({
      where: {
        organizationId: organization.organizationId
      },
      include: {
        materials: getMaterialPreviewQueryArgs(organization.organizationId)
      }
    });

    return units.map((unit) => {
      return { ...unit, materials: unit.materials.map(materialPreviewTransformer) };
    });
  }

  /**
   * Creates a new unit
   * @param submitter the user who's creating the unit
   * @param name the name of the unit
   * @param organizationId the id of the organization the unit is associated with
   * @throws if the submitter is a guest or the given unit name already exists
   */
  static async createUnit(name: string, submitter: User, organization: Organization): Promise<Unit> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create units');

    const unit = await prisma.unit.findUnique({
      where: {
        uniqueUnit: { name, organizationId: organization.organizationId }
      }
    });

    if (unit) throw new HttpException(400, `${name} already exists as a unit!`);

    const newUnit = await prisma.unit.create({
      data: { name, organizationId: organization.organizationId, userCreatedId: submitter.userId }
    });

    return { ...newUnit, materials: [] };
  }

  /**
   * Update an assembly
   * @param submitter the submitter of the request
   * @param assemblyId the assembly id of the edited material
   * @param organizationId the id of the organization the user is currently in
   * @param name the name of the edited material
   * @param pdmFileName the pdm file name of the edited material
   * @throws if permission denied or material's wbsElement is undefined/deleted
   * @returns the updated assembly
   */
  static async editAssembly(
    submitter: User,
    assemblyId: string,
    organization: Organization,
    name?: string,
    pdmFileName?: string
  ): Promise<Assembly> {
    const assembly = await BillOfMaterialsService.getSingleAssemblyWithQueryArgs(assemblyId, organization);

    const teams = await prisma.team.findMany({
      where: {
        organizationId: organization.organizationId,
        projects: {
          some: {
            wbsElementId: assembly.wbsElementId
          }
        }
      },
      include: {
        members: getUserQueryArgs(organization.organizationId),
        head: getUserQueryArgs(organization.organizationId),
        leads: getUserQueryArgs(organization.organizationId)
      }
    });

    const perms =
      (await userHasPermission(submitter.userId, assembly.wbsElement.organizationId, isAdmin)) ||
      isUserPartOfTeams(teams, submitter);

    if (!perms) throw new AccessDeniedException('update assembly');

    const updatedAssembly = await prisma.assembly.update({
      where: { assemblyId },
      data: {
        name,
        pdmFileName
      },
      ...getAssemblyQueryArgs(organization.organizationId)
    });

    return assemblyTransformer(updatedAssembly);
  }

  /**
   * Gets a single assembly with the given id and performs the necessary checks
   * @param assemblyId The id of the assembly to get
   * @param organizationId The id of the organization the user is currently in
   * @returns The found assembly
   */
  static async getSingleAssemblyWithQueryArgs(assemblyId: string, organization: Organization) {
    const assembly = await prisma.assembly.findUnique({
      where: { assemblyId },
      ...getAssemblyQueryArgs(organization.organizationId)
    });
    if (!assembly) throw new NotFoundException('Assembly', assemblyId);
    if (assembly.wbsElement.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Assembly');
    if (assembly.dateDeleted) throw new DeletedException('Assembly', assemblyId);

    return assembly;
  }

  /**
   * Gets a single material type with the given name and performs the necessary checks
   * @param materialTypeName The name of the material type to get
   * @param organizationId The id of the organization the user is currently in
   * @returns The found material type
   */
  static async getSingleMaterialTypeWithQueryArgs(materialTypeName: string, organization: Organization) {
    const materialType = await prisma.material_Type.findUnique({
      where: { uniqueMaterialType: { name: materialTypeName, organizationId: organization.organizationId } },
      ...getMaterialTypeQueryArgs(organization.organizationId)
    });

    if (!materialType) throw new NotFoundException('Material Type', materialTypeName);
    if (materialType.dateDeleted) throw new DeletedException('Material Type', materialTypeName);

    return materialType;
  }

  /**
   * Gets a single manufacturer with the given name and performs the necessary checks
   * @param manufacturerName The name of the manufacturer we want to get
   * @param organizationId The id of the organization the user is currently in
   * @returns The manufacturer with the given name
   */
  static async getSingleManufacturerWithQueryArgs(manufacturerName: string, organization: Organization) {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { uniqueManufacturer: { name: manufacturerName, organizationId: organization.organizationId } },
      ...getManufacturerQueryArgs(organization.organizationId)
    });

    if (!manufacturer) throw new NotFoundException('Manufacturer', manufacturerName);
    if (manufacturer.dateDeleted) throw new DeletedException('Manufacturer', manufacturerName);

    return manufacturer;
  }

  /**
   * Gets a single material with the given id and performs the necessary checks
   * @param materialId The id of the material to get
   * @param organizationId The id of the organization the user is currently in
   * @returns The found material
   */
  static async getSingleMaterialWithQueryArgs(materialId: string, organization: Organization) {
    const material = await prisma.material.findUnique({
      where: { materialId },
      include: { wbsElement: true }
    });

    if (!material) throw new NotFoundException('Material', materialId);
    if (material.wbsElement.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Material');
    if (material.dateDeleted) throw new DeletedException('Material', materialId);

    return material;
  }

  static async getAssembliesForWbsElement(wbsNum: WbsNumber, organization: Organization): Promise<Assembly[]> {
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          ...wbsNum,
          organizationId: organization.organizationId
        }
      }
    });

    if (!wbsElement) {
      throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    }
    if (wbsElement.dateDeleted) {
      throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    const assemblies = await prisma.assembly.findMany({
      where: {
        wbsElementId: wbsElement.wbsElementId,
        dateDeleted: null
      },
      ...getAssemblyQueryArgs(organization.organizationId)
    });

    return assemblies.map(assemblyTransformer);
  }

  static async getMaterialsForWbsElement(wbsNum: WbsNumber, organization: Organization): Promise<Material[]> {
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          ...wbsNum,
          organizationId: organization.organizationId
        }
      },
      include: {
        materials: {
          where: {
            dateDeleted: null
          },
          ...getMaterialQueryArgs(organization.organizationId)
        }
      }
    });

    if (!wbsElement) {
      throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    }
    if (wbsElement.dateDeleted) {
      throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    return wbsElement.materials.map(materialTransformer);
  }
}
