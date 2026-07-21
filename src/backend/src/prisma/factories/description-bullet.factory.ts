import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

const BULLET_VERBS = [
  'Design',
  'Research',
  'Validate',
  'Manufacture',
  'Test',
  'Install',
  'Review',
  'Document',
  'Analyze',
  'Fabricate',
  'Complete',
  'Verify',
  'Finalize',
  'Assemble',
  'Inspect'
];

const BULLET_SUFFIXES = [
  'confluence page',
  'FEA',
  'design review',
  'drawings',
  'CAD model',
  'BOM',
  'sign off',
  'and validate',
  'with FEA',
  'manufacturing plan',
  'test report',
  'specifications'
];

export const generateDescriptionBulletCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 10, value: 1 },
    { weight: 30, value: 2 },
    { weight: 30, value: 3 },
    { weight: 20, value: 4 },
    { weight: 10, value: 5 }
  ]);

export const generateDescriptionBulletText = (faker: Faker, wbsElementName: string): string => {
  const verb = faker.helpers.arrayElement(BULLET_VERBS);
  const suffix = faker.helpers.maybe(() => faker.helpers.arrayElement(BULLET_SUFFIXES), { probability: 0.5 });
  return suffix ? `${verb} ${wbsElementName} ${suffix}` : `${verb} ${wbsElementName}`;
};

export const descriptionBulletCreateInput = (
  detail: string,
  descriptionBulletTypeId: string,
  wbsElementId: string
): Prisma.Description_BulletCreateInput => ({
  detail,
  descriptionBulletType: { connect: { id: descriptionBulletTypeId } },
  wbsElement: { connect: { wbsElementId } }
});
