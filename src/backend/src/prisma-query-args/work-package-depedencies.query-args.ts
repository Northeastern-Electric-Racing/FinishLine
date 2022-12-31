
import { Prisma } from "@prisma/client";

const workPackageDependencyQueryArgs = Prisma.validator<Prisma.Work_PackageArgs>()({
  include: {
    dependencies: true,
    wbsElement: true
  }
});

export default workPackageDependencyQueryArgs; 