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
import { TeamProcess } from './seed/team.process.js';
import { ProjectProcess } from './seed/project.process.js';
import { SchedulingProcess } from './seed/scheduling.process.js';

const prisma = new PrismaClient();

// ORDER MATTERS AT THE MOMENT. I am still looking into topological sort so that order won't matter here.
await new SeedRunner()
  .withPrisma(prisma)
  .register(
    new OrganizationProcess(),
    new CarProcess(),
    new UsersProcess(),
    new ConfigDataProcess(),
    new SchedulingProcess(),
    new TeamProcess(),
    new ProjectProcess()
  )
  .run();

await prisma.$disconnect();
