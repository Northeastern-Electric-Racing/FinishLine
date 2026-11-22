import prisma, { PrismaTransactionClient } from '../prisma/prisma.js';
import { WBS_Element_Status } from '@prisma/client';
import { DescriptionBulletPreview, LinkCreateArgs, WbsElementStatus } from 'shared';
import { DeletedException, HttpException, InvalidOrganizationException, NotFoundException } from './errors.utils.js';
import { ChangeCreateArgs, createChange, createListChanges, getDescriptionBulletChanges } from './changes.utils.js';
import {
  DescriptionBulletDestination,
  addRawDescriptionBullets,
  editDescriptionBullets
} from './description-bullets.utils.js';
import { linkToChangeListValue, updateLinks } from './links.utils.js';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args.js';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';

export type ProjectWithId = {
  projectId: String;
};

/**
 * calculate the project's status based on its workpacakges' status
 * @param proj a given project to be calculated on its status
 * @returns the project's calculated wbs element status as either complete, active, or incomplete
 */
export const calculateProjectStatus = (proj: { workPackages: { wbsElement: { status: WBS_Element_Status } }[] }) => {
  if (proj.workPackages.length === 0) return WbsElementStatus.Inactive;

  if (proj.workPackages.every((wp) => wp.wbsElement.status === WbsElementStatus.Complete)) return WbsElementStatus.Complete;
  else if (proj.workPackages.some((wp) => wp.wbsElement.status === WbsElementStatus.Active)) return WbsElementStatus.Active;
  return WbsElementStatus.Inactive;
};

// gets highest current project number
export const getHighestProjectNumber = async (carNumber: number) => {
  const maxProjectNumber = await prisma.wBS_Element.aggregate({
    where: { carNumber },
    _max: { projectNumber: true }
  });

  return maxProjectNumber._max.projectNumber ?? 0;
};

// Given a user's id, this method returns the user's full name
export const getUserFullName = async (userId: string | null): Promise<string | null> => {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new NotFoundException('User', userId);
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Works out what an edit to a project changes, without saving anything
 * @param crId the change request the changes belong to; with null no changes are recorded
 * @param tx the transaction client to read with (defaults to prisma)
 * @returns the changes to record, the bullet and link changes to apply, and the work packages that take on the
 * project's new lead or manager
 */
export const getProjectChanges = async (
  projectId: string,
  crId: string | null,
  implementerId: string,
  name: string,
  budget: number | null,
  summary: string,
  newDescriptionBullets: DescriptionBulletPreview[],
  newLinkCreateArgs: LinkCreateArgs[] | null,
  leadId: string | null,
  managerId: string | null,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  let changesJson: ChangeCreateArgs[] = [];

  const originalProject = await tx.project.findUnique({
    where: {
      projectId
    },
    include: {
      wbsElement: {
        include: {
          links: { where: { dateDeleted: null }, ...getLinkQueryArgs() },
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) }
        }
      },
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        include: { wbsElement: true }
      }
    }
  });

  // if it doesn't exist we error
  if (!originalProject) throw new NotFoundException('Project', projectId);
  if (originalProject.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);
  if (originalProject.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Project');

  const { wbsElementId, workPackages: originalWorkPackages } = originalProject;

  const nameChangeJson = createChange(
    'name',
    originalProject.wbsElement.name,
    name,
    crId,
    implementerId,
    wbsElementId,
    null,
    null
  );
  const budgetChangeJson = createChange(
    'budget',
    originalProject.budget,
    budget,
    crId,
    implementerId,
    wbsElementId,
    null,
    null
  );
  const summaryChangeJson = createChange(
    'summary',
    originalProject.summary,
    summary,
    crId,
    implementerId,
    wbsElementId,
    null,
    null
  );
  const managerChangeJson = createChange(
    'manager',
    await getUserFullName(originalProject.wbsElement.managerId),
    await getUserFullName(managerId),
    crId,
    implementerId,
    wbsElementId,
    null,
    null
  );
  const leadChangeJson = createChange(
    'lead',
    await getUserFullName(originalProject.wbsElement.leadId),
    await getUserFullName(leadId),
    crId,
    implementerId,
    wbsElementId,
    null,
    null
  );

  // Dealing with lists
  if (nameChangeJson) changesJson.push(nameChangeJson);
  if (budgetChangeJson) changesJson.push(budgetChangeJson);
  if (summaryChangeJson) changesJson.push(summaryChangeJson);
  if (managerChangeJson) changesJson.push(managerChangeJson);
  if (leadChangeJson) changesJson.push(leadChangeJson);

  const descriptionBulletChanges = await getDescriptionBulletChanges(
    originalProject.wbsElement.descriptionBullets,
    newDescriptionBullets,
    crId,
    wbsElementId,
    implementerId
  );

  const linkChanges = createListChanges(
    'link',
    originalProject.wbsElement.links.map((link) => linkToChangeListValue({ ...link, linkTypeName: link.linkType.name })),
    newLinkCreateArgs ? newLinkCreateArgs.map(linkToChangeListValue) : [],
    crId,
    implementerId,
    wbsElementId
  );

  changesJson = changesJson.concat(descriptionBulletChanges.changes).concat(linkChanges.changes);

  // if the project has no manager and one is provided, its work packages without a manager take it too,
  // so the project manager is the default manager for all its work packages (same goes for the lead)
  const workPackagesNeedingManager =
    !originalProject.wbsElement.managerId && managerId
      ? originalWorkPackages.filter((wp) => !wp.wbsElement.managerId).map((wp) => wp.wbsElementId)
      : [];
  const workPackagesNeedingLead =
    !originalProject.wbsElement.leadId && leadId
      ? originalWorkPackages.filter((wp) => !wp.wbsElement.leadId).map((wp) => wp.wbsElementId)
      : [];

  const managerWpChanges = (
    await Promise.all(
      workPackagesNeedingManager.map(async (wpWbsElementId) =>
        createChange('manager', null, await getUserFullName(managerId), crId, implementerId, wpWbsElementId, null, null)
      )
    )
  ).filter((change) => change !== undefined);

  const leadWpChanges = (
    await Promise.all(
      workPackagesNeedingLead.map(async (wpWbsElementId) =>
        createChange('lead', null, await getUserFullName(leadId), crId, implementerId, wpWbsElementId, null, null)
      )
    )
  ).filter((change) => change !== undefined);

  changesJson = changesJson.concat(managerWpChanges).concat(leadWpChanges);

  return {
    wbsElementId,
    changes: changesJson,
    descriptionBulletChanges,
    linkChanges,
    workPackagesNeedingManager,
    workPackagesNeedingLead
  };
};

export type ProjectChanges = Awaited<ReturnType<typeof getProjectChanges>>;

/**
 * Saves an edit to a project and records its changes
 * @param projectChanges what the edit changes, from getProjectChanges
 * @param changeRequestId the change request to record the changes under, replacing the id they were worked out with
 * @param tx the transaction client to write with (defaults to prisma)
 */
export const applyProjectChanges = async (
  projectChanges: ProjectChanges,
  changeRequestId: string | null,
  implementerId: string,
  name: string,
  budget: number | null,
  summary: string,
  leadId: string | null,
  managerId: string | null,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const {
    wbsElementId,
    changes,
    descriptionBulletChanges,
    linkChanges,
    workPackagesNeedingManager,
    workPackagesNeedingLead
  } = projectChanges;

  if (workPackagesNeedingManager.length > 0) {
    await tx.wBS_Element.updateMany({
      where: { wbsElementId: { in: workPackagesNeedingManager } },
      data: { managerId }
    });
  }

  if (workPackagesNeedingLead.length > 0) {
    await tx.wBS_Element.updateMany({
      where: { wbsElementId: { in: workPackagesNeedingLead } },
      data: { leadId }
    });
  }

  // update the project with the input fields
  await tx.project.update({
    where: {
      wbsElementId
    },
    data: {
      budget: budget ?? undefined,
      summary,
      wbsElement: {
        update: {
          name,
          leadId,
          managerId
        }
      }
    },
    select: { projectId: true }
  });

  // Update any deleted description bullets to have their date deleted as right now
  const deletedDescriptionBullets: DescriptionBulletPreview[] = descriptionBulletChanges.deleted;

  if (deletedDescriptionBullets.length > 0) {
    await tx.description_Bullet.updateMany({
      where: {
        descriptionId: {
          in: deletedDescriptionBullets.map((descriptionBullet) => descriptionBullet.id)
        }
      },
      data: {
        dateDeleted: new Date()
      }
    });
  }

  // Add the new description bullets
  await addRawDescriptionBullets(
    descriptionBulletChanges.added,
    DescriptionBulletDestination.WBS_ELEMENT,
    wbsElementId,
    organizationId,
    tx
  );

  // Edit the existing description bullets
  await editDescriptionBullets(descriptionBulletChanges.edited, organizationId, tx);

  // Update links
  await updateLinks(linkChanges, wbsElementId, implementerId, organizationId, tx);

  // record the changes under the real change request id
  const changesToCreate = changeRequestId ? changes.map((change) => ({ ...change, changeRequestId })) : changes;
  await tx.change.createMany({ data: changesToCreate });
};

// Update a project and create changes together
export const updateProjectAndCreateChanges = async (
  projectId: string,
  crId: string | null,
  implementerId: string,
  name: string,
  budget: number | null,
  summary: string,
  newDescriptionBullets: DescriptionBulletPreview[],
  newLinkCreateArgs: LinkCreateArgs[] | null,
  leadId: string | null,
  managerId: string | null,
  organizationId: string,
  tx: PrismaTransactionClient = prisma
) => {
  const projectChanges = await getProjectChanges(
    projectId,
    crId,
    implementerId,
    name,
    budget,
    summary,
    newDescriptionBullets,
    newLinkCreateArgs,
    leadId,
    managerId,
    organizationId,
    tx
  );

  await applyProjectChanges(
    projectChanges,
    crId,
    implementerId,
    name,
    budget,
    summary,
    leadId,
    managerId,
    organizationId,
    tx
  );

  return { wbsElementId: projectChanges.wbsElementId };
};
/**
 * Check if given assembly, material type, manufacturer, and unit exist in the app database
 * @param manufacturerName the manufacure of the material to check if it exists
 * @param materialTypeName the material type of the material to check if it exists
 * @param unitName the unit of the material to check if it exists
 * @param assemblyId the assembly of the material to check if it exists
 * @throws if any of these properties of the material does not exist in the db
 */
export const checkMaterialInputs = async (
  manufacturerName: string,
  materialTypeName: string,
  unitName?: string,
  assemblyId?: string
) => {
  if (assemblyId) {
    const assembly = await prisma.assembly.findFirst({ where: { assemblyId } });
    if (!assembly) throw new NotFoundException('Assembly', assemblyId);
  }

  const materialType = await prisma.material_Type.findFirst({
    where: { name: materialTypeName }
  });
  if (!materialType) throw new NotFoundException('Material Type', materialTypeName);

  const manufacturer = await prisma.manufacturer.findFirst({
    where: { name: manufacturerName }
  });
  if (!manufacturer) throw new NotFoundException('Manufacturer', manufacturerName);

  if (unitName) {
    const unit = await prisma.unit.findFirst({
      where: { name: unitName }
    });
    if (!unit) throw new NotFoundException('Unit', unitName);
  }
};

/**
 * Produce a array of primsa formated projectIDs, given the array of Project
 * @param projectIds the projectIds to get as users
 * @returns projectIds in prisma format
 */
export const getProjects = async (projectIds: string[], organizationId: string) => {
  const projects = await prisma.project.findMany({
    where: { projectId: { in: projectIds }, wbsElement: { organizationId, dateDeleted: null } },
    select: { projectId: true }
  });

  validateFoundProjects(
    projects.map((project) => project.projectId),
    projectIds
  );

  return projects;
};

/**
 * Validates that the projects found in the database match the given projectIds
 * @param foundProjectIds the ids of the projects found in the database
 * @param projectIds the requested projectIds to retrieve
 */
const validateFoundProjects = (foundProjectIds: string[], projectIds: string[]) => {
  if (foundProjectIds.length !== projectIds.length) {
    const missingProjectIds = projectIds.filter((id) => !foundProjectIds.includes(id));
    throw new HttpException(404, `Projects(s) with the following ids not found: ${missingProjectIds.join(', ')}`);
  }
};
