import { Prisma } from "@prisma/client";
import { descBulletArgs } from "../prisma-query-args/description-bullets.query-args";


export const descBulletTransformer = (descBullet: Prisma.Description_BulletGetPayload<typeof descBulletArgs>) => {
    return {
      id: descBullet.descriptionId,
      detail: descBullet.detail,
      dateAdded: descBullet.dateAdded,
      dateDeleted: descBullet.dateDeleted ?? undefined,
      userChecked: descBullet.userChecked ?? undefined
    };
  };