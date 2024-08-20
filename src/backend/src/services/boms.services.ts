import { Material, Material_Status, Material_Type, Organization, User } from '@prisma/client';
import Decimal from 'decimal.js';
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
  Unit
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { isUserPartOfTeams } from '../utils/teams.utils';
import ProjectsService from './projects.services';
import { assemblyTransformer, materialPreviewTransformer } from '../transformers/material.transformer';
import manufacturerTransformer from '../transformers/manufacturer.transformer';
import { materialTypeTransformer } from '../transformers/material-type.transformer';
import { getAssemblyQueryArgs, getMaterialPreviewQueryArgs } from '../prisma-query-args/bom.query-args';
import { getManufacturerQueryArgs } from '../prisma-query-args/manufacturers.query-args';
import { getMaterialTypeQueryArgs } from '../prisma-query-args/material-type.query-args';

export default class BillOfMaterialsService {
  /**
   * Creates a new Material
   * @param creator the user creating the material
   * @param name the name of the material
   * @param status the Material Status of the material
   * @param materialTypeName the name of the Material Type
   * @param manufacturerName the name of the material's manufacturer
   * @param manufacturerPartNumber the manufacturer part number for the material
   * @param quantity the quantity of material as a number
   * @param price the price of the material in whole cents
   * @param subtotal the subtotal of the price for the material in whole cents
   * @param linkUrl the url for the material's link as a string
   * @param notes any notes about the material as a string
   * @param wbsNumber the WBS number of the project associated with this material
   * @param organizationId the id of the organization the user is currently in
   * @param assemblyId the id of the Assembly for the material
   * @param pdmFileName the name of the pdm file for the material
   * @param unitName the name of the Quantity Unit the quantity is measured in
   * @returns the created material
   */
  static async createMaterial(
    creator: User,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    manufacturerName: string,
    manufacturerPartNumber: string,
    quantity: Decimal,
    price: number,
    subtotal: number,
    linkUrl: string,
    wbsNumber: WbsNumber,
    organization: Organization,
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

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { uniqueManufacturer: { name: manufacturerName, organizationId: organization.organizationId } }
    });
    if (!manufacturer) throw new NotFoundException('Manufacturer', manufacturerName);
    if (manufacturer.dateDeleted) throw new DeletedException('Manufacturer', manufacturerName);

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
        manufacturerId: manufacturer.id,
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
      }
    });

    return createdMaterial;
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
      data: { dateDeleted: new Date(), userDeletedId: currentUser.userId }
    });

    return deletedMaterial;
  }

  /**
   * Update a material
   * @param submitter the submitter of the request
   * @param materialId the material id of the material being edited
   * @param name the name of the edited material
   * @param status the status of the edited material
   * @param materialTypeName the material type of the edited material
   * @param manufacturerName the manufacturerName of the edited material
   * @param manufacturerPartNumber the manufacturerPartNumber of the edited material
   * @param quantity the quantity of the edited material
   * @param price the price of the edited material
   * @param subtotal the subtotal of the edited material
   * @param linkUrl the linkUrl of the edited material
   * @param organizationId the organization the user is currently in
   * @param notes the notes of the edited material
   * @param unitName the unit name of the edited material
   * @param assemblyId the assembly id of the edited material
   * @param pdmFileName the pdm file name of the edited material
   * @throws if permission denied or material's wbsElement is undefined/deleted
   * @returns the updated material
   */
  static async editMaterial(
    submitter: User,
    materialId: string,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    manufacturerName: string,
    manufacturerPartNumber: string,
    quantity: Decimal,
    price: number,
    subtotal: number,
    linkUrl: string,
    organization: Organization,
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

    const manufacturer = await BillOfMaterialsService.getSingleManufacturerWithQueryArgs(manufacturerName, organization);

    const updatedMaterial = await prisma.material.update({
      where: { materialId },
      data: {
        name,
        status,
        materialTypeId: materialType.id,
        manufacturerId: manufacturer.id,
        manufacturerPartNumber,
        quantity,
        unitId: unit ? unit.id : null,
        price,
        subtotal,
        linkUrl,
        notes,
        wbsElementId: project.wbsElementId,
        assemblyId,
        pdmFileName
      }
    });

    return updatedMaterial;
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

    const teams = assembly.wbsElement?.project?.teams ?? assembly.wbsElement.workPackage?.project.teams ?? [];

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
}
