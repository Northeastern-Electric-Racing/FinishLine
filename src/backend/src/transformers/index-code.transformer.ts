import { Prisma } from "@prisma/client";
import { IndexCode } from "shared";

const indexCodeTransformer = (indexCode: Prisma.Index_CodeGetPayload<null>): IndexCode => {
  return {
    indexCodeId: indexCode.indexCodeId,
    name: indexCode.name,
    dateCreated: indexCode.dateCreated,
    userCreatedId: indexCode.userCreatedId
  };
};

export default indexCodeTransformer;