/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  CR_Type,
  PrismaClient,
  Scope_CR_Why_Type,
  Task_Priority,
  Task_Status,
  Team,
  WBS_Element_Status,
  Work_Package_Stage
} from '@prisma/client';
import { dbSeedAllUsers } from './seed-data/users.seed';
import { dbSeedAllTeams } from './seed-data/teams.seed';
import ChangeRequestsService from '../services/change-requests.services';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import TeamsService from '../services/teams.services';
import RisksService from '../services/risks.services';
import WorkPackagesService from '../services/work-packages.services';
import { validateWBS, WbsElementStatus, WorkPackageStage } from 'shared';
import TasksService from '../services/tasks.services';
import DescriptionBulletsService from '../services/description-bullets.services';
import { seedProject } from './seed-data/projects.seed';
import { seedWorkPackage } from './seed-data/work-packages.seed';

const prisma = new PrismaClient();

const performSeed: () => Promise<void> = async () => {
  const thomasEmrax = await prisma.user.create({ data: dbSeedAllUsers.thomasEmrax });
  const joeShmoe = await prisma.user.create({ data: dbSeedAllUsers.joeShmoe });
  const joeBlow = await prisma.user.create({ data: dbSeedAllUsers.joeBlow });
  const wonderwoman = await prisma.user.create({ data: dbSeedAllUsers.wonderwoman });
  const flash = await prisma.user.create({ data: dbSeedAllUsers.flash });
  const aquaman = await prisma.user.create({ data: dbSeedAllUsers.aquaman });
  const robin = await prisma.user.create({ data: dbSeedAllUsers.robin });
  const batman = await prisma.user.create({ data: dbSeedAllUsers.batman });
  const superman = await prisma.user.create({ data: dbSeedAllUsers.superman });
  const hawkMan = await prisma.user.create({ data: dbSeedAllUsers.hawkMan });
  const hawkWoman = await prisma.user.create({ data: dbSeedAllUsers.hawkWoman });
  const cyborg = await prisma.user.create({ data: dbSeedAllUsers.cyborg });
  const greenLantern = await prisma.user.create({ data: dbSeedAllUsers.greenLantern });
  const martianManhunter = await prisma.user.create({ data: dbSeedAllUsers.martianManhunter });
  const nightwing = await prisma.user.create({ data: dbSeedAllUsers.nightwing });
  const brandonHyde = await prisma.user.create({ data: dbSeedAllUsers.brandonHyde });
  const calRipken = await prisma.user.create({ data: dbSeedAllUsers.calRipken });
  const adleyRutschman = await prisma.user.create({ data: dbSeedAllUsers.adleyRutschman });
  const johnHarbaugh = await prisma.user.create({ data: dbSeedAllUsers.johnHarbaugh });
  const lamarJackson = await prisma.user.create({ data: dbSeedAllUsers.lamarJackson });

  /**
   * Make initial project so that we can start to create other stuff
   */
  const genesisProject = await prisma.project.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Genesis',
          status: WBS_Element_Status.INACTIVE,
          projectLeadId: batman.userId,
          projectManagerId: cyborg.userId
        }
      },
      summary: 'Initial Car so that we can make change requests and projects and other stuff',
      budget: 1000,
      rules: []
    },
    ...projectQueryArgs
  });

  /**
   * Make an initial change request for car 1 using the wbs of the genesis project
   */
  const changeRequest1Id: number = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    genesisProject.wbsElement.carNumber,
    genesisProject.wbsElement.projectNumber,
    genesisProject.wbsElement.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize all the seed data'
      }
    ]
  );

  // make a proposed solution for it
  const proposedSolution1Id: string = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequest1Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact'
  );

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequest1Id, 'LGTM', true, proposedSolution1Id);

  /**
   * TEAMS
   */
  /** Creating Teams */
  const justiceLeague: Team = await prisma.team.create(dbSeedAllTeams.justiceLeague(batman.userId));
  const ravens: Team = await prisma.team.create(dbSeedAllTeams.ravens(johnHarbaugh.userId));
  const orioles: Team = await prisma.team.create(dbSeedAllTeams.orioles(brandonHyde.userId));
  const huskies: Team = await prisma.team.create(dbSeedAllTeams.huskies(thomasEmrax.userId));

  /** Setting Team Members */
  await TeamsService.setTeamMembers(
    batman,
    justiceLeague.teamId,
    [wonderwoman, flash, aquaman, superman, hawkMan, hawkWoman, cyborg, greenLantern, martianManhunter].map(
      (user) => user.userId
    )
  );
  await TeamsService.setTeamMembers(johnHarbaugh, ravens.teamId, [lamarJackson.userId]);
  await TeamsService.setTeamMembers(brandonHyde, orioles.teamId, [adleyRutschman.userId, calRipken.userId]);
  await TeamsService.setTeamMembers(thomasEmrax, huskies.teamId, [joeShmoe.userId, joeBlow.userId]);

  /**
   * Projects
   */

  /** Project 1 */
  const { projectWbsNumber: project1WbsNumber, projectId: project1Id } = await seedProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Impact Attenuator',
    'Develop rules-compliant impact attenuator',
    huskies.teamId,
    joeShmoe,
    124,
    ['EV3.5.2'],
    ['Decrease size by 90% from 247 cubic inches to 24.7 cubic inches'],
    ['Capable of absorbing 5000N in a head-on collision'],
    ['Cannot go further towards the rear of the car than the front roll hoop'],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    thomasEmrax.userId,
    joeBlow.userId
  );

  await RisksService.createRisk(thomasEmrax, project1Id, 'This one could get too expensive');
  await RisksService.createRisk(joeShmoe, project1Id, 'This Imact could Attenuate too much!');
  const risk3Id = await RisksService.createRisk(thomasEmrax, project1Id, 'At risk of nuclear explosion');
  const risk3 = await prisma.risk.findUniqueOrThrow({ where: { id: risk3Id } });
  await RisksService.editRisk(thomasEmrax, risk3Id, risk3.detail, true);

  /** Project 2 */
  const { projectWbsNumber: project2WbsNumber, projectId: project2Id } = await seedProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Bodywork',
    'Develop rules-compliant bodywork',
    huskies.teamId,
    thomasEmrax,
    50,
    ['T12.3.2', 'T8.2.6'],
    ['Decrease weight by 90% from 4.8 pounds to 0.48 pounds'],
    ['Provides removable section for easy access to the pedal box'],
    ['Compatible with a side-pod chassis design'],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    thomasEmrax.userId
  );

  /** Project 3 */
  const { projectWbsNumber: project3WbsNumber, projectId: project3Id } = await seedProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Battery Box',
    'Develop rules-compliant battery box.',
    huskies.teamId,
    thomasEmrax,
    5000,
    ['EV3.5.2', 'EV1.4.7', 'EV6.3.10'],
    ['Decrease weight by 60% from 100 pounds to 40 pounds'],
    ['Provides 50,000 Wh of energy discharge'],
    ['Maximum power consumption of 25 watts from the low voltage system'],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    thomasEmrax.userId
  );

  /** Project 4 */
  const { projectWbsNumber: project4WbsNumber, projectId: project4Id } = await seedProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Motor Controller Integration',
    'Develop rules-compliant motor controller integration.',
    huskies.teamId,
    thomasEmrax,
    0,
    [],
    ['Power consumption stays under 10 watts from the low voltage system'],
    ['Capable of interfacing via I2C or comparable serial interface.'],
    ['Must be compatible with chain drive', 'Must be well designed and whatnot'],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    joeBlow.userId
  );

  /** Project 5 */
  const { projectWbsNumber: project5WbsNumber, projectId: project5Id } = await seedProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Wiring Harness',
    'Develop rules-compliant wiring harness.',
    huskies.teamId,
    thomasEmrax,
    234,
    ['EV3.5.2', 'T12.3.2', 'T8.2.6', 'EV1.4.7', 'EV6.3.10'],
    ['Decrease installed component costs by 63% from $2,700 to $1000'],
    ['All wires are bundled and secured to the chassis at least every 6 inches', 'Wires are not wireless'],
    ['Utilizes 8020 frame construction'],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    thomasEmrax.userId,
    joeBlow.userId
  );

  /**
   * Work Packages
   */
  /** Work Package 1 */
  const { workPackageWbsNumber: workPackage1WbsNumber, workPackage: workPackage1 } = await seedWorkPackage(
    joeShmoe,
    project1WbsNumber,
    'Bodywork Concept of Design',
    changeRequest1Id,
    WorkPackageStage.Design,
    '01/01/2023',
    3,
    [],
    [
      'Assess the bodywork captsone and determine what can be learned from their deliverables',
      'Compare various material, design, segmentation, and mounting choices available and propose the best combination'
    ],
    ['High-level anaylsis of options and direction to go in for the project'],
    thomasEmrax,
    WbsElementStatus.Active,
    thomasEmrax.userId,
    thomasEmrax.userId
  );

  await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.expectedActivities[0].descriptionId);

  /** Work Package 2 */
  const { workPackageWbsNumber: workPackage2WbsNumber, workPackage: workPackage2 } = await seedWorkPackage(
    thomasEmrax,
    project1WbsNumber,
    'Adhesive Shear Strength Test',
    changeRequest1Id,
    WorkPackageStage.Research,
    '01/22/2023',
    5,
    [],
    [
      'Build a test procedure for destructively measuring the shear strength of various adhesives interacting with foam and steel plates',
      'Design and manufacture test fixtures to perform destructive testing',
      'Write a report to summarize findings'
    ],
    [
      'Lab report with full data on the shear strength of adhesives under test including a summary and conclusion of which adhesive is best'
    ],
    thomasEmrax,
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId
  );

  /** Work Package 3 */
  const workPackage3WbsString = await WorkPackagesService.createWorkPackage(
    thomasEmrax,
    project5WbsNumber,
    'Manufacture Wiring Harness',
    changeRequest1Id,
    WorkPackageStage.Manufacturing,
    '02/01/2023',
    3,
    [],
    [
      'Manufacutre section A of the wiring harness',
      'Determine which portion of the wiring harness is important',
      'Solder wiring segments together and heat shrink properly',
      'Cut all wires to length'
    ],
    ['Completed wiring harness for the entire car']
  );
  const workPackage3WbsNumber = validateWBS(workPackage3WbsString);

  /**
   * Change Requests
   */
  await ChangeRequestsService.createStageGateChangeRequest(
    thomasEmrax,
    workPackage1WbsNumber.carNumber,
    workPackage1WbsNumber.projectNumber,
    workPackage1WbsNumber.workPackageNumber,
    CR_Type.STAGE_GATE,
    true
  );

  const changeRequest2Id = await ChangeRequestsService.createStandardChangeRequest(
    thomasEmrax,
    project2WbsNumber.carNumber,
    project2WbsNumber.projectNumber,
    project2WbsNumber.workPackageNumber,
    CR_Type.DEFINITION_CHANGE,
    'Change the bodywork to be hot pink',
    [
      { type: Scope_CR_Why_Type.DESIGN, explain: 'It would be really pretty' },
      { type: Scope_CR_Why_Type.ESTIMATION, explain: 'I estimate that it would be really pretty' }
    ]
  );
  await ChangeRequestsService.addProposedSolution(thomasEmrax, changeRequest2Id, 50, 'Buy hot pink paint', 1, 'n/a');
  await ChangeRequestsService.addProposedSolution(
    thomasEmrax,
    changeRequest2Id,
    40,
    'Buy slightly cheaper but lower quality hot pink paint',
    1,
    'n/a'
  );
  await ChangeRequestsService.reviewChangeRequest(joeShmoe, changeRequest2Id, 'What the hell Thomas', false, null);

  await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage3WbsNumber.carNumber,
    workPackage3WbsNumber.projectNumber,
    workPackage3WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    thomasEmrax.userId,
    joeShmoe.userId,
    new Date('02/01/2023'),
    true
  );

  /**
   * Tasks
   */
  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Research attenuation',
    "I don't know what attenuation is yet",
    new Date('01/01/2024'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Design Attenuator',
    'Autocad?',
    new Date('01/01/2024'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    joeBlow,
    project1WbsNumber,
    'Research Impact',
    'Autocad?',
    new Date('01/01/2024'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId, joeBlow.userId]
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Impact Test',
    'Use our conveniently available jumbo watermelon and slingshot to test how well our impact attenuator can ' +
      'attenuate impact.',
    new Date('2024-02-17T00:00:00-05:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [joeBlow.userId]
  );

  await TasksService.createTask(
    joeBlow,
    project1WbsNumber,
    'Review Compliance',
    'I think there are some rules we may or may not have overlooked...',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project1WbsNumber,
    'Decorate Impact Attenuator',
    'You know you want to.',
    new Date('2024-01-20T00:00:00-05:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId]
  );

  await TasksService.createTask(
    lamarJackson,
    project1WbsNumber,
    'Meet with the Department of Transportation',
    'Discuss design decisions',
    new Date('2023-05-19T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId]
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Build Attenuator',
    'WOOOO',
    new Date('01/01/2024'),
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project1WbsNumber,
    "Drive Northeastern Electric Racing's Hand-Built Car That Tops Out at 100 mph",
    "It was a chilly November night and Matthew McCauley's breath was billowing out in front of him when he took hold " +
      "of the wheel and put pedal to the metal. Accelerating down straightaways and taking corners with finesse, it's " +
      'easy to forget McCauley, in his blue racing jacket and jet black helmet, is racing laps around the roof of ' +
      "Columbus Parking Garage on Northeastern's Boston campus. But that's the reality of Northeastern Electric " +
      'Racing, a student club that has made due and found massive success in the world of electric racing despite its ' +
      "relative rookie status. McCauley, NER's chief electrical engineer, has seen the club's car, Cinnamon, go from " +
      'a 5-foot drive test to hitting 60 miles per hour in competitions. "It\'s a go-kart that has 110 kilowatts of ' +
      'power, 109 kilowatts of power," says McCauley, a fourth-year electrical and computer engineering student. ' +
      '"That\'s over 100 horsepower."',
    new Date('2022-11-16T00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    brandonHyde,
    project1WbsNumber,
    'Safety Training',
    'how to use (or not use) the impact attenuator',
    new Date('2023-03-15T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Double-Check Inventory',
    'Nobody really wants to do this...',
    new Date('2023-04-01T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.IN_BACKLOG,
    []
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Aerodynamics Test',
    'Wind go wooooosh',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    johnHarbaugh,
    project2WbsNumber,
    'Ask Sponsors About Logo Sticker Placement',
    'the more sponsors the cooler we look',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeShmoe.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Discuss Design With Powertrain Team',
    '',
    new Date('2023-10-31T00:00:00-04:00'),
    Task_Priority.MEDIUM,
    Task_Status.DONE,
    [thomasEmrax.userId]
  );

  await TasksService.createTask(
    batman,
    project3WbsNumber,
    'Power the Battery Box',
    'With all our powers combined, we can win any Electric Racing competition!',
    new Date('2024-05-01T00:00:00-04:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [thomasEmrax, joeShmoe, joeBlow].map((user) => user.userId)
  );

  await TasksService.createTask(
    thomasEmrax,
    project3WbsNumber,
    'Wire Up Battery Box',
    'Too many wires... how to even keep track?',
    new Date('2024-02-29T00:00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project3WbsNumber,
    'Vibration Tests',
    "Battery box shouldn't blow up in the middle of racing...",
    new Date('2024-03-17T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId]
  );

  await TasksService.createTask(
    joeShmoe,
    project3WbsNumber,
    'Buy some Battery Juice',
    'mmm battery juice',
    new Date('2024-04-15T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeBlow.userId]
  );

  await TasksService.createTask(
    thomasEmrax,
    project4WbsNumber,
    'Schematics',
    'schematics go brrrrr',
    new Date('2024-04-15T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeBlow.userId]
  );

  await TasksService.createTask(
    batman,
    project5WbsNumber,
    'Cost Assessment',
    'So this is where our funding goes',
    new Date('2023-06-23T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId]
  );
};

performSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
