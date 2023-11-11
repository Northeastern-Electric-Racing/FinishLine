import { User } from '@prisma/client';
import { isLeadership } from 'shared';
import prisma from '../prisma/prisma';
import { NotFoundException, AccessDeniedException, DeletedException } from '../utils/errors.utils';

export default class MaterialService {
  /**
   * Delete material in the database
   * @param materialId the id number of the given material
   * @param currentUser the current user currently accessing the material
   * @returns the deleted material
   * @throws if the user does not have permission, or materidal already deleted
   */
  static async deleteMaterial(currentUser: User, materialId: string): Promise<string> {
    if (!isLeadership(currentUser.role)) {
      throw new AccessDeniedException('Only Leadership can delete materials');
    }

    const material = await prisma.material.findUnique({ where: { materialId } });

    if (!material) throw new NotFoundException('Material', materialId);

    if (material.dateDeleted) throw new DeletedException('Material', materialId);

    const deletedMaterial = await prisma.material.update({
      where: { materialId },
      data: { dateDeleted: new Date(), userDeletedId: currentUser.userId }
    });

    return deletedMaterial.materialId;
  }
}
