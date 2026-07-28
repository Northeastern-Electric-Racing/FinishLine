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

// How many reimbursement requests to build concurrently. Each request fans out into several
// parallel writes internally (products, status steps, etc.), so this caps *outer* concurrency
// to avoid exhausting the Prisma connection pool. Tune based on your pool size (Prisma's default
// pool is `num_cpus * 2 + 1`) - if you raise this, make sure your DB connection limit can absorb
// REQUEST_CONCURRENCY * (~3-6 concurrent connections per in-flight request).
const REQUEST_CONCURRENCY = 8;

// Fully pre-decided plan shapes (all faker draws already resolved)
// One product's pre-decided values. name and (for general supplies) otherReasonId are drawn in Phase 1.
type PlannedProduct = {
  spec: ReimbursementProductSpec<Material>;
  cost: number;
  name: string;
  // Present only for general-supply products. undefined for material-tied products.
  otherReasonId?: string;
};

type PlannedStatusStep = ReimbursementStatusStep & { actorId: string; actorFirstName: string; actorLastName: string };
type PlannedDelivery = { dateDelivered: Date };
type PlannedExtraComment = { authorId: string; text: string; date: Date };

// Precomputed, synchronous inputs for a single reimbursement request - no DB access, no faker in Phase 2.
type PlannedRequest = {
  identifier: number;
  recipient: FullUser;
  dateCreated: Date;
  statusHistory: ReimbursementStatusStep[];
  plannedSteps: PlannedStatusStep[];
  dateOfExpense: Date | undefined;
  indexCode: ReturnType<typeof chooseFundingSource>['indexCode'];
  accountCode: ReturnType<typeof chooseFundingSource>['accountCode'];
  vendorId: string;
  description: string;
  products: PlannedProduct[];
  totalCost: number;
  materialStatusAfterTie: Material['status'];
  // pre-decided follow-ups
  delivery?: PlannedDelivery;
  assigneeId?: string;
  extraComment?: PlannedExtraComment;
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

    // Phase 1: plan every request synchronously. Every faker draw happens here, in the exact
    // order V1 consumed them, so the seeded stream is identical to V1 and reproducible run-to-run.
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

          // draws in V1's order: recipient, dateCreated, statusHistory, dateOfExpense, funding, vendor, description, productCosts
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

          // per-product draws: for each product, (otherReason if general) then name
          const products: PlannedProduct[] = group.map((spec, productIndex) => {
            const otherReasonId =
              'material' in spec
                ? undefined
                : this.faker.helpers.arrayElement(reimbursementProductOtherReasons).otherReimbursementProductReasonId;

            const name =
              'material' in spec ? spec.material.name : this.faker.helpers.arrayElement(GENERAL_SUPPLY_PRODUCT_NAMES);

            return { spec, cost: productCosts[productIndex], name, otherReasonId };
          });

          // material status is a pure function of statusHistory (same for every tied material in the group)
          const materialStatusAfterTie = deriveMaterialStatusAfterTie(statusHistory);

          // per-status-step actor draws, after the product draws (matches V1's loop order)
          const plannedSteps: PlannedStatusStep[] = statusHistory.slice(1).map((step) => {
            const actor = this.pickActorForStage(step.type, recipient, headApprovers, admins, financePersonnel);
            return { ...step, actorId: actor.userId, actorFirstName: actor.firstName, actorLastName: actor.lastName };
          });

          // follow-up draws, in V1's order: delivery, then assignee, then extra comment
          let delivery: PlannedDelivery | undefined;
          if (dateOfExpense && !hasReachedStage(statusHistory, Reimbursement_Status_Type.DENIED)) {
            // The DELIVERY_CHANCE boolean must be drawn here (inside the same guard V1 used)
            // so the stream matches even when the guard is false and no delivery happens.
            if (this.faker.datatype.boolean({ probability: DELIVERY_CHANCE })) {
              const dateDelivered = clampDate(
                this.faker.date.soon({ days: this.faker.number.int({ min: 1, max: 14 }), refDate: dateOfExpense }),
                { start: dateOfExpense, end: now }
              );
              delivery = { dateDelivered };
            }
          }

          let assigneeId: string | undefined;
          if (hasReachedStage(statusHistory, Reimbursement_Status_Type.LEADERSHIP_APPROVED)) {
            if (this.faker.datatype.boolean({ probability: ASSIGNEE_CHANCE })) {
              assigneeId = this.faker.helpers.arrayElement(financePersonnel).userId;
            }
          }

          let extraComment: PlannedExtraComment | undefined;
          if (this.faker.datatype.boolean({ probability: EXTRA_COMMENT_CHANCE })) {
            const commentAuthor = this.faker.helpers.arrayElement([recipient, ...financePersonnel]);
            const text = this.faker.helpers.arrayElement(EXTRA_COMMENT_TEMPLATES);
            extraComment = {
              authorId: commentAuthor.userId,
              text,
              date: statusHistory[statusHistory.length - 1].date
            };
          }

          plannedRequests.push({
            identifier,
            recipient,
            dateCreated,
            statusHistory,
            plannedSteps,
            dateOfExpense,
            indexCode,
            accountCode,
            vendorId: vendor.vendorId,
            description,
            products,
            totalCost,
            materialStatusAfterTie,
            delivery,
            assigneeId,
            extraComment
          });
        }
      }
    }

    // Phase 2: pure writes, REQUEST_CONCURRENCY requests at a time. No faker access anywhere
    // below this line - the writer methods are not passed `this.faker`, so concurrent resolution
    // order provably cannot affect output.
    const reimbursementRequests: Reimbursement_Request[] = [];
    const reimbursedTotalsByRecipientId = new Map<string, { total: number; latestDate: Date }>();

    for (let i = 0; i < plannedRequests.length; i += REQUEST_CONCURRENCY) {
      const batch = plannedRequests.slice(i, i + REQUEST_CONCURRENCY);

      const results = await Promise.all(batch.map((planned) => this.writeReimbursementRequest(planned, organizationId)));

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

    // Phase 3: aggregate Reimbursement rows, one per recipient. Draws are interleaved per
    // recipient (boolean then float). Map iteration order is first-insertion
    // order, which equals plan/request order, so the draw sequence is deterministic.
    const reimbursementCreates: Promise<unknown>[] = [];
    for (const [recipientId, { total, latestDate }] of reimbursedTotalsByRecipientId) {
      // boolean and float are drawn together per recipient (V1 order), regardless of whether the
      // boolean passes, so a skipped recipient still consumes only the boolean.
      if (!this.faker.datatype.boolean({ probability: REIMBURSEMENT_CHANCE_PER_RECIPIENT })) continue;

      const amount = Math.round((total * this.faker.number.float({ min: 0.5, max: 1 })) / 100) * 100;
      reimbursementCreates.push(
        this.prisma.reimbursement.create({ data: reimbursementCreateInput(organizationId, recipientId, amount, latestDate) })
      );
    }

    await Promise.all(reimbursementCreates);

    return { reimbursementRequests };
  }

  // Phase 2 writers. NONE of these receive or reference faker. Every value they persist
  // was decided in Phase 1. They may fan writes out with Promise.all freely, because there are
  // no random draws whose order could matter. Only true data dependencies are sequenced.

  private async writeReimbursementRequest(
    planned: PlannedRequest,
    organizationId: string
  ): Promise<{
    createdRequest: Reimbursement_Request;
    reimbursed?: { recipientId: string; totalCost: number; date: Date };
  }> {
    const {
      identifier,
      recipient,
      dateCreated,
      statusHistory,
      plannedSteps,
      dateOfExpense,
      indexCode,
      accountCode,
      vendorId,
      description,
      products,
      totalCost,
      materialStatusAfterTie,
      delivery,
      assigneeId,
      extraComment
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

    const requestId = createdRequest.reimbursementRequestId;

    const productWrites = products.map((product) =>
      this.writeProduct(product, requestId, indexCode.indexCodeId, materialStatusAfterTie)
    );

    const statusWrites = plannedSteps.map((step) => this.writeStatusStep(step, requestId, identifier, recipient.userId));

    await Promise.all([...productWrites, ...statusWrites]);

    const followUps: Promise<unknown>[] = [];

    if (hasReachedStage(statusHistory, Reimbursement_Status_Type.PENDING_SABO_SUBMISSION)) {
      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: requestId },
          data: { saboId: `SABO-${identifier}` }
        })
      );
    }

    if (delivery) {
      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: requestId },
          data: { dateDelivered: delivery.dateDelivered }
        }),
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            requestId,
            recipient.userId,
            systemCommentText(recipient.firstName, recipient.lastName, 'Marked As Delivered'),
            delivery.dateDelivered
          )
        })
      );
    }

    if (assigneeId) {
      followUps.push(
        this.prisma.reimbursement_Request.update({
          where: { reimbursementRequestId: requestId },
          data: { assignee: { connect: { userId: assigneeId } } }
        })
      );
    }

    if (extraComment) {
      followUps.push(
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            requestId,
            extraComment.authorId,
            extraComment.text,
            extraComment.date
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

  // Reason must exist before the product (product needs its id); the product create and the tied-material update then run in parallel. No faker.
  private async writeProduct(
    product: PlannedProduct,
    reimbursementRequestId: string,
    indexCodeId: string,
    materialStatusAfterTie: Material['status']
  ): Promise<void> {
    const { spec, cost, name, otherReasonId } = product;

    const reasonCreateInput =
      'material' in spec
        ? wbsReimbursementProductReasonCreateInput(spec.material.wbsElementId)
        : otherReimbursementProductReasonCreateInput(otherReasonId!);

    const reason = await this.prisma.reimbursement_Product_Reason.create({ data: reasonCreateInput });

    const productCreate = this.prisma.reimbursement_Product.create({
      data: reimbursementProductCreateInput(
        name,
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
            data: { status: materialStatusAfterTie }
          })
        : Promise.resolve();

    await Promise.all([productCreate, materialUpdate]);
  }

  // Applies one pre-planned status step: optional receipt, optional system comment, and the status row. Actor was chosen in Phase 1. No faker.
  private async writeStatusStep(
    step: PlannedStatusStep,
    reimbursementRequestId: string,
    identifier: number,
    recipientId: string
  ): Promise<void> {
    const writes: Promise<unknown>[] = [];

    if (step.type === Reimbursement_Status_Type.PENDING_FINANCE) {
      writes.push(
        this.prisma.receipt.create({
          data: receiptCreateInput(reimbursementRequestId, recipientId, identifier, step.date)
        })
      );
    }

    const action = SYSTEM_COMMENT_ACTION_BY_STAGE[step.type];
    if (action) {
      writes.push(
        this.prisma.reimbursement_Request_Comment.create({
          data: reimbursementRequestCommentCreateInput(
            reimbursementRequestId,
            step.actorId,
            systemCommentText(step.actorFirstName, step.actorLastName, action),
            step.date
          )
        })
      );
    }

    writes.push(
      this.prisma.reimbursement_Status.create({
        data: {
          type: step.type,
          userId: step.actorId,
          dateCreated: step.date,
          reimbursementRequestId
        }
      })
    );

    await Promise.all(writes);
  }

  // pickActorForStage is only ever called during Phase 1 planning now.
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
