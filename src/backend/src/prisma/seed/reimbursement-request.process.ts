import { Material, Reimbursement_Request, Reimbursement_Status_Type } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { BOMOutput, BOMProcess } from './bom.process.js';
import { CarProcess } from './car.process.js';
import { CarOutput, FullUser } from '../context.js';
import { clampDate } from '../dates.js';
import {
  ASSIGNEE_CHANCE,
  buildProductSpecs,
  chooseFundingSource,
  chunkIntoGroups,
  CURRENT_YEAR_BOM_TIE_CHANCE,
  DELIVERY_CHANCE,
  deriveMaterialStatusAfterTie,
  EXTRA_COMMENT_CHANCE,
  generalSupplyCountForTiedMaterials,
  generateDateOfExpense,
  generateFallbackMaterialCost,
  generateProductCount,
  generateReimbursementStatusHistory,
  GENERAL_SUPPLY_PRODUCT_NAMES,
  hasReachedStage,
  otherReimbursementProductReasonCreateInput,
  PAST_YEAR_BOM_TIE_CHANCE,
  receiptCreateInput,
  ReimbursementProductSpec,
  reimbursementCreateInput,
  reimbursementProductCreateInput,
  reimbursementRequestCommentCreateInput,
  reimbursementRequestCreateInput,
  REIMBURSEMENT_CHANCE_PER_RECIPIENT,
  ReimbursementStatusStep,
  selectMaterialsToTie,
  systemCommentText,
  wbsReimbursementProductReasonCreateInput
} from '../factories/reimbursement-request.factory.js';

type ReimbursementRequestInput = OrganizationOutput &
  UsersOutput &
  ConfigDataOutput &
  TeamOutput &
  CarOutput &
  WorkPackageOutput &
  BOMOutput;

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

const REQUEST_CONCURRENCY = 8;

type PlannedRequest = {
  identifier: number;
  recipient: FullUser;
  dateCreated: Date;
  statusHistory: ReimbursementStatusStep[];
  dateOfExpense: Date | undefined;
  indexCode: ReturnType<typeof chooseFundingSource>['indexCode'];
  accountCode: ReturnType<typeof chooseFundingSource>['accountCode'];
  vendorId: string;
  description: string;
  group: ReimbursementProductSpec<Material>[];
  productCosts: number[];
  totalCost: number;
};

export class ReimbursementRequestProcess extends SeedProcess<ReimbursementRequestInput, ReimbursementRequestOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess, TeamProcess, CarProcess, WorkPackageProcess, BOMProcess];
  }

  async run({
    organization,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    cars,
    currentYearCar,
    indexCodes,
    accountCodes,
    vendors,
    reimbursementProductOtherReasons,
    financeTeam,
    projectsByCarIdWithTimeline,
    materialsByProjectId
  }: ReimbursementRequestInput): Promise<ReimbursementRequestOutput> {
    const { organizationId } = organization;
    const now = new Date();

    const recipients = [...members, ...leadership, ...heads, ...admins];
    const headApprovers = [...heads, ...admins, ...appAdmins];
    const headApproverIds = new Set(headApprovers.map((user) => user.userId));

    if (recipients.length === 0) throw new Error('ReimbursementRequestProcess requires at least one eligible recipient.');
    if (headApprovers.length === 0)
      throw new Error('ReimbursementRequestProcess requires at least one head-level approver.');

    const financeTeamFull = await this.prisma.team.findUniqueOrThrow({
      where: { teamId: financeTeam.teamId },
      include: { head: true, leads: true, members: true }
    });

    const financeTeamMemberIds = new Set(
      [
        financeTeamFull.headId,
        ...financeTeamFull.leads.map((u) => u.userId),
        ...financeTeamFull.members.map((u) => u.userId)
      ].filter((id): id is string => !!id)
    );

    const financePersonnelById = new Map<string, FullUser>();
    [...headApprovers, ...recipients.filter((user) => financeTeamMemberIds.has(user.userId))].forEach((user) =>
      financePersonnelById.set(user.userId, user)
    );
    const financePersonnel = [...financePersonnelById.values()];

    if (financePersonnel.length === 0)
      throw new Error('ReimbursementRequestProcess requires at least one finance team member.');

    const indexCodesByName = indexCodes.reduce<Record<string, (typeof indexCodes)[number]>>((acc, indexCode) => {
      acc[indexCode.name] = indexCode;
      return acc;
    }, {});

    const accountCodesByName = accountCodes.reduce<Record<string, (typeof accountCodes)[number]>>((acc, accountCode) => {
      acc[accountCode.name] = accountCode;
      return acc;
    }, {});

    // Phase 1: plan every request synchronously (no DB calls)
    // Splitting "decide what to create" from "create it" lets it fan the actual writes out
    // across Promise.all batches.
    let identifier = 0;
    const plannedRequests: PlannedRequest[] = [];

    for (const { car, dateRange } of cars) {
      if (dateRange.start >= now) continue;

      const carProjects = (projectsByCarIdWithTimeline[car.carId] ?? []).filter(
        (projectContext) => projectContext.timeline.start < now
      );
      if (carProjects.length === 0) continue;

      const carCreationWindow = {
        start: dateRange.start,
        end: clampDate(dateRange.end, { start: dateRange.start, end: now })
      };

      const bomTieChance = car.carId === currentYearCar.car.carId ? CURRENT_YEAR_BOM_TIE_CHANCE : PAST_YEAR_BOM_TIE_CHANCE;

      for (const project of carProjects) {
        const projectMaterials = materialsByProjectId[project.project.projectId] ?? [];
        const tiedMaterials = selectMaterialsToTie(this.faker, projectMaterials, bomTieChance);
        if (tiedMaterials.length === 0) continue;

        const generalSupplyCount = generalSupplyCountForTiedMaterials(tiedMaterials.length);
        const productSpecs = buildProductSpecs(tiedMaterials, generalSupplyCount);
        const productGroups = chunkIntoGroups(this.faker, productSpecs, generateProductCount);

        const projectCreationWindow = {
          start: project.timeline.start > carCreationWindow.start ? project.timeline.start : carCreationWindow.start,
          end: project.timeline.end < carCreationWindow.end ? project.timeline.end : carCreationWindow.end
        };

        for (const group of productGroups) {
          identifier += 1;

          const recipient = this.faker.helpers.arrayElement(recipients);

          const dateCreated =
            projectCreationWindow.start < projectCreationWindow.end
              ? this.faker.date.between({ from: projectCreationWindow.start, to: projectCreationWindow.end })
              : projectCreationWindow.start;

          const statusHistory = generateReimbursementStatusHistory(this.faker, dateCreated, now);

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

          const hasMaterialProduct = group.some((spec) => 'material' in spec);
          const description = hasMaterialProduct
            ? `Expenses for ${project.project.wbsElement.name}`
            : this.faker.helpers.arrayElement(GENERAL_SUPPLY_PRODUCT_NAMES);

          const productCosts = group.map((spec) =>
            'material' in spec
              ? (spec.material.price ?? generateFallbackMaterialCost(this.faker))
              : generateFallbackMaterialCost(this.faker)
          );
          const totalCost = productCosts.reduce((sum, cost) => sum + cost, 0);

          plannedRequests.push({
            identifier,
            recipient,
            dateCreated,
            statusHistory,
            dateOfExpense,
            indexCode,
            accountCode,
            vendorId: vendor.vendorId,
            description,
            group,
            productCosts,
            totalCost
          });
        }
      }
    }

    // Phase 2: execute the writes, N requests at a time
    const reimbursementRequests: Reimbursement_Request[] = [];
    const reimbursedTotalsByRecipientId = new Map<string, { total: number; latestDate: Date }>();

    for (let i = 0; i < plannedRequests.length; i += REQUEST_CONCURRENCY) {
      const batch = plannedRequests.slice(i, i + REQUEST_CONCURRENCY);

      const results = await Promise.all(
        batch.map((planned) =>
          this.createReimbursementRequest(
            planned,
            organizationId,
            headApprovers,
            admins,
            financePersonnel,
            reimbursementProductOtherReasons,
            now
          )
        )
      );

      for (const { createdRequest, reimbursed } of results) {
        reimbursementRequests.push(createdRequest);

        if (reimbursed) {
          const existing = reimbursedTotalsByRecipientId.get(reimbursed.recipientId);
          reimbursedTotalsByRecipientId.set(reimbursed.recipientId, {
            total: (existing?.total ?? 0) + reimbursed.totalCost,
            latestDate: existing && existing.latestDate > reimbursed.date ? existing.latestDate : reimbursed.date
          });
        }
      }
    }

    // Phase 3: aggregate Reimbursement rows, one per recipient
    const reimbursementCreates = [...reimbursedTotalsByRecipientId.entries()]
      .filter(() => this.faker.datatype.boolean({ probability: REIMBURSEMENT_CHANCE_PER_RECIPIENT }))
      .map(([recipientId, { total, latestDate }]) => {
        const amount = Math.round((total * this.faker.number.float({ min: 0.5, max: 1 })) / 100) * 100;
        return this.prisma.reimbursement.create({
          data: reimbursementCreateInput(organizationId, recipientId, amount, latestDate)
        });
      });

    await Promise.all(reimbursementCreates);

    return { reimbursementRequests };
  }

  /**
   * Creates a single reimbursement request and everything hanging off it (products, status
   * history, receipts, comments, delivery/assignee/etc). All the sub-writes below are
   * independent of each other's created rows - the chronological ordering that matters is
   * already baked into the `date` fields computed in Phase 1 - so they're fired concurrently
   * rather than awaited one at a time.
   */
  private async createReimbursementRequest(
    planned: PlannedRequest,
    organizationId: string,
    headApprovers: FullUser[],
    admins: FullUser[],
    financePersonnel: FullUser[],
    reimbursementProductOtherReasons: { otherReimbursementProductReasonId: string }[],
    now: Date
  ): Promise<{
    createdRequest: Reimbursement_Request;
    reimbursed?: { recipientId: string; totalCost: number; date: Date };
  }> {
    const {
      identifier,
      recipient,
      dateCreated,
      statusHistory,
      dateOfExpense,
      indexCode,
      accountCode,
      vendorId,
      description,
      group,
      productCosts,
      totalCost
    } = planned;

    const createdRequest = await this.prisma.reimbursement_Request.create({
      data: reimbursementRequestCreateInput(
        organizationId,
        identifier,
        recipient.userId,
        vendorId,
        indexCode.indexCodeId,
        accountCode.accountCodeId,
        totalCost,
        dateCreated,
        dateOfExpense,
        description
      )
    });

    // Products (and their reasons + tied-material status updates) are independent of each other.
    const productWrites = group.map((spec, productIndex) => {
      const otherReasonId =
        'material' in spec
          ? undefined
          : this.faker.helpers.arrayElement(reimbursementProductOtherReasons).otherReimbursementProductReasonId;

      return this.createReimbursementProduct(
        spec,
        productCosts[productIndex],
        createdRequest.reimbursementRequestId,
        indexCode.indexCodeId,
        otherReasonId,
        statusHistory
      );
    });

    // Status-history side effects (receipt / comment / status row) are independent per step,
    // and independent across steps too - only the dates need to be in order, which they are.
    const statusWrites = statusHistory
      .slice(1)
      .map((step) =>
        this.applyStatusStep(
          step,
          createdRequest.reimbursementRequestId,
          identifier,
          recipient,
          headApprovers,
          admins,
          financePersonnel
        )
      );

    await Promise.all([...productWrites, ...statusWrites]);

    // Post-processing conditionals: independent of each other, all depend only on createdRequest.
    const followUps: Promise<unknown>[] = [];

    if (hasReachedStage(statusHistory, Reimbursement_Status_Type.PENDING_SABO_SUBMISSION)) {
      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
          data: { saboId: `SABO-${identifier}` }
        })
      );
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

      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
          data: { dateDelivered }
        }),
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            createdRequest.reimbursementRequestId,
            recipient.userId,
            systemCommentText(recipient.firstName, recipient.lastName, 'Marked As Delivered'),
            dateDelivered
          )
        })
      );
    }

    if (
      hasReachedStage(statusHistory, Reimbursement_Status_Type.LEADERSHIP_APPROVED) &&
      this.faker.datatype.boolean({ probability: ASSIGNEE_CHANCE })
    ) {
      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: createdRequest.reimbursementRequestId },
          data: { assignee: { connect: { userId: this.faker.helpers.arrayElement(financePersonnel).userId } } }
        })
      );
    }

    if (this.faker.datatype.boolean({ probability: EXTRA_COMMENT_CHANCE })) {
      const commentAuthor = this.faker.helpers.arrayElement([recipient, ...financePersonnel]);
      followUps.push(
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            createdRequest.reimbursementRequestId,
            commentAuthor.userId,
            this.faker.helpers.arrayElement(EXTRA_COMMENT_TEMPLATES),
            statusHistory[statusHistory.length - 1].date
          )
        })
      );
    }

    await Promise.all(followUps);

    const reimbursed = hasReachedStage(statusHistory, Reimbursement_Status_Type.REIMBURSED)
      ? {
          recipientId: recipient.userId,
          totalCost,
          date: statusHistory.find((step) => step.type === Reimbursement_Status_Type.REIMBURSED)!.date
        }
      : undefined;

    return { createdRequest, reimbursed };
  }

  // Creates one reimbursement product:
  // its reason must be created first (product needs the id), then the product itself,
  // then (for tied materials) the material status update - the latter two can run in
  // parallel once the reason exists.
  private async createReimbursementProduct(
    spec: ReimbursementProductSpec<Material>,
    cost: number,
    reimbursementRequestId: string,
    indexCodeId: string,
    otherReasonId: string | undefined,
    statusHistory: ReimbursementStatusStep[]
  ): Promise<void> {
    const reasonCreateInput =
      'material' in spec
        ? wbsReimbursementProductReasonCreateInput(spec.material.wbsElementId)
        : otherReimbursementProductReasonCreateInput(otherReasonId!);

    const reason = await this.prisma.reimbursement_Product_Reason.create({ data: reasonCreateInput });

    const productName =
      'material' in spec ? spec.material.name : this.faker.helpers.arrayElement(GENERAL_SUPPLY_PRODUCT_NAMES);

    const productCreate = this.prisma.reimbursement_Product.create({
      data: reimbursementProductCreateInput(
        productName,
        cost,
        reimbursementRequestId,
        reason.reimbursementProductReasonId,
        indexCodeId,
        'material' in spec ? spec.material.materialId : undefined
      )
    });

    const materialUpdate =
      'material' in spec
        ? this.prisma.material.update({
            where: { materialId: spec.material.materialId },
            data: { status: deriveMaterialStatusAfterTie(statusHistory) }
          })
        : Promise.resolve();

    await Promise.all([productCreate, materialUpdate]);
  }

  // Applies one status-history step's side effects: optional receipt, optional system comment,
  // and the status row itself - all independent of each other.
  private async applyStatusStep(
    step: ReimbursementStatusStep,
    reimbursementRequestId: string,
    identifier: number,
    recipient: FullUser,
    headApprovers: FullUser[],
    admins: FullUser[],
    financePersonnel: FullUser[]
  ): Promise<void> {
    const actor = this.pickActorForStage(step.type, recipient, headApprovers, admins, financePersonnel);
    const writes: Promise<unknown>[] = [];

    if (step.type === Reimbursement_Status_Type.PENDING_FINANCE) {
      writes.push(
        this.prisma.receipt.create({
          data: receiptCreateInput(reimbursementRequestId, recipient.userId, identifier, step.date)
        })
      );
    }

    const action = SYSTEM_COMMENT_ACTION_BY_STAGE[step.type];
    if (action) {
      writes.push(
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            reimbursementRequestId,
            actor.userId,
            systemCommentText(actor.firstName, actor.lastName, action),
            step.date
          )
        })
      );
    }

    writes.push(
      this.prisma.reimbursement_Status.create({
        data: {
          type: step.type,
          userId: actor.userId,
          dateCreated: step.date,
          reimbursementRequestId
        }
      })
    );

    await Promise.all(writes);
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
