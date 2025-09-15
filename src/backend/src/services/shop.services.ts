import { Organization, User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class ShopServices {
    /** 
     * Creates a new shop
     * requires the submiter to be Admin
     */
    static async createShop(submitter: User, name: string, description: string, organization: Organization) {
        const permission = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);
         if (!permission) throw new AccessDeniedAdminOnlyException('Only admins can create a shop');
         
            const shop = await prisma.shop.create({
                data: {
                    name,
                    description,
                    userCreatedId: submitter.userId,

                   },    
                });
            return shop;
        


    }
}