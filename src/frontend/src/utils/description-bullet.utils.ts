import { DescriptionBulletType } from 'shared';

export type DescriptionBulletRequiredType = 'project' | 'workPackage';

export const getRequiredDescriptionBulletTypeNames = (
  descriptionBullets: DescriptionBulletType[],
  type: DescriptionBulletRequiredType
): string[] => {
  return descriptionBullets
    .filter((descriptionBullet) =>
      type === 'project' ? descriptionBullet.projectRequired : descriptionBullet.workPackageRequired
    )
    .map((descriptionBullet) => descriptionBullet.name);
};
