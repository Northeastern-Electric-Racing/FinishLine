/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import { SeedRunner } from './processes/seed-runner.js';
import { UsersProcess } from './seed/user.process.js';
import { OrganizationProcess } from './seed/organization.process.js';
import { CarProcess } from './seed/car.process.js';
import { ConfigDataProcess } from './seed/config-data.process.js';
import { ShopProcess } from './seed/shop.process.js';
import { TeamProcess } from './seed/team.process.js';
import { ProjectProcess } from './seed/project.process.js';
import { SchedulingProcess } from './seed/scheduling.process.js';
import { DescriptionBulletProcess } from './seed/description-bullet.process.js';
import { BOMProcess } from './seed/bom.process.js';
import { TaskProcess } from './seed/tasks.process.js';
import { WorkPackageProcess } from './seed/work-package.process.js';
import { ChangeRequestProcess } from './seed/change-request.process.js';
import { EventProcess } from './seed/event.process.js';
import { ReimbursementRequestProcess } from './seed/reimbursement-request.process.js';
import { SponsorProcess } from './seed/sponsor.process.js';
import { PartProcess } from './seed/parts.process.js';
import { OrganizationContentProcess } from './seed/organization-content.process.js';
import { GraphProcess } from './seed/graphs.process.js';

const prisma = new PrismaClient();

await new SeedRunner()
  .withPrisma(prisma)
  .register(
    new OrganizationProcess(),
    new CarProcess(),
    new UsersProcess(),
    new ConfigDataProcess(),
    new SchedulingProcess(),
    new TeamProcess(),
    new ShopProcess(),
    new ProjectProcess(),
    new WorkPackageProcess(),
    new DescriptionBulletProcess(),
    new BOMProcess(),
    new EventProcess(),
    new TaskProcess(),
    new ChangeRequestProcess(),
    new ReimbursementRequestProcess(),
    new PartProcess(),
    new SponsorProcess(),
    new OrganizationContentProcess(),
    new GraphProcess()
  )
  .run();

await prisma.$disconnect();
