import { WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import { DescriptionBulletPreview, LinkCreateArgs, WbsElementStatus } from 'shared';
import { DeletedException, NotFoundException } from './errors.utils';
import { ChangeCreateArgs, createChange, createListChanges, getDescriptionBulletChanges } from './changes.utils';
import { DescriptionBulletDestination, addRawDescriptionBullets, editDescriptionBullets } from './description-bullets.utils';
import { linkToChangeListValue, updateLinks } from './links.utils';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';

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
export const getUserFullName = async (userId: number | null): Promise<string | null> => {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new NotFoundException('User', userId);
  return `${user.firstName} ${user.lastName}`;
};

// Update a project and create changes together
export const updateProjectAndCreateChanges = async (
  projectId: number,
  crId: number,
  implementerId: number,
  name: string,
  budget: number | null,
  summary: string,
  newDescriptionBullets: DescriptionBulletPreview[],
  newLinkCreateArgs: LinkCreateArgs[] | null,
  projectLeadId: number | null,
  projectManagerId: number | null,
  organizationId: string
) => {
  let changesJson: ChangeCreateArgs[] = [];

  const originalProject = await prisma.project.findUnique({
    where: {
      projectId
    },
    include: {
      wbsElement: {
        include: {
          links: getLinkQueryArgs(organizationId),
          descriptionBullets: getDescriptionBulletQueryArgs(organizationId)
        }
      }
    }
  });

  // if it doesn't exist we error
  if (!originalProject) throw new NotFoundException('Project', projectId);
  if (originalProject.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);

  const { wbsElementId } = originalProject;

  const nameChangeJson = createChange('name', originalProject.wbsElement.name, name, crId, implementerId, wbsElementId);
  const budgetChangeJson = createChange('budget', originalProject.budget, budget, crId, implementerId, wbsElementId);
  const summaryChangeJson = createChange('summary', originalProject.summary, summary, crId, implementerId, wbsElementId);
  const projectManagerChangeJson = createChange(
    'project manager',
    await getUserFullName(originalProject.wbsElement.managerId),
    await getUserFullName(projectManagerId),
    crId,
    implementerId,
    wbsElementId
  );
  const projectLeadChangeJson = createChange(
    'project lead',
    await getUserFullName(originalProject.wbsElement.leadId),
    await getUserFullName(projectLeadId),
    crId,
    implementerId,
    wbsElementId
  );

  // Dealing with lists
  if (nameChangeJson) changesJson.push(nameChangeJson);
  if (budgetChangeJson) changesJson.push(budgetChangeJson);
  if (summaryChangeJson) changesJson.push(summaryChangeJson);
  if (projectManagerChangeJson) changesJson.push(projectManagerChangeJson);
  if (projectLeadChangeJson) changesJson.push(projectLeadChangeJson);

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

  // update the project with the input fields
  const updatedProject = await prisma.project.update({
    where: {
      wbsElementId
    },
    data: {
      budget: budget ?? undefined,
      summary,
      wbsElement: {
        update: {
          name,
          leadId: projectLeadId,
          managerId: projectManagerId
        }
      }
    },
    ...getProjectQueryArgs(organizationId)
  });

  // Update any deleted description bullets to have their date deleted as right now
  const deletedDescriptionBullets: DescriptionBulletPreview[] = descriptionBulletChanges.deleted;

  if (deletedDescriptionBullets.length > 0) {
    await prisma.description_Bullet.updateMany({
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
    organizationId
  );

  // Edit the existing description bullets
  await editDescriptionBullets(descriptionBulletChanges.edited, organizationId);

  // Update links
  await updateLinks(linkChanges, wbsElementId, implementerId, organizationId);

  await prisma.change.createMany({
    data: changesJson
  });

  return { project: updatedProject, wbsElementId };
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
