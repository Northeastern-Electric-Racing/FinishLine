import { Reimbursement_Request, Reimbursement_Status_Type } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { CarProcess } from './car.process.js';
import { CarOutput, FullUser } from '../context.js';
import { clampDate } from '../dates.js';
import {
  ASSIGNEE_CHANCE,
  chooseFundingSource,
  DELIVERY_CHANCE,
  EXTRA_COMMENT_CHANCE,
  generateDateOfExpense,
  generateProductCount,
  generateReimbursementRequestTotalCost,
  generateReimbursementStatusHistory,
  GENERAL_SUPPLY_PRODUCT_NAMES,
  hasReachedStage,
  otherReimbursementProductReasonCreateInput,
  receiptCreateInput,
  reimbursementCreateInput,
  reimbursementProductCreateInput,
  reimbursementRequestCommentCreateInput,
  reimbursementRequestCreateInput,
  REIMBURSEMENT_CHANCE_PER_RECIPIENT,
  REIMBURSEMENT_REQUESTS_PER_CAR,
  splitCost,
  systemCommentText,
  wbsReimbursementProductReasonCreateInput,
  WBS_PRODUCT_NAMES,
  WBS_REASON_CHANCE
} from '../factories/reimbursement-request.factory.js';

type ReimbursementRequestInput = OrganizationOutput &
  UsersOutput &
  ConfigDataOutput &
  TeamOutput &
  CarOutput &
  ProjectOutput &
  WorkPackageOutput;

export type ReimbursementRequestOutput = {
  reimbursementRequests: Reimbursement_Request[];
};

const SYSTEM_COMMENT_ACTION_BY_STAGE: Partial<Record<Reimbursement_Status_Type, string>> = {
  [Reimbursement_Status_Type.LEADERSHIP_APPROVED]: 'Leadership Approved',
  [Reimbursement_Status_Type.PENDING_FINANCE]: 'Marked Pending Finance',
  [Reimbursement_Status_Type.PENDING_SABO_SUBMISSION]: 'Inputted in SABO',
  [Reimbursement_Status_Type.SABO_SUBMITTED]: 'submitted to SABO',
  [Reimbursement_Status_Type.REIMBURSED]: 'Marked As Reimbursed',
  [Reimbursement_Status_Type.DENIED]: 'Denied This Request'
};

const EXTRA_COMMENT_TEMPLATES = [
  'Please upload receipt when available',
  'Receipt uploaded to Google Drive',
  'Following up with vendor on delivery date',
  'Approved and ready for SABO submission',
  'Items delivered and verified',
  'Let me know if you need anything else for this'
];

export class ReimbursementRequestProcess extends SeedProcess<ReimbursementRequestInput, ReimbursementRequestOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess, TeamProcess, CarProcess, ProjectProcess, WorkPackageProcess];
  }

  async run({
    organization,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    cars,
    indexCodes,
    accountCodes,
    vendors,
    reimbursementProductOtherReasons,
    financeTeam,
    projectsByCarId,
    workPackagesByProjectId
  }: ReimbursementRequestInput): Promise<ReimbursementRequestOutput> {
    const { organizationId } = organization;
    const now = new Date();

    // appAdmins is just the bootstrap user, which has no User_Secure_Settings row - createReimbursementRequest
    // hard-requires that for the recipient, so it's excluded here (it can still approve/action requests, which
    // has no such requirement)
    const recipients = [...members, ...leadership, ...heads, ...admins];
    const headApprovers = [...heads, ...admins, ...appAdmins];
    const headApproverIds = new Set(headApprovers.map((user) => user.userId));

    if (recipients.length === 0) throw new Error('ReimbursementRequestProcess requires at least one eligible recipient.');
    if (headApprovers.length === 0) throw new Error('ReimbursementRequestProcess requires at least one head-level approver.');

    const financeTeamFull = await this.prisma.team.findUniqueOrThrow({
      where: { teamId: financeTeam.teamId },
      include: { head: true, leads: true, members: true }
    });

    const financeTeamMemberIds = new Set(
      [financeTeamFull.headId, ...financeTeamFull.leads.map((u) => u.userId), ...financeTeamFull.members.map((u) => u.userId)].filter(
        (id): id is string => !!id
      )
    );

    const financePersonnelById = new Map<string, FullUser>();
    [...headApprovers, ...recipients.filter((user) => financeTeamMemberIds.has(user.userId))].forEach((user) =>
      financePersonnelById.set(user.userId, user)
    );
    const financePersonnel = [...financePersonnelById.values()];

    if (financePersonnel.length === 0) throw new Error('ReimbursementRequestProcess requires at least one finance team member.');

    const indexCodesByName = indexCodes.reduce<Record<string, (typeof indexCodes)[number]>>((acc, indexCode) => {
      acc[indexCode.name] = indexCode;
      return acc;
    }, {});

    const accountCodesByName = accountCodes.reduce<Record<string, (typeof accountCodes)[number]>>((acc, accountCode) => {
      acc[accountCode.name] = accountCode;
      return acc;
    }, {});

    let identifier = 0;
    const reimbursementRequests: Reimbursement_Request[] = [];
    const reimbursedTotalsByRecipientId = new Map<string, { total: number; latestDate: Date }>();

    for (const { car, dateRange } of cars) {
      // skip cars that haven't started yet (e.g. a next-year car still in early planning)
      if (dateRange.start >= now) continue;

      const carProjects = (projectsByCarId[car.carId] ?? []).filter((projectContext) => projectContext.timeline.start < now);
      if (carProjects.length === 0) continue;

      const carCreationWindow = { start: dateRange.start, end: clampDate(dateRange.end, { start: dateRange.start, end: now }) };

      for (let i = 0; i < REIMBURSEMENT_REQUESTS_PER_CAR; i++) {
        identifier += 1;

        const recipient = this.faker.helpers.arrayElement(recipients);
        const project = this.faker.helpers.arrayElement(carProjects);

        const projectCreationWindow = {
          start: project.timeline.start > carCreationWindow.start ? project.timeline.start : carCreationWindow.start,
          end: project.timeline.end < carCreationWindow.end ? project.timeline.end : carCreationWindow.end
        };

        const dateCreated =
          projectCreationWindow.start < projectCreationWindow.end
            ? this.faker.date.between({ from: projectCreationWindow.start, to: projectCreationWindow.end })
            : projectCreationWindow.start;

        const statusHistory = generateReimbursementStatusHistory(this.faker, dateCreated, now);

        // only a Head+ recipient may set their date of expense immediately at creation; everyone
        // else has to wait until their request is leadership-approved and add it themselves after
        const approvalStep = statusHistory.find((step) => step.type === Reimbursement_Status_Type.LEADERSHIP_APPROVED);
        const pendingFinanceStep = statusHistory.find((step) => step.type === Reimbursement_Status_Type.PENDING_FINANCE);

        const dateOfExpense = generateDateOfExpense(
          this.faker,
          headApproverIds.has(recipient.userId),
          dateCreated,
          approvalStep?.date,
          pendingFinanceStep?.date ?? now
        );

        const { indexCode, accountCode } = chooseFundingSource(this.faker, indexCodesByName, accountCodesByName);
        const vendor = this.faker.helpers.arrayElement(vendors);

        const useWbsReason = this.faker.datatype.boolean({ probability: WBS_REASON_CHANCE });
        const productCount = generateProductCount(this.faker);
        const totalCost = generateReimbursementRequestTotalCost(this.faker);
        const productCosts = splitCost(this.faker, totalCost, productCount);

        const description = useWbsReason
          ? `Expenses for ${project.project.wbsElement.name}`
          : this.faker.helpers.arrayElement(GENERAL_SUPPLY_PRODUCT_NAMES);

        const createdRequest = await this.prisma.reimbursement_Request.create({
          data: reimbursementRequestCreateInput(
            organizationId,
            identifier,
            recipient.userId,
            vendor.vendorId,
            indexCode.indexCodeId,
            accountCode.accountCodeId,
            totalCost,
            dateCreated,
            dateOfExpense,
            description
          )
        });

        const workPackagesForProject = workPackagesByProjectId[project.project.projectId] ?? [];

        for (let productIndex = 0; productIndex < productCount; productIndex++) {
          const useWorkPackage =
            useWbsReason && workPackagesForProject.length > 0 && this.faker.datatype.boolean({ probability: 0.4 });

          const reasonCreateInput = useWbsReason
            ? wbsReimbursementProductReasonCreateInput(
                useWorkPackage
                  ? this.faker.helpers.arrayElement(workPackagesForProject).workPackage.wbsElement.wbsElementId
                  : project.project.wbsElement.wbsElementId
              )
            : otherReimbursementProductReasonCreateInput(
                this.faker.helpers.arrayElement(reimbursementProductOtherReasons).otherReimbursementProductReasonId
              );

          const reason = await this.prisma.reimbursement_Product_Reason.create({ data: reasonCreateInput });

          const productName = useWbsReason
            ? this.faker.helpers.arrayElement(WBS_PRODUCT_NAMES)
            : this.faker.helpers.arrayElement(GENERAL_SUPPLY_PRODUCT_NAMES);

          await this.prisma.reimbursement_Product.create({
            data: reimbursementProductCreateInput(
              productName,
              productCosts[productIndex],
              createdRequest.reimbursementRequestId,
              reason.reimbursementProductReasonId,
              indexCode.indexCodeId
            )
          });
        }

        for (const step of statusHistory.slice(1)) {
          const actor = this.pickActorForStage(step.type, recipient, headApprovers, admins, financePersonnel);

          if (step.type === Reimbursement_Status_Type.PENDING_FINANCE) {
            await this.prisma.receipt.create({
              data: receiptCreateInput(createdRequest.reimbursementRequestId, recipient.userId, identifier, step.date)
            });
          }

          const action = SYSTEM_COMMENT_ACTION_BY_STAGE[step.type];
          if (action) {
            await this.prisma.reimbursement_Request_Comment.create({
              data: reimbursementRequestCommentCreateInput(
                createdRequest.reimbursementRequestId,
                actor.userId,
                systemCommentText(actor.firstName, actor.lastName, action),
                step.date
              )
            });
          }

          await this.prisma.reimbursement_Status.create({
            data: {
              type: step.type,
              userId: actor.userId,
              dateCreated: step.date,
              reimbursementRequestId: createdRequest.reimbursementRequestId
            }
          });
        }

        if (hasReachedStage(statusHistory, Reimbursement_Status_Type.PENDING_SABO_SUBMISSION)) {
          await this.prisma.reimbursement_Request.update({
            where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
            data: { saboId: `SABO-${identifier}` }
          });
        }

        if (
          dateOfExpense &&
          !hasReachedStage(statusHistory, Reimbursement_Status_Type.DENIED) &&
          this.faker.datatype.boolean({ probability: DELIVERY_CHANCE })
        ) {
          const dateDelivered = clampDate(
            this.faker.date.soon({ days: this.faker.number.int({ min: 1, max: 14 }), refDate: dateOfExpense }),
            { start: dateOfExpense, end: now }
          );

          await this.prisma.reimbursement_Request.update({
            where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
            data: { dateDelivered }
          });

          await this.prisma.reimbursement_Request_Comment.create({
            data: reimbursementRequestCommentCreateInput(
              createdRequest.reimbursementRequestId,
              recipient.userId,
              systemCommentText(recipient.firstName, recipient.lastName, 'Marked As Delivered'),
              dateDelivered
            )
          });
        }

        if (
          hasReachedStage(statusHistory, Reimbursement_Status_Type.LEADERSHIP_APPROVED) &&
          this.faker.datatype.boolean({ probability: ASSIGNEE_CHANCE })
        ) {
          await this.prisma.reimbursement_Request.update({
            where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
            data: { assignee: { connect: { userId: this.faker.helpers.arrayElement(financePersonnel).userId } } }
          });
        }

        if (this.faker.datatype.boolean({ probability: EXTRA_COMMENT_CHANCE })) {
          const commentAuthor = this.faker.helpers.arrayElement([recipient, ...financePersonnel]);

          await this.prisma.reimbursement_Request_Comment.create({
            data: reimbursementRequestCommentCreateInput(
              createdRequest.reimbursementRequestId,
              commentAuthor.userId,
              this.faker.helpers.arrayElement(EXTRA_COMMENT_TEMPLATES),
              statusHistory[statusHistory.length - 1].date
            )
          });
        }

        if (hasReachedStage(statusHistory, Reimbursement_Status_Type.REIMBURSED)) {
          const reimbursedDate = statusHistory.find((step) => step.type === Reimbursement_Status_Type.REIMBURSED)!.date;
          const existing = reimbursedTotalsByRecipientId.get(recipient.userId);

          reimbursedTotalsByRecipientId.set(recipient.userId, {
            total: (existing?.total ?? 0) + totalCost,
            latestDate: existing && existing.latestDate > reimbursedDate ? existing.latestDate : reimbursedDate
          });
        }

        reimbursementRequests.push(createdRequest);
      }
    }

    for (const [recipientId, { total, latestDate }] of reimbursedTotalsByRecipientId) {
      if (!this.faker.datatype.boolean({ probability: REIMBURSEMENT_CHANCE_PER_RECIPIENT })) continue;

      const amount = Math.round((total * this.faker.number.float({ min: 0.5, max: 1 })) / 100) * 100;

      await this.prisma.reimbursement.create({
        data: reimbursementCreateInput(organizationId, recipientId, amount, latestDate)
      });
    }

    return { reimbursementRequests };
  }

  private pickActorForStage(
    stage: Reimbursement_Status_Type,
    recipient: FullUser,
    headApprovers: FullUser[],
    admins: FullUser[],
    financePersonnel: FullUser[]
  ): FullUser {
    switch (stage) {
      case Reimbursement_Status_Type.LEADERSHIP_APPROVED:
        return this.faker.helpers.arrayElement(headApprovers);
      // in practice this is almost always the recipient marking their own request pending finance
      // once they've added purchase details; only rarely does an admin do it on their behalf
      case Reimbursement_Status_Type.PENDING_FINANCE:
        return this.faker.datatype.boolean({ probability: 0.85 }) || admins.length === 0
          ? recipient
          : this.faker.helpers.arrayElement(admins);
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        return recipient;
      case Reimbursement_Status_Type.DENIED:
        return this.faker.helpers.arrayElement([recipient, ...financePersonnel]);
      default:
        return this.faker.helpers.arrayElement(financePersonnel);
    }
  }
}
