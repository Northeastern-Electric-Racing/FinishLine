import { ClubAccount, ReimbursementStatusType } from 'shared';
import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import {
  GiveMeMoneyProduct,
  GiveMeMyMoney,
  GiveMeMyMoney2,
  Parts,
  PopEyes,
  exampleSaboSubmittedStatus,
  examplePendingFinanceStatus,
  prismaGiveMeMyMoney,
  prismaGiveMeMyMoney2,
  prismaGiveMeMyMoney3,
  prismaGiveMeMyMoney4,
  prismaGiveMeMyMoney5,
  prismaReimbursementStatus,
  sharedGiveMeMyMoney
} from './test-data/reimbursement-requests.test-data';
import {
  alfred,
  batman,
  flash,
  sharedBatman,
  superman,
  wonderwoman,
  theVisitor,
  aquaman,
  greenlantern
} from './test-data/users.test-data';
import reimbursementRequestQueryArgs from '../src/prisma-query-args/reimbursement-requests.query-args';
import { Prisma, Reimbursement_Status_Type } from '@prisma/client';
import {
  reimbursementRequestTransformer,
  reimbursementTransformer
} from '../src/transformers/reimbursement-requests.transformer';
import { justiceLeague, prismaTeam1, primsaTeam2 } from './test-data/teams.test-data';

describe('Reimbursement Requests', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Vendor Tests', () => {
    beforeAll(() => {
      // Circular Dependency Check
      expect(prismaTeam1.head).toBeDefined();
      expect(primsaTeam2.head).toBeDefined();
    });

    test('Get all vendors works', async () => {
      vi.spyOn(prisma.vendor, 'findMany').mockResolvedValue([]);

      const res = await ReimbursementRequestService.getAllVendors();

      expect(prisma.vendor.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });

    test('Create Vendor throws error if user is not admin or finance lead', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      await expect(ReimbursementRequestService.createVendor(aquaman, 'HOLA BUDDY')).rejects.toThrow(
        new AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.')
      );
    });

    test('Create Vendor works for finance leads', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);
      await expect(ReimbursementRequestService.createVendor(wonderwoman, 'HOLA BUDDY')).resolves.not.toThrow(
        new AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.')
      );
    });

    test('Create Vendor works for finance head', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...primsaTeam2, headId: 5 });
      vi.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);
      await expect(ReimbursementRequestService.createVendor(greenlantern, 'HOLA BUDDY')).resolves.not.toThrow(
        new AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.')
      );
    });

    test('Create Vendor works for admin', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);
      await expect(ReimbursementRequestService.createVendor(flash, 'HOLA BUDDY')).resolves.not.toThrow(
        new AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.')
      );
    });

    test('Create Vendor Successfully returns vendor Id', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(prismaTeam1);
      vi.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);

      const vendor = await ReimbursementRequestService.createVendor(batman, 'HOLA BUDDY');

      expect(vendor.vendorId).toBe('CHICKEN');
    });
  });

  describe('Expense Tests', () => {
    test('Create Expense Type fails for non admins', async () => {
      await expect(
        ReimbursementRequestService.createExpenseType(wonderwoman, Parts.name, Parts.code, Parts.allowed, [ClubAccount.CASH])
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create expense types'));
    });

    test('Create Expense Type Successfully returns expense type Id', async () => {
      vi.spyOn(prisma.expense_Type, 'create').mockResolvedValue(Parts);

      const expenseType = await ReimbursementRequestService.createExpenseType(
        batman,
        Parts.name,
        Parts.code,
        Parts.allowed,
        [ClubAccount.BUDGET]
      );

      expect(expenseType.expenseTypeId).toBe(Parts.expenseTypeId);
    });
  });

  describe('Get User Reimbursement Request Tests', () => {
    test('successfully calls the Prisma function', async () => {
      // mock prisma calls
      const prismaGetManySpy = vi.spyOn(prisma.reimbursement_Request, 'findMany');
      prismaGetManySpy.mockResolvedValue([prismaGiveMeMyMoney]);

      // act
      const matches = await ReimbursementRequestService.getUserReimbursementRequests(batman);

      // assert
      expect(prismaGetManySpy).toBeCalledTimes(1);
      expect(prismaGetManySpy).toBeCalledWith({
        where: { dateDeleted: null, recipientId: batman.userId },
        ...reimbursementRequestQueryArgs
      });
      expect(matches).toHaveLength(1);
    });
  });

  describe('Get Pending Advisor Reimbursement Request Tests', () => {
    // just an example of what prisma request might return
    const findManyResult: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
      ...prismaGiveMeMyMoney,
      saboId: 42,
      reimbursementStatuses: [
        { ...examplePendingFinanceStatus, user: batman },
        {
          reimbursementStatusId: 2,
          type: Reimbursement_Status_Type.SABO_SUBMITTED,
          userId: batman.userId,
          dateCreated: new Date('2023-08-20T08:02:00Z'),
          reimbursementRequestId: '',
          user: batman
        }
      ]
    };

    test('calls the Prisma function to get reimbursement requests', async () => {
      // mock prisma calls
      const prismaGetManySpy = vi.spyOn(prisma.reimbursement_Request, 'findMany');
      prismaGetManySpy.mockResolvedValue([findManyResult]);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

      // act
      const matches = await ReimbursementRequestService.getPendingAdvisorList(flash);

      // assert
      expect(prismaGetManySpy).toBeCalledTimes(1);
      expect(matches).toHaveLength(1);
      expect(matches).toEqual([reimbursementRequestTransformer(findManyResult)]);
    });

    test('calls the Prisma function to check finance team', async () => {
      // mock prisma calls
      vi.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([findManyResult]);
      const prismaFindTeamSpy = vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

      // act
      await ReimbursementRequestService.getPendingAdvisorList(flash);

      // assert
      expect(prismaFindTeamSpy).toBeCalledTimes(1);
      expect(prismaFindTeamSpy).toBeCalledWith({
        where: { teamId: process.env.FINANCE_TEAM_ID },
        include: { head: true, leads: true, members: true }
      });
    });

    test('fails if user is not on finance team', async () => {
      // mock prisma calls
      const prismaGetManySpy = vi.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([findManyResult]);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...primsaTeam2, headId: 1 });

      // act
      const action = async () => await ReimbursementRequestService.getPendingAdvisorList(alfred);
      await expect(action).rejects.toEqual(new AccessDeniedException(`You are not a member of the finance team!`));

      // assert
      expect(prismaGetManySpy).toBeCalledTimes(0);
    });
  });

  describe('Edit Reimbursement Request Tests', () => {
    test('Request Fails When Id does not exist', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          batman
        )
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Edit Reimbursement Request Fails When Request is deleted', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDeleted: new Date()
      });

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          batman
        )
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Edit Reimbursement Request Fails When User is not the recipient', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          superman
        )
      ).rejects.toThrow(new AccessDeniedException('Only the creator or finance team can edit a reimbursement request'));
    });

    test('Edit Reimbursement Request fails if Submitter not on Finance Team', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...primsaTeam2, headId: 1 });
      await expect(
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          alfred
        )
      ).rejects.toThrow(new AccessDeniedException('Only the creator or finance team can edit a reimbursement request'));
    });

    test('Edit Reimbursement Request Fails When Vendor does not exist', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      vi.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          batman
        )
      ).rejects.toThrow(new NotFoundException('Vendor', GiveMeMyMoney.vendorId));
    });

    test('Edit Reimbursement Request Fails When Expense Type does not exist', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      vi.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      vi.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          [],
          batman
        )
      ).rejects.toThrow(new NotFoundException('Expense Type', GiveMeMyMoney.expenseTypeId));
    });

    test('Edit Reimbursement Request Fails When Product Has An Id but does not already exist of reimbursement request', async () => {
      const GiveMeMyMoneyWithoutProduct = {
        ...GiveMeMyMoney,
        reimbursementProducts: []
      };
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithoutProduct);
      vi.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      vi.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(Parts);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [
            {
              id: '1',
              name: 'test',
              cost: 1,
              wbsNum: {
                carNumber: 1,
                projectNumber: 1,
                workPackageNumber: 1
              }
            }
          ],
          [],
          batman
        )
      ).rejects.toThrow(new HttpException(400, 'The following products do not exist: test'));
    });

    test('Edit Reimbursement Succeeds', async () => {
      const GiveMeMyMoneyWithProduct = { ...GiveMeMyMoney, reimbursementProducts: [GiveMeMoneyProduct] };
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithProduct);
      vi.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      vi.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(Parts);
      vi.spyOn(prisma.reimbursement_Request, 'update').mockResolvedValue(GiveMeMyMoney);
      vi.spyOn(prisma.reimbursement_Product, 'updateMany').mockResolvedValue({ count: 1 });
      vi.spyOn(prisma.reimbursement_Product, 'update').mockResolvedValue(GiveMeMoneyProduct);

      const reimbursementRequest = await ReimbursementRequestService.editReimbursementRequest(
        GiveMeMyMoney.reimbursementRequestId,
        GiveMeMyMoney.dateOfExpense,
        GiveMeMyMoney.vendorId,
        GiveMeMyMoney.account as ClubAccount,
        GiveMeMyMoney.expenseTypeId,
        GiveMeMyMoney.totalCost,
        [
          {
            id: '1',
            name: 'test',
            cost: 1,
            wbsNum: {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 1
            }
          }
        ],
        [],
        batman
      );

      expect(reimbursementRequest.reimbursementRequestId).toEqual(GiveMeMyMoney.reimbursementRequestId);
      expect(prisma.reimbursement_Request.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Reimbursement Request Tests', () => {
    test('Delete Reimbursement Request fails when Id does not exist', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Delete Reimbursement Request fails if project is already deleted', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({ ...GiveMeMyMoney, dateDeleted: new Date() });
      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Delete Reimbursement Request fails when deleter is not the creator', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);

      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, superman)
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this reimbursement request, only the creator can delete a reimbursement request'
        )
      );
    });

    test('Delete Reimbursement Request fails if it has been approved', async () => {
      const GiveMeMyMoneyWithStatus = { ...GiveMeMyMoney, reimbursementStatuses: [exampleSaboSubmittedStatus] };
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithStatus);

      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(
        new AccessDeniedException('You cannot delete this reimbursement request. It has already been approved')
      );
    });

    test('Delete Reimbursement Request succeeds', async () => {
      const GiveMeMyMoneyWithStatus = { ...GiveMeMyMoney, reimbursementStatuses: [] };
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithStatus);
      vi.spyOn(prisma.reimbursement_Request, 'update').mockResolvedValue({ ...GiveMeMyMoney, dateDeleted: new Date() });

      await ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman);

      expect(prisma.reimbursement_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.reimbursement_Request.update).toHaveBeenCalledTimes(1);
      expect(GiveMeMyMoney.dateDeleted).toBeDefined();
    });
  });

  describe('Get Reimbursement Requests Tests', () => {
    test('Get all Reimbursement Requests works', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      const res = await ReimbursementRequestService.getAllReimbursementRequests(batman);

      expect(prisma.reimbursement_Request.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
  });

  describe('Get All Expense Types Tests', () => {
    test('Get all Expense Types works', async () => {
      vi.spyOn(prisma.expense_Type, 'findMany').mockResolvedValue([Parts]);

      const res = await ReimbursementRequestService.getAllExpenseTypes();

      expect(prisma.expense_Type.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([Parts]);
    });
  });

  describe('Delivered Tests', () => {
    test('Mark as delivered fails for non submitter', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(wonderwoman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered'));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark as delivered fails for undefined ID', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(batman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark as delivered fails for already marked as delivered', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDelivered: new Date('12/25/203')
      });

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(batman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('Can only be marked as delivered once'));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark request as delivered successfully', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      vi.spyOn(prisma.reimbursement_Request, 'update').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDelivered: new Date('12/25/203')
      });

      const reimbursementRequest = await ReimbursementRequestService.markReimbursementRequestAsDelivered(
        batman,
        GiveMeMyMoney.reimbursementRequestId
      );

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
      expect(prisma.reimbursement_Request.update).toBeCalledTimes(1);

      expect(reimbursementRequest).toStrictEqual({ ...GiveMeMyMoney, dateDelivered: new Date('12/25/203') });
    });
  });

  describe('Get Single Reimbursement Request Tests', () => {
    test('Get Single Reimbursement Request fails when id does not exist', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Get Single Reimbursement Request fails when id is deleted', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDeleted: new Date()
      });

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Get Single Reimbursement Request fails when user is not the recipient and not a part of finance team', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('You do not have access to this reimbursement request'));
    });

    test('Get Single Reimbursement Request succeeds', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      const reimbursementRequest = await ReimbursementRequestService.getSingleReimbursementRequest(
        batman,
        GiveMeMyMoney.reimbursementRequestId
      );

      expect(reimbursementRequest).toEqual({
        ...sharedGiveMeMyMoney,
        reimbursementStatuses: [
          {
            reimbursementStatusId: 1,
            type: ReimbursementStatusType.PENDING_FINANCE,
            user: sharedBatman,
            dateCreated: expect.any(Date)
          }
        ]
      });
    });
  });

  describe('Approve Reimbursement Request Tests', () => {
    test('Approve Reimbursement Request fails if Submitter not on Finance Team', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...primsaTeam2, headId: 1 });
      await expect(
        ReimbursementRequestService.approveReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new AccessDeniedException(`You are not a member of the finance team!`));
    });

    test('Approve Reimbursement Request fails if Finance Team does not exist', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);
      await expect(
        ReimbursementRequestService.approveReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new HttpException(500, 'Finance team does not exist!'));
    });

    test('Approve Reimbursement Request fails if the Request does not exist', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(
        ReimbursementRequestService.approveReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Approve Reimbursement Request fails if the Request has been deleted', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney2);

      await expect(
        ReimbursementRequestService.approveReimbursementRequest(GiveMeMyMoney2.reimbursementRequestId, alfred)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney2.reimbursementRequestId));
    });

    test('Approve Reimbursement Request fails if the request has already been approved', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney2);

      await expect(
        ReimbursementRequestService.approveReimbursementRequest(prismaGiveMeMyMoney2.reimbursementRequestId, alfred)
      ).rejects.toThrow(new HttpException(400, 'This reimbursement request has already been approved'));
    });
    test('Approve Reimbursment Request success', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney3);
      vi.spyOn(prisma.reimbursement_Status, 'create').mockResolvedValue(prismaReimbursementStatus);

      const reimbursementStatus = await ReimbursementRequestService.approveReimbursementRequest(
        prismaGiveMeMyMoney3.reimbursementRequestId,
        alfred
      );

      expect(reimbursementStatus.reimbursementStatusId).toStrictEqual(prismaReimbursementStatus.reimbursementStatusId);
    });
  });

  describe('Deny Reimbursement Request Tests', () => {
    test('Deny Reimbursement Request fails if Submitter not on Finance Team', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...primsaTeam2, headId: 1 });
      await expect(
        ReimbursementRequestService.denyReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new AccessDeniedException(`You are not a member of the finance team!`));
    });

    test('Deny Reimbursement Request fails if Finance Team does not exist', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);
      await expect(
        ReimbursementRequestService.denyReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new HttpException(500, 'Finance team does not exist!'));
    });

    test('Deny Reimbursement Request fails if the Request does not exist', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(
        ReimbursementRequestService.denyReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, alfred)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Deny Reimbursement Request fails if the Request has been deleted', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney2);

      await expect(
        ReimbursementRequestService.denyReimbursementRequest(GiveMeMyMoney2.reimbursementRequestId, alfred)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney2.reimbursementRequestId));
    });

    test('Deny Reimbursement Request fails if the request has already been denied', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney4);

      await expect(
        ReimbursementRequestService.denyReimbursementRequest(prismaGiveMeMyMoney4.reimbursementRequestId, alfred)
      ).rejects.toThrow(new HttpException(400, 'This reimbursement request has already been denied'));
    });
    test('Deny Reimbursement Request fails if the request has already been reimbursed', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney5);

      await expect(
        ReimbursementRequestService.denyReimbursementRequest(prismaGiveMeMyMoney5.reimbursementRequestId, alfred)
      ).rejects.toThrow(new HttpException(400, 'This reimbursement request has already been reimbursed'));
    });
    test('Deny Reimbursement Request success', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(primsaTeam2);
      vi.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney3);
      vi.spyOn(prisma.reimbursement_Status, 'create').mockResolvedValue(prismaReimbursementStatus);

      const reimbursementStatus = await ReimbursementRequestService.denyReimbursementRequest(
        prismaGiveMeMyMoney3.reimbursementRequestId,
        alfred
      );

      expect(reimbursementStatus.reimbursementStatusId).toStrictEqual(prismaReimbursementStatus.reimbursementStatusId);
    });
  });

  describe('Reimbursement User Tests', () => {
    test('Throws an error if user is a guest', async () => {
      await expect(ReimbursementRequestService.reimburseUser(100, '2023-01-11T11:12:33.409Z', theVisitor)).rejects.toThrow(
        new AccessDeniedException('Guests cannot reimburse a user for their expenses.')
      );
    });

    test('Throws an error if reimbursement amount is greater than owed', async () => {
      vi.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([prismaGiveMeMyMoney]);
      vi.spyOn(prisma.reimbursement, 'findMany').mockResolvedValue([
        {
          amount: 100,
          reimbursementId: '1',
          dateCreated: new Date(),
          userSubmittedId: batman.userId,
          purchaserId: batman.userId
        }
      ]);

      await expect(ReimbursementRequestService.reimburseUser(200, '2023-01-01T09:12:33.409Z', batman)).rejects.toThrow(
        new HttpException(400, 'Reimbursement is greater than the total amount owed to the user')
      );
    });

    test('Creates a new reimbursement for a user', async () => {
      const totalOwed = GiveMeMyMoney.totalCost;
      const reimbursementAmount = 50;
      const reimbursementMock = {
        reimbursementId: 'reimbursementMockId',
        purchaserId: batman.userId,
        amount: reimbursementAmount,
        dateCreated: new Date('2023-01-01'),
        userSubmitted: batman,
        userSubmittedId: batman.userId
      };

      vi.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([prismaGiveMeMyMoney]);
      vi.spyOn(prisma.reimbursement, 'findMany').mockResolvedValue([
        {
          amount: totalOwed - reimbursementAmount,
          reimbursementId: '1',
          dateCreated: new Date(),
          userSubmittedId: batman.userId,
          purchaserId: batman.userId
        }
      ]);
      vi.spyOn(prisma.reimbursement, 'create').mockResolvedValue(reimbursementMock);

      const newReimbursement = await ReimbursementRequestService.reimburseUser(
        reimbursementAmount,
        '2023-01-01T19:12:33.409Z',
        batman
      );

      expect(newReimbursement).toStrictEqual(reimbursementTransformer(reimbursementMock));
    });
  });
});
