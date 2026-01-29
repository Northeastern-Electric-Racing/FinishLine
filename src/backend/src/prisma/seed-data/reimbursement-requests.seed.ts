/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization, Vendor } from '@prisma/client';
import { IndexCode, ReimbursementRequest } from 'shared';
import ReimbursementRequestService from '../../services/reimbursement-requests.services.js';
import prisma from '../prisma.js';

/**
 * Seeds comprehensive reimbursement request data with various statuses and assignees
 *
 * @param users Object containing all seeded users (with userSettings and userSecureSettings)
 * @param vendors Object containing seeded vendors
 * @param indexCodes Object containing seeded index codes
 * @param accountCodes Object containing seeded account codes
 * @param organization The organization to seed data for
 * @returns Array of created reimbursement requests
 */
export const seedReimbursementRequests = async (
  users: {
    thomasEmrax: any;
    joeShmoe: any;
    batman: any;
    superman: any;
    flash: any;
    aquaman: any;
    wonderwoman: any;
    greenLantern: any;
    cyborg: any;
    martianManhunter: any;
    robin: any;
    nightwing: any;
    aang: any;
    katara: any;
    sokka: any;
    toph: any;
    zuko: any;
    monopolyMan: any;
    mrKrabs: any;
    richieRich: any;
    johnBoddy: any;
    regina: any;
    cady: any;
    gretchen: any;
    karen: any;
    spongebob: any;
    patrick: any;
    squidward: any;
    sandy: any;
  },
  vendors: {
    tesla: Vendor;
    amazon: Vendor;
    google: Vendor;
    microsoft: Vendor;
    apple: Vendor;
    costco: Vendor;
    walmart: Vendor;
    target: Vendor;
  },
  indexCodes: {
    cash: IndexCode;
    budget: IndexCode;
  },
  accountCodes: {
    equipment: { accountCodeId: string };
    things: { accountCodeId: string };
    stuff: { accountCodeId: string };
  },
  organization: Organization
): Promise<ReimbursementRequest[]> => {
  const reimbursementRequests: ReimbursementRequest[] = [];

  // RR #1: Pending Leadership Approval - Just created
  const rr1 = await ReimbursementRequestService.createReimbursementRequest(
    users.thomasEmrax,
    vendors.tesla.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'High Performance Battery Pack',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 350000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 350000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    3500,
    organization,
    new Date('2024-10-01')
  );
  reimbursementRequests.push(rr1);

  // RR #2: Pending Leadership Approval - Different user, with assignee
  const rr2 = await ReimbursementRequestService.createReimbursementRequest(
    users.batman,
    vendors.amazon.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Development Tools Kit',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 15000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 15000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    150,
    organization,
    new Date('2024-10-05')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr2.reimbursementRequestId,
    users.monopolyMan.userId
  );
  reimbursementRequests.push(rr2);

  // RR #3: Leadership Approved - Ready for finance review
  const rr3 = await ReimbursementRequestService.createReimbursementRequest(
    users.flash,
    vendors.google.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Cloud Storage Subscription',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 5000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 5000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    50,
    organization,
    new Date('2024-09-25')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr3.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr3.reimbursementRequestId,
    users.mrKrabs.userId
  );
  reimbursementRequests.push(rr3);

  // RR #4: Denied by leadership
  const rr4 = await ReimbursementRequestService.createReimbursementRequest(
    users.aquaman,
    vendors.apple.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Unnecessary Luxury Item',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 200000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 200000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    2000,
    organization,
    new Date('2024-09-20')
  );
  await ReimbursementRequestService.denyReimbursementRequest(rr4.reimbursementRequestId, users.thomasEmrax, organization);
  reimbursementRequests.push(rr4);

  // RR #5: Multiple products, pending leadership
  const rr5 = await ReimbursementRequestService.createReimbursementRequest(
    users.superman,
    vendors.costco.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Safety Equipment - Helmets',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 30000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 30000
          }
        ]
      },
      {
        name: 'Safety Equipment - Gloves',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 15000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 15000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    450,
    organization,
    new Date('2024-10-10')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr5.reimbursementRequestId,
    users.richieRich.userId
  );
  reimbursementRequests.push(rr5);

  // RR #6: Approved, marked as delivered
  const rr6 = await ReimbursementRequestService.createReimbursementRequest(
    users.wonderwoman,
    vendors.walmart.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Office Supplies',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 8000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 8000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    80,
    organization,
    new Date('2024-09-15')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr6.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.wonderwoman,
    rr6.reimbursementRequestId,
    organization,
    new Date('2024-09-30')
  );
  reimbursementRequests.push(rr6);

  // RR #7: Recent submission, no assignee yet
  const rr7 = await ReimbursementRequestService.createReimbursementRequest(
    users.greenLantern,
    vendors.target.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Testing Equipment',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 125000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 125000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    1250,
    organization,
    new Date('2024-10-12')
  );
  reimbursementRequests.push(rr7);

  // RR #8: Approved, assigned to finance member
  const rr8 = await ReimbursementRequestService.createReimbursementRequest(
    users.martianManhunter,
    vendors.microsoft.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Software Licenses',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 45000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 45000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    450,
    organization,
    new Date('2024-09-28')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr8.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.johnBoddy,
    organization,
    rr8.reimbursementRequestId,
    users.johnBoddy.userId
  );
  reimbursementRequests.push(rr8);

  // RR #9: From Avatar team member - pending approval
  const rr9 = await ReimbursementRequestService.createReimbursementRequest(
    users.aang,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Training Materials',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 12000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 12000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    120,
    organization,
    new Date('2024-10-08')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr9.reimbursementRequestId,
    users.monopolyMan.userId
  );
  reimbursementRequests.push(rr9);

  // RR #10: Another Avatar member - approved
  const rr10 = await ReimbursementRequestService.createReimbursementRequest(
    users.katara,
    vendors.google.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Research Database Access',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 20000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 20000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    200,
    organization,
    new Date('2024-09-18')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr10.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr10.reimbursementRequestId,
    users.mrKrabs.userId
  );
  reimbursementRequests.push(rr10);

  // RR #11: Sokka's request - small amount
  const rr11 = await ReimbursementRequestService.createReimbursementRequest(
    users.sokka,
    vendors.costco.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Workshop Snacks',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 5000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 5000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    50,
    organization,
    new Date('2024-10-11')
  );
  reimbursementRequests.push(rr11);

  // RR #12: Toph's request - approved and delivered
  const rr12 = await ReimbursementRequestService.createReimbursementRequest(
    users.toph,
    vendors.walmart.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Sensor Components',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 75000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 75000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    750,
    organization,
    new Date('2024-09-10')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr12.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.toph,
    rr12.reimbursementRequestId,
    organization,
    new Date('2024-09-25')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr12.reimbursementRequestId,
    users.richieRich.userId
  );
  reimbursementRequests.push(rr12);

  // RR #13: Zuko's urgent request
  const rr13 = await ReimbursementRequestService.createReimbursementRequest(
    users.zuko,
    vendors.apple.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Emergency Replacement Parts',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 180000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 180000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    1800,
    organization,
    new Date('2024-10-13')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr13.reimbursementRequestId,
    users.monopolyMan.userId
  );
  reimbursementRequests.push(rr13);

  // RR #14: Mean Girls team - Regina's request
  const rr14 = await ReimbursementRequestService.createReimbursementRequest(
    users.zuko,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Team Building Materials',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 25000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 25000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    250,
    organization,
    new Date('2024-10-07')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr14.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  reimbursementRequests.push(rr14);

  // RR #15: Cady's first request - pending
  const rr15 = await ReimbursementRequestService.createReimbursementRequest(
    users.cady,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Learning Resources',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 9000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 9000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    90,
    organization,
    new Date('2024-10-09')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr15.reimbursementRequestId,
    users.mrKrabs.userId
  );
  reimbursementRequests.push(rr15);

  // RR #16: Gretchen's supplies request
  const rr16 = await ReimbursementRequestService.createReimbursementRequest(
    users.gretchen,
    vendors.target.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Presentation Materials',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 6000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 6000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    60,
    organization,
    new Date('2024-10-06')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr16.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr16.reimbursementRequestId,
    users.richieRich.userId
  );
  reimbursementRequests.push(rr16);

  // RR #17: Karen's request - denied
  const rr17 = await ReimbursementRequestService.createReimbursementRequest(
    users.karen,
    vendors.apple.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Personal Electronics',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 150000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 150000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    1500,
    organization,
    new Date('2024-09-22')
  );
  await ReimbursementRequestService.denyReimbursementRequest(rr17.reimbursementRequestId, users.thomasEmrax, organization);
  reimbursementRequests.push(rr17);

  // RR #18: Robin's tool purchase
  const rr18 = await ReimbursementRequestService.createReimbursementRequest(
    users.robin,
    vendors.microsoft.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'CAD Software License',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 55000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 55000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    550,
    organization,
    new Date('2024-09-29')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr18.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.johnBoddy,
    organization,
    rr18.reimbursementRequestId,
    users.johnBoddy.userId
  );
  reimbursementRequests.push(rr18);

  // RR #19: Nightwing's electronics
  const rr19 = await ReimbursementRequestService.createReimbursementRequest(
    users.nightwing,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Microcontrollers',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 18000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 18000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    180,
    organization,
    new Date('2024-10-04')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr19.reimbursementRequestId,
    users.monopolyMan.userId
  );
  reimbursementRequests.push(rr19);

  // RR #20: Martian Manhunter's communication tools
  const rr20 = await ReimbursementRequestService.createReimbursementRequest(
    users.martianManhunter,
    vendors.google.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Video Conferencing Equipment',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 95000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 95000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    950,
    organization,
    new Date('2024-09-27')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr20.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.martianManhunter,
    rr20.reimbursementRequestId,
    organization,
    new Date('2024-10-08')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr20.reimbursementRequestId,
    users.mrKrabs.userId
  );
  reimbursementRequests.push(rr20);

  // RR #21: Spongebob's workshop materials
  const rr21 = await ReimbursementRequestService.createReimbursementRequest(
    users.spongebob,
    vendors.walmart.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Workshop Cleaning Supplies',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 7500,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 7500
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    75,
    organization,
    new Date('2024-10-10')
  );
  reimbursementRequests.push(rr21);

  // RR #22: Patrick's tools - approved
  const rr22 = await ReimbursementRequestService.createReimbursementRequest(
    users.spongebob,
    vendors.costco.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Hand Tools Set',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 22000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 22000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    220,
    organization,
    new Date('2024-09-24')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr22.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr22.reimbursementRequestId,
    users.richieRich.userId
  );
  reimbursementRequests.push(rr22);

  // RR #23: Joe Shmoe's prototype materials
  const rr23 = await ReimbursementRequestService.createReimbursementRequest(
    users.joeShmoe,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: '3D Printing Filament',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 14000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 14000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    140,
    organization,
    new Date('2024-10-02')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.johnBoddy,
    organization,
    rr23.reimbursementRequestId,
    users.johnBoddy.userId
  );
  reimbursementRequests.push(rr23);

  // RR #24: Large multi-product request from Batman - approved
  const rr24 = await ReimbursementRequestService.createReimbursementRequest(
    users.batman,
    vendors.costco.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Carbon Fiber Sheets',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 120000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 120000
          }
        ]
      },
      {
        name: 'Epoxy Resin',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 35000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 35000
          }
        ]
      },
      {
        name: 'Aluminum Stock',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 80000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 80000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    2350,
    organization,
    new Date('2024-09-12')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr24.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.batman,
    rr24.reimbursementRequestId,
    organization,
    new Date('2024-09-28')
  );
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr24.reimbursementRequestId,
    users.monopolyMan.userId
  );
  reimbursementRequests.push(rr24);

  // RR #25: Superman's testing equipment - very recent
  const rr25 = await ReimbursementRequestService.createReimbursementRequest(
    users.superman,
    vendors.tesla.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'High-Speed Data Acquisition System',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 425000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 425000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    4250,
    organization,
    new Date('2024-10-14')
  );
  reimbursementRequests.push(rr25);

  // RR #26: Pending Finance - Approved by leadership, waiting for finance review
  const rr26 = await ReimbursementRequestService.createReimbursementRequest(
    users.greenLantern,
    vendors.amazon.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Power Supply Units',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 18000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 18000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    180,
    organization,
    new Date('2024-09-10')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr26.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr26',
      name: 'receipt-rr26.pdf',
      createdByUserId: users.greenLantern.userId,
      reimbursementRequestId: rr26.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr26.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr26.reimbursementRequestId,
    users.richieRich.userId
  );
  reimbursementRequests.push(rr26);

  // RR #27: Pending Finance - Another one waiting for finance
  const rr27 = await ReimbursementRequestService.createReimbursementRequest(
    users.cyborg,
    vendors.microsoft.vendorId,
    indexCodes.budget.indexCodeId,
    [],
    [
      {
        name: 'Development Software Licenses',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 32000,
        refundSources: [
          {
            indexCode: indexCodes.budget,
            amount: 32000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    320,
    organization,
    new Date('2024-09-12')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr27.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr27',
      name: 'receipt-rr27.pdf',
      createdByUserId: users.cyborg.userId,
      reimbursementRequestId: rr27.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr27.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.johnBoddy,
    organization,
    rr27.reimbursementRequestId,
    users.johnBoddy.userId
  );
  reimbursementRequests.push(rr27);

  // RR #28: Pending Submission to SABO - Approved by finance, ready to send
  const rr28 = await ReimbursementRequestService.createReimbursementRequest(
    users.aang,
    vendors.google.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Cloud Computing Credits',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 50000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 50000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    500,
    organization,
    new Date('2024-08-15')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr28.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr28',
      name: 'receipt-rr28.pdf',
      createdByUserId: users.aang.userId,
      reimbursementRequestId: rr28.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr28.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr28.reimbursementRequestId,
    users.mrKrabs.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.aang,
    rr28.reimbursementRequestId,
    organization,
    new Date('2024-08-20')
  );
  reimbursementRequests.push(rr28);

  // RR #29: Pending Submission to SABO - Another one ready to send
  const rr29 = await ReimbursementRequestService.createReimbursementRequest(
    users.katara,
    vendors.walmart.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Safety Equipment',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 12000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 12000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    120,
    organization,
    new Date('2024-08-18')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr29.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr29',
      name: 'receipt-rr29.pdf',
      createdByUserId: users.katara.userId,
      reimbursementRequestId: rr29.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr29.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr29.reimbursementRequestId,
    users.monopolyMan.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.katara,
    rr29.reimbursementRequestId,
    organization,
    new Date('2024-08-22')
  );
  reimbursementRequests.push(rr29);

  // RR #30: Submitted to SABO - Waiting for SABO approval
  const rr30 = await ReimbursementRequestService.createReimbursementRequest(
    users.regina,
    vendors.apple.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Tablets for Design Team',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 150000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 150000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    1500,
    organization,
    new Date('2024-07-10')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr30.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr30',
      name: 'receipt-rr30.pdf',
      createdByUserId: users.regina.userId,
      reimbursementRequestId: rr30.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr30.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr30.reimbursementRequestId,
    users.richieRich.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.regina,
    rr30.reimbursementRequestId,
    organization,
    new Date('2024-07-15')
  );
  await ReimbursementRequestService.setSaboNumber(rr30.reimbursementRequestId, 12345, users.richieRich, organization);
  await ReimbursementRequestService.inputReimbursementRequestInSabo(
    rr30.reimbursementRequestId,
    users.richieRich,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
    rr30.reimbursementRequestId,
    users.regina,
    organization
  );
  reimbursementRequests.push(rr30);

  // RR #31: Submitted to SABO - Another one submitted
  const rr31 = await ReimbursementRequestService.createReimbursementRequest(
    users.patrick,
    vendors.costco.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Bulk Workshop Supplies',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 28000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 28000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    280,
    organization,
    new Date('2024-07-12')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr31.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr31',
      name: 'receipt-rr31.pdf',
      createdByUserId: users.patrick.userId,
      reimbursementRequestId: rr31.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr31.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.mrKrabs,
    organization,
    rr31.reimbursementRequestId,
    users.mrKrabs.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.patrick,
    rr31.reimbursementRequestId,
    organization,
    new Date('2024-07-18')
  );
  await ReimbursementRequestService.setSaboNumber(rr31.reimbursementRequestId, 12346, users.mrKrabs, organization);
  await ReimbursementRequestService.inputReimbursementRequestInSabo(
    rr31.reimbursementRequestId,
    users.mrKrabs,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
    rr31.reimbursementRequestId,
    users.patrick,
    organization
  );
  reimbursementRequests.push(rr31);

  // RR #32: Reimbursed - Fully completed
  const rr32 = await ReimbursementRequestService.createReimbursementRequest(
    users.joeShmoe,
    vendors.tesla.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Battery Testing Equipment',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 275000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 275000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    2750,
    organization,
    new Date('2024-06-01')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr32.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr32',
      name: 'receipt-rr32.pdf',
      createdByUserId: users.joeShmoe.userId,
      reimbursementRequestId: rr32.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr32.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.monopolyMan,
    organization,
    rr32.reimbursementRequestId,
    users.monopolyMan.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.joeShmoe,
    rr32.reimbursementRequestId,
    organization,
    new Date('2024-06-10')
  );
  await ReimbursementRequestService.setSaboNumber(rr32.reimbursementRequestId, 12340, users.monopolyMan, organization);
  await ReimbursementRequestService.inputReimbursementRequestInSabo(
    rr32.reimbursementRequestId,
    users.monopolyMan,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
    rr32.reimbursementRequestId,
    users.joeShmoe,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsReimbursed(
    rr32.reimbursementRequestId,
    users.monopolyMan,
    organization
  );
  reimbursementRequests.push(rr32);

  // RR #33: Reimbursed - Another completed one
  const rr33 = await ReimbursementRequestService.createReimbursementRequest(
    users.flash,
    vendors.amazon.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'PCB Manufacturing',
        reason: {
          carNumber: 0,
          projectNumber: 2,
          workPackageNumber: 0
        },
        cost: 89000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 89000
          }
        ]
      }
    ],
    accountCodes.equipment.accountCodeId,
    890,
    organization,
    new Date('2024-05-15')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr33.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr33',
      name: 'receipt-rr33.pdf',
      createdByUserId: users.flash.userId,
      reimbursementRequestId: rr33.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr33.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.johnBoddy,
    organization,
    rr33.reimbursementRequestId,
    users.johnBoddy.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.flash,
    rr33.reimbursementRequestId,
    organization,
    new Date('2024-05-20')
  );
  await ReimbursementRequestService.setSaboNumber(rr33.reimbursementRequestId, 12335, users.johnBoddy, organization);
  await ReimbursementRequestService.inputReimbursementRequestInSabo(
    rr33.reimbursementRequestId,
    users.johnBoddy,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
    rr33.reimbursementRequestId,
    users.flash,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsReimbursed(
    rr33.reimbursementRequestId,
    users.johnBoddy,
    organization
  );
  reimbursementRequests.push(rr33);

  // RR #34: Reimbursed - Third completed one
  const rr34 = await ReimbursementRequestService.createReimbursementRequest(
    users.wonderwoman,
    vendors.target.vendorId,
    indexCodes.cash.indexCodeId,
    [],
    [
      {
        name: 'Team Event Supplies',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 15000,
        refundSources: [
          {
            indexCode: indexCodes.cash,
            amount: 15000
          }
        ]
      }
    ],
    accountCodes.stuff.accountCodeId,
    150,
    organization,
    new Date('2024-05-05')
  );
  await ReimbursementRequestService.leadershipApproveReimbursementRequest(
    rr34.reimbursementRequestId,
    users.thomasEmrax,
    organization
  );
  // Add receipt for pending finance
  await prisma.receipt.create({
    data: {
      googleFileId: 'fake-google-file-id-rr34',
      name: 'receipt-rr34.pdf',
      createdByUserId: users.wonderwoman.userId,
      reimbursementRequestId: rr34.reimbursementRequestId
    }
  });
  await ReimbursementRequestService.markPendingFinance(users.thomasEmrax, rr34.reimbursementRequestId, organization);
  await ReimbursementRequestService.assignFinanceMember(
    users.richieRich,
    organization,
    rr34.reimbursementRequestId,
    users.richieRich.userId
  );
  await ReimbursementRequestService.markReimbursementRequestAsDelivered(
    users.wonderwoman,
    rr34.reimbursementRequestId,
    organization,
    new Date('2024-05-08')
  );
  await ReimbursementRequestService.setSaboNumber(rr34.reimbursementRequestId, 12330, users.richieRich, organization);
  await ReimbursementRequestService.inputReimbursementRequestInSabo(
    rr34.reimbursementRequestId,
    users.richieRich,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
    rr34.reimbursementRequestId,
    users.wonderwoman,
    organization
  );
  await ReimbursementRequestService.markReimbursementRequestAsReimbursed(
    rr34.reimbursementRequestId,
    users.richieRich,
    organization
  );
  reimbursementRequests.push(rr34);

  // Add comments to some reimbursement requests
  await ReimbursementRequestService.createReimbursementRequestComment(
    users.thomasEmrax,
    organization,
    'Please upload receipt when available',
    rr1.reimbursementRequestId
  );

  await ReimbursementRequestService.createReimbursementRequestComment(
    users.batman,
    organization,
    'Receipt uploaded to Google Drive',
    rr2.reimbursementRequestId
  );

  await ReimbursementRequestService.createReimbursementRequestComment(
    users.mrKrabs,
    organization,
    'Approved and ready for SABO submission',
    rr3.reimbursementRequestId
  );

  await ReimbursementRequestService.createReimbursementRequestComment(
    users.thomasEmrax,
    organization,
    'Request denied - item not in approved budget',
    rr4.reimbursementRequestId
  );

  await ReimbursementRequestService.createReimbursementRequestComment(
    users.wonderwoman,
    organization,
    'Items delivered and verified',
    rr6.reimbursementRequestId
  );

  await ReimbursementRequestService.createReimbursementRequestComment(
    users.monopolyMan,
    organization,
    'Following up with vendor on delivery date',
    rr13.reimbursementRequestId
  );

  return reimbursementRequests;
};
