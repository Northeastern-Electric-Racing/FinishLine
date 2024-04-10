import { WBS_Element, WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import { LinkCreateArgs, WbsElementStatus, WbsNumber } from 'shared';
import { DeletedException, HttpException, NotFoundException } from './errors.utils';
import { ChangeCreateArgs, createChange, createListChanges } from './changes.utils';
import {
  DescriptionBulletPreview,
  descriptionBulletToChangeListValue,
  descriptionBulletsToChangeListValues
} from './description-bullets.utils';
import { linkToChangeListValue, updateLinks } from './links.utils';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import projectQueryArgs from '../prisma-query-args/projects.query-args';

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

// helper method to add the given description bullets into the database, linked to the given work package or project
export const addDescriptionBullets = async (addedDetails: string[], id: number, descriptionBulletIdField: string) => {
  // add the added bullets
  if (addedDetails.length > 0) {
    await prisma.description_Bullet.createMany({
      data: addedDetails.map((element) => {
        return {
          detail: element,
          [descriptionBulletIdField]: id
        };
      })
    });
  }
};

// edit descrption bullets in the db for each id and detail pair
export const editDescriptionBullets = async (editedIdsAndDetails: { id: number; detail: string }[]) => {
  if (editedIdsAndDetails.length < 1) return;
  editedIdsAndDetails.forEach(
    async (element) =>
      await prisma.description_Bullet.update({
        where: { descriptionId: element.id },
        data: { detail: element.detail }
      })
  );
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
  newRules: string[] | null,
  newGoals: { id: number; detail: string }[] | null,
  newFeatures: { id: number; detail: string }[] | null,
  newOtherConstraints: { id: number; detail: string }[] | null,
  newLinkCreateArgs: LinkCreateArgs[] | null,
  projectLeadId: number | null,
  projectManagerId: number | null
) => {
  let changesJson: ChangeCreateArgs[] = [];

  const originalProject = await prisma.project.findUnique({
    where: {
      projectId
    },
    include: {
      wbsElement: { include: { links: { ...linkQueryArgs } } },
      goals: true,
      features: true,
      otherConstraints: true
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
    await getUserFullName(originalProject.wbsElement.projectManagerId),
    await getUserFullName(projectManagerId),
    crId,
    implementerId,
    wbsElementId
  );
  const projectLeadChangeJson = createChange(
    'project lead',
    await getUserFullName(originalProject.wbsElement.projectLeadId),
    await getUserFullName(projectLeadId),
    crId,
    implementerId,
    wbsElementId
  );

  // Dealing with lists
  const rulesChangeJson = createListChanges(
    'rules',
    originalProject.rules.map((rule) => {
      return {
        element: rule,
        comparator: rule,
        displayValue: rule
      };
    }),
    newRules
      ? newRules.map((rule) => {
          return {
            element: rule,
            comparator: rule,
            displayValue: rule
          };
        })
      : [],
    crId,
    implementerId,
    wbsElementId
  );
  if (nameChangeJson !== undefined) changesJson.push(nameChangeJson);
  if (budgetChangeJson !== undefined) changesJson.push(budgetChangeJson);
  if (summaryChangeJson !== undefined) changesJson.push(summaryChangeJson);
  if (projectManagerChangeJson !== undefined) changesJson.push(projectManagerChangeJson);
  if (projectLeadChangeJson !== undefined) changesJson.push(projectLeadChangeJson);

  const goalsChangeJson = createListChanges(
    'goals',
    descriptionBulletsToChangeListValues(originalProject.goals),
    newGoals ? newGoals.map((goal) => descriptionBulletToChangeListValue(goal)) : [],
    crId,
    implementerId,
    wbsElementId
  );

  const featuresChangeJson = createListChanges(
    'features',
    descriptionBulletsToChangeListValues(originalProject.features),
    newFeatures ? newFeatures.map((feature) => descriptionBulletToChangeListValue(feature)) : [],
    crId,
    implementerId,
    wbsElementId
  );

  const otherConstraintsChangeJson = createListChanges(
    'other constraints',
    descriptionBulletsToChangeListValues(originalProject.otherConstraints),
    newOtherConstraints ? newOtherConstraints.map((constraint) => descriptionBulletToChangeListValue(constraint)) : [],
    crId,
    implementerId,
    wbsElementId
  );

  const linkChanges = createListChanges(
    'link',
    originalProject.wbsElement.links.map(linkToChangeListValue),
    newLinkCreateArgs ? newLinkCreateArgs.map(linkToChangeListValue) : [],
    crId,
    implementerId,
    wbsElementId
  );

  changesJson = changesJson
    .concat(rulesChangeJson.changes)
    .concat(goalsChangeJson.changes)
    .concat(featuresChangeJson.changes)
    .concat(otherConstraintsChangeJson.changes)
    .concat(linkChanges.changes);

  // update the project with the input fields
  const updatedProject = await prisma.project.update({
    where: {
      wbsElementId
    },
    data: {
      budget: budget ?? undefined,
      summary,
      rules: newRules ?? undefined,
      wbsElement: {
        update: {
          name,
          projectLeadId,
          projectManagerId
        }
      }
    },
    ...projectQueryArgs
  });

  // Update any deleted description bullets to have their date deleted as right now
  const deletedDescriptionBullets: DescriptionBulletPreview[] = goalsChangeJson.deletedElements
    .concat(featuresChangeJson.deletedElements)
    .concat(otherConstraintsChangeJson.deletedElements);

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

  await addDescriptionBullets(
    goalsChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
    originalProject.projectId,
    'projectIdGoals'
  );
  await addDescriptionBullets(
    featuresChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
    originalProject.projectId,
    'projectIdFeatures'
  );
  // Add the new other constraints
  await addDescriptionBullets(
    otherConstraintsChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
    originalProject.projectId,
    'projectIdOtherConstraints'
  );
  // Edit the existing description bullets
  await editDescriptionBullets(
    goalsChangeJson.editedElements
      .concat(featuresChangeJson.editedElements)
      .concat(otherConstraintsChangeJson.editedElements)
  );

  // Update links
  await updateLinks(linkChanges, wbsElementId, implementerId);

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

export const validateBlockedBys = async (blockedBy: WbsNumber[]) => {
  blockedBy.forEach((dep: WbsNumber) => {
    if (dep.workPackageNumber === 0) {
      throw new HttpException(400, 'A Project cannot be a Blocker');
    }
  });

  const blockedByWBSElems: (WBS_Element | null)[] = await Promise.all(
    blockedBy.map(async (ele: WbsNumber) => {
      return await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: ele.carNumber,
            projectNumber: ele.projectNumber,
            workPackageNumber: ele.workPackageNumber
          }
        }
      });
    })
  );

  const blockedByIds: number[] = [];
  // populate blockedByIds with the element ID's
  // and return error 400 if any elems are null

  let blockedByHasNulls = false;
  blockedByWBSElems.forEach((elem) => {
    if (!elem) {
      blockedByHasNulls = true;
      return;
    }
    blockedByIds.push(elem.wbsElementId);
  });

  if (blockedByHasNulls) {
    throw new HttpException(400, 'One of the blockers was not found.');
  }

  return blockedByIds;
};
