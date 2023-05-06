import { Reimbursement_Status_Type, Team, User } from '@prisma/client';
import { Club_Account } from 'shared';
import prisma from '../prisma/prisma';
import { addReimbursementProducts } from '../utils/reimbursement-requests.utils';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
import transporter from '../utils/transporter.utils';

export default class ReimbursementRequestService {
  /**
   * Creates a reimbursement request in the database
   * @param receipient the user who is creating the reimbursement request
   * @param dateOfExpense the date that the expense occured
   * @param vendorId the id of the vendor that the expense was made for
   * @param account the account to be reimbursed from
   * @param receiptPictures the links to the s3 buckets to retrieve the pictures
   * @param reimbursementProducts the products that the user bought
   * @param expenseTypeId the id of the expense type the user made
   * @param totalCost the total cost of the reimbursement
   * @returns the id of the created reimbursement request
   */
  static async createReimbursementRequest(
    receipient: User,
    dateOfExpense: Date,
    vendorId: string,
    account: Club_Account,
    receiptPictures: string[],
    reimbursementProducts: { name: string; cost: number; wbsElementId: number }[],
    expenseTypeId: string,
    totalCost: number
  ): Promise<String> {
    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recepientId: receipient.userId,
        dateOfExpense,
        vendorId: vendor.vendorId,
        account,
        receiptPictures,
        expenseTypeId: expenseType.expenseTypeId,
        totalCost
      }
    });

    await addReimbursementProducts(reimbursementProducts, createdReimbursementRequest.reimbursementRequestId);

    prisma.reimbursement_Status.create({
      data: {
        type: 'PENDING_FINANCE',
        userId: receipient.userId,
        reimbursementRequestId: createdReimbursementRequest.reimbursementRequestId
      }
    });

    return createdReimbursementRequest.reimbursementRequestId;
  }

  /**
   * sends the pending advisor reimbursements to the advisor
   * @param sender the person sending the pending advisor list
   * @param saboNumbers the sabo numbers of the reimbursement requests to send
   */
  static async sendPendingAdvisorList(
    sender: User & {
      teams: Team[];
    },
    saboNumbers: number[]
  ) {
    if (!sender.teams.some((team) => team.teamId === process.env.FINANCE_TEAM_ID)) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        saboId: {
          in: saboNumbers
        }
      }
    });

    if (reimbursementRequests.length < saboNumbers.length) {
      const saboNumbersNotFound = saboNumbers.filter((saboNumber) => {
        return !reimbursementRequests.some((reimbursementRequest) => reimbursementRequest.saboId === saboNumber);
      });
      throw new HttpException(400, `The following sabo numbers do not exist: ${saboNumbersNotFound.join(', ')}`);
    }

    const deletedReimbursementRequests = reimbursementRequests.filter(
      (reimbursementRequest) => reimbursementRequest.dateDeleted
    );

    if (deletedReimbursementRequests.length > 0) {
      const saboNumbersDeleted = deletedReimbursementRequests.map((reimbursementRequest) => reimbursementRequest.saboId);
      throw new HttpException(
        400,
        `The following reimbursement requests with these sabo numbers have been deleted: ${saboNumbersDeleted.join(', ')}`
      );
    }

    const mailOptions = {
      from: 'mckee.p@northeastern.edu',
      to: 'mckee.p@northeastern.edu',
      subject: 'Reimbursement Requests To Be Approved By Advisor',
      text: `The following reimbursement requests need to be approved by you: ${saboNumbers.join(', ')}`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);

    reimbursementRequests.forEach((reimbursementRequest) => {
      prisma.reimbursement_Status.create({
        data: {
          type: Reimbursement_Status_Type.ADVISOR_APPROVED,
          userId: sender.userId,
          reimbursementRequestId: reimbursementRequest.reimbursementRequestId
        }
      });
    });
  }

  static async addSaboNumber(reimbursementRequestId: string, saboNumber: number, submitter: User & { teams: Team[] }) {
    if (!submitter.teams.some((team) => team.teamId === process.env.FINANCE_TEAM_ID)) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.saboId) {
      throw new HttpException(400, `This reimbursement request already has a sabo number!`);
    }

    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }

    const reimbursementRequestWithSaboNumber = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId },
      data: {
        saboId: saboNumber
      }
    });

    return reimbursementRequestWithSaboNumber;
  }

  /**
   * Function to create a vendor in our database
   * @param name the name of the vendor
   * @returns the id of the created vendor
   */
  static async createVendor(name: string) {
    const vendor = await prisma.vendor.create({
      data: {
        name
      }
    });

    return vendor.vendorId;
  }
}
