import { Organization, User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import {
  FrequentlyAskedQuestion,
  isAdmin,
  isLeadership,
  PartReviewCommonMistake,
  PartTag,
  Project,
  WbsNumber,
  isAtLeastRank,
  RoleEnum,
  Review_Status,
  validateWBS
} from 'shared';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException,
  InvalidOrganizationException,
  AccessDeniedGuestException
} from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import {
  getPartQueryArgs,
  getPartReviewQueryArgs,
  getPartReviewRequestQueryArgs,
  getPartSubmissionQueryArgs
} from '../prisma-query-args/part-review.query-args';
import { faqTransformer } from '../transformers/faq.transformer';
import {
  partReviewRequestTransformer,
  partsReviewCommonMistakeTransformer,
  partTransformer,
  partPreviewTransformer,
  partSubmissionTransformer,
  partReviewTransformer,
  partTagTransformer,
  partReviewPopupTransformer
} from '../transformers/part-review.transformer';
import { isUserPartOfTeams } from '../utils/teams.utils';
import { uploadFile, downloadFile } from '../utils/google-integration.utils';
import ProjectsService from './projects.services';
import { sendPartAssignmentPopUp, sendPartReviewRequestPopUp } from '../utils/pop-up.utils';
import { sendSlackPartAssignmentNotif, sendSlackPartReviewRequestNotif } from '../utils/slack.utils';
import { getUserWithSettingsQueryArgs } from '../prisma-query-args/user.query-args';

export default class PartReviewService {
  /**
   * Given a part id, retrieves that part and throws appropriate errors
   * @param partId the id of the part
   * @returns the part with query args
   */
  static async getPartWithQueryArgs(partId: string, userId: string, organizationId: string) {
    const part = await prisma.part.findUnique({
      where: { partId },
      ...getPartQueryArgs(organizationId, userId)
    });
    if (!part || part.project.wbsElement.organizationId !== organizationId) throw new NotFoundException('Part', partId);

    if (part.dateDeleted) throw new DeletedException('Part', partId);

    return part;
  }

  /**
   * Uses the given partId to get the specific part and all of its constituent data
   * @param organization the organization to get the part for
   * @param user the user requesting the part
   * @param wbsNumber the wbsNum of the project this part is under
   * @param indexNum the index number of the part on this project
   * @returns a single Part
   */
  static async getPart(organization: Organization, user: User, wbsNumber: WbsNumber, indexNum: string) {
    const project: Project = await ProjectsService.getSingleProject(wbsNumber, organization);
    const index = parseInt(indexNum);
    const part = await prisma.part.findUnique({
      where: { ProjectId_and_index: { projectId: project.id, index } },
      ...getPartQueryArgs(organization.organizationId, user.userId)
    });

    if (!part) throw new NotFoundException('Part', `projectId: ${project.id} and index number: ${indexNum}`);

    if (part.dateDeleted) throw new DeletedException('Part', part.partId);

    part.submissions.forEach((submission) => {
      submission.reviews = submission.reviews.filter((review) => {
        return review.completedAt || user.userId === review.userCreatedId;
      });
    });

    return partTransformer(part);
  }
  /**
   * Gets all parts for the given project
   * @param wbsNumber the wbs number of the project
   * @param organization the organization to get the parts for
   * @returns all the parts from the given project
   */
  static async getAllPartsForProject(wbsNumber: WbsNumber, organization: Organization, user: User) {
    const project: Project = await ProjectsService.getSingleProject(wbsNumber, organization);

    const parts = await prisma.part.findMany({
      where: { projectId: project.id, dateDeleted: null },
      ...getPartQueryArgs(organization.organizationId, user.userId)
    });

    return parts.map(partPreviewTransformer);
  }

  /**
   * Creates a part on the given project id,
   * with no submissions and no review requests
   * @param organization the organization
   * @param wbsNum project that the part will be added too
   * @param creator the user creating the part
   * @param index the index of the part
   * @param commonName the name of the part
   * @param description the description of the part
   * @param previewImageId the id of the preview image
   * @param reviewStatus the review status of the part
   * @param tagIds the ids of the tags on this part
   * @param assigneeIds the ids of the users assigned to the part
   * @param reviewerIds the ids of the users reviewing the part
   * @returns the created part
   */
  static async createPart(
    organization: Organization,
    wbsNum: string,
    creator: User,
    index: number,
    commonName: string,
    description: string,
    reviewStatus: Review_Status,
    tagIds: string[],
    assigneeIds: string[],
    reviewerIds: string[]
  ) {
    const wbsNumber: WbsNumber = validateWBS(wbsNum);

    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization);

    const perms =
      (await userHasPermission(creator.userId, organization.organizationId, isLeadership)) ||
      isUserPartOfTeams(project.teams, creator);

    if (!perms) throw new AccessDeniedException('Only leadership and team members can create a part');

    const createdPart = await prisma.$transaction(async (tx) => {
      const part = await tx.part.create({
        data: {
          index,
          commonName,
          description,
          status: reviewStatus,
          tags: { connect: tagIds.map((partTagId) => ({ partTagId })) },
          project: { connect: { projectId: project.projectId } },
          assignees: { connect: assigneeIds.map((userId) => ({ userId })) },
          userCreated: { connect: { userId: creator.userId } }
        },
        ...getPartQueryArgs(organization.organizationId, creator.userId)
      });

      await Promise.all(
        reviewerIds.map(async (id) => {
          return tx.part_Review_Request.create({
            data: {
              part: { connect: { partId: part.partId } },
              requester: { connect: { userId: creator.userId } },
              reviewerRequested: { connect: { userId: id } }
            }
          });
        })
      );

      return part;
    });

    return partTransformer(createdPart);
  }

  /**
   * Uploads an image to g drive and sets the parts preview image id to that image
   * @param previewImage the image to upload
   * @param partId the id of the part for which the preview image is being updated
   * @param submitter the user making the update
   * @param organization the organization
   */
  static async uploadPartPreviewImage(
    previewImage: Express.Multer.File,
    partId: string,
    submitter: User,
    organizationId: string
  ) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, submitter.userId, organizationId);

    const hasPermission =
      (await userHasPermission(submitter.userId, organizationId, isLeadership)) ||
      submitter.userId === part.userCreated.userId;
    if (!hasPermission || part.project.wbsElement.organizationId !== organizationId)
      throw new AccessDeniedException('Only leadership and part creators can add a preview image');

    const { id } = await uploadFile(previewImage);

    const updatedPart = await prisma.part.update({
      where: { partId },
      data: { previewImageId: id },
      ...getPartQueryArgs(organizationId, submitter.userId)
    });

    return partTransformer(updatedPart);
  }

  static async uploadFile(file: Express.Multer.File, uploader: User, organization: Organization) {
    if (!userHasPermission(uploader.userId, organization.organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role))) {
      throw new AccessDeniedException('Only members of the current organization can upload files');
    }

    const data = await uploadFile(file);
    return data.id;
  }

  /**
   * Updates a part
   * @param organizationId the organization
   * @param partId the part being updated
   * @param updater the user updating the part
   * @param index the index of the part
   * @param commonName the new common name of the part
   * @param description the new description
   * @param reviewStatus the new review status
   * @param tagIds the new tag ids for the part
   * @param assigneeIds the new assignees for the part
   * @param reviewerIds the new reviewers for the part
   * @returns the updated part
   */
  static async updatePart(
    organizationId: string,
    partId: string,
    updater: User,
    index: number,
    commonName: string,
    description: string,
    reviewStatus: Review_Status,
    tagIds: string[],
    assigneeIds: string[],
    reviewerIds: string[]
  ) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, updater.userId, organizationId);

    const hasPermission =
      (await userHasPermission(updater.userId, organizationId, isLeadership)) || updater.userId === part.userCreated.userId;

    if (!hasPermission) throw new AccessDeniedException('Only leadership and the part creator can update part data');

    const editedPart = await prisma.$transaction(async (tx) => {
      const editedPart = await tx.part.update({
        where: { partId },
        data: {
          index,
          commonName,
          description,
          status: reviewStatus,
          tags: { set: tagIds.map((partTagId) => ({ partTagId })) },
          assignees: { set: assigneeIds.map((userId) => ({ userId })) }
        },
        ...getPartQueryArgs(organizationId, updater.userId)
      });

      const reviewersToAdd = reviewerIds.filter(
        (id) => !editedPart.reviewRequests.some((reviewReq) => reviewReq.reviewerRequested.userId === id)
      );

      await Promise.all(
        reviewersToAdd.map(async (id) => {
          return tx.part_Review_Request.create({
            data: {
              part: { connect: { partId: editedPart.partId } },
              requester: { connect: { userId: updater.userId } },
              reviewerRequested: { connect: { userId: id } }
            }
          });
        })
      );

      const reviewRequestsToRemove = editedPart.reviewRequests.filter(
        (reviewReq) => !reviewerIds.includes(reviewReq.reviewerRequested.userId)
      );

      await Promise.all(
        reviewRequestsToRemove.map(async (reviewReq) => {
          return tx.part_Review_Request.update({
            where: { partReviewRequestId: reviewReq.partReviewRequestId },
            data: { dateDeleted: new Date() }
          });
        })
      );

      return editedPart;
    });

    return partTransformer(editedPart);
  }

  /**
   * Deletes a specific part
   * @param partId the id of the part
   * @param deleter the user deleting
   * @param organizationId the org id
   * @returns the deleted part
   */
  static async deletePart(partId: string, deleter: User, organizationId: string) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, deleter.userId, organizationId);

    const hasPermission =
      (await userHasPermission(deleter.userId, organizationId, isLeadership)) || deleter.userId === part.userCreated.userId;

    if (!hasPermission) throw new AccessDeniedException('Only leadership and the part creator can delete a part');

    const deletedPart = await prisma.part.update({
      where: { partId },
      data: { dateDeleted: new Date(), userDeleted: { connect: { userId: deleter.userId } } },
      ...getPartQueryArgs(organizationId, deleter.userId)
    });

    return partTransformer(deletedPart);
  }

  /**
   * Creates a review on a submission for a part
   * @param organizationId the organization
   * @param creator the creator of the review
   * @param submissionId the submission
   * @param notes optional notes on the review
   * @param fileIds the ids of the files being added to this review
   * @param newPartStatus the new status of the part which the review is added to.
   * if this status is Reviewed or approved, the completedAt date is set to now
   * @returns the created review
   */
  static async createReview(
    organizationId: string,
    creator: User,
    submissionId: string,
    newPartStatus: string,
    fileIds: string[],
    notes: string
  ) {
    const submission = await prisma.part_Submission.findUnique({
      where: { partSubmissionId: submissionId },
      include: { part: { include: { project: { include: { wbsElement: true } } } } }
    });

    if (!submission) throw new NotFoundException('Part Submission', submissionId);
    if (submission.dateDeleted) throw new DeletedException('Part Submission', submissionId);
    if (submission.part.project.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Part Submission');

    const review_status = newPartStatus as Review_Status;
    const completedAt =
      review_status === Review_Status.APPROVED || review_status === Review_Status.REVIEWED ? new Date() : null;

    await prisma.part.update({ where: { partId: submission.partId }, data: { status: review_status } });

    const review = await prisma.part_Review.create({
      data: {
        submission: { connect: { partSubmissionId: submissionId } },
        userCreated: { connect: { userId: creator.userId } },
        fileIds,
        notes,
        completedAt
      },
      ...getPartReviewQueryArgs(organizationId)
    });

    return partReviewTransformer(review);
  }

  /**
   * Updates an existing review
   * @param organizationId the organization
   * @param updater the user updating (must be creator)
   * @param reviewId the review being updated
   * @param newPartStatus the new status of the part which the review is added to.
   * if this status is Reviewed or approved, the completedAt date is set to now
   * @param notes notes for the review
   * @returns the updated review
   */
  static async updateReview(
    organizationId: string,
    updater: User,
    reviewId: string,
    newPartStatus: string,
    notes: string,
    fileIds: string[]
  ) {
    const review = await prisma.part_Review.findUnique({
      where: { partReviewId: reviewId },
      include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
    });

    if (!review) throw new NotFoundException('Part Review', reviewId);
    if (review.dateDeleted) throw new DeletedException('Part Review', reviewId);
    if (review.submission.part.project.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Part Review');

    if (updater.userId !== review.userCreatedId) throw new AccessDeniedException('only review creators can update reviews');

    const review_status = newPartStatus as Review_Status;
    const completedAt =
      review_status === Review_Status.APPROVED || review_status === Review_Status.REVIEWED ? new Date() : null;

    const updatedReview = await prisma.part_Review.update({
      where: { partReviewId: reviewId },
      data: { notes: notes ? notes : review.notes, completedAt, fileIds: fileIds ? fileIds : review.fileIds },
      ...getPartReviewQueryArgs(organizationId)
    });

    await prisma.part.update({ where: { partId: review.submission.partId }, data: { status: review_status } });

    return partReviewTransformer(updatedReview);
  }

  /**
   * Deletes a review
   * @param reviewId the review being deleted
   * @param deleter the user deleting (must be creator)
   * @param organizationId the organization
   */
  static async deleteReview(reviewId: string, deleter: User, organizationId: string) {
    const review = await prisma.part_Review.findUnique({
      where: { partReviewId: reviewId },
      include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
    });

    if (!review || review.submission.part.project.wbsElement.organizationId !== organizationId)
      throw new NotFoundException('Part Review', reviewId);
    if (review.dateDeleted) throw new DeletedException('Part Review', reviewId);
    if (review.completedAt) throw new HttpException(409, 'Cannot delete a completed review');

    if (
      deleter.userId !== review.userCreatedId &&
      !userHasPermission(deleter.userId, organizationId, (role) => isAtLeastRank(RoleEnum.HEAD, role))
    ) {
      throw new AccessDeniedException('only review creators and heads/admins can delete reviews');
    }

    await prisma.part_Review.update({
      where: { partReviewId: reviewId },
      data: { dateDeleted: new Date(), userDeleted: { connect: { userId: deleter.userId } } },
      ...getPartReviewQueryArgs(organizationId)
    });
  }

  /**
   * Creates a submission for a given part
   * @param partId the part that the submission will be added to
   * @param creator the creator
   * @param organizationId the organization
   * @param name the name of the submission
   * @param notes optional notes
   * @param files the files in the submission
   * @returns the created submission
   */
  static async createSubmission(
    partId: string,
    creator: User,
    organizationId: string,
    name: string,
    fileIds: string[],
    notes?: string
  ) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, creator.userId, organizationId);

    const submission = await prisma.part_Submission.create({
      data: { name, notes, fileIds, part: { connect: { partId } }, userCreated: { connect: { userId: creator.userId } } },
      ...getPartSubmissionQueryArgs(organizationId, creator.userId)
    });

    await prisma.part.update({ where: { partId }, data: { status: Review_Status.READY_FOR_REVIEW } });

    if (!part.previewImageId && fileIds.length > 0) {
      await prisma.part.update({ where: { partId: part.partId }, data: { previewImageId: fileIds[0] } });
    }

    return partSubmissionTransformer(submission);
  }

  /**
   * updates a given submission
   * @param submissionId the submission being updated
   * @param updater the user updating (must be the creator)
   * @param organizationId the organization
   * @param name the new name of the submission
   * @param notes the new notes (optional)
   * @returns the updated submission
   */
  static async updateSubmission(submissionId: string, updater: User, organizationId: string, name: string, notes?: string) {
    const submission = await prisma.part_Submission.findUnique({
      where: { partSubmissionId: submissionId },
      include: { part: { include: { project: { include: { wbsElement: true } } } } }
    });
    if (!submission) throw new NotFoundException('Part Submission', submissionId);
    if (submission.dateDeleted) throw new DeletedException('Part Submission', submissionId);
    if (submission.part.project.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Part Submission');

    if (updater.userId !== submission.userCreatedId)
      throw new AccessDeniedException('only submission creators can update submissions');

    const updatedSubmission = await prisma.part_Submission.update({
      where: { partSubmissionId: submissionId },
      data: { name, notes: notes ?? submission.notes },
      ...getPartSubmissionQueryArgs(organizationId, updater.userId)
    });

    return partSubmissionTransformer(updatedSubmission);
  }

  /**
   * Uses the given organizationID to and returns an array of part tags
   * @param organizationId the organization to get the parts for
   * @returns an array of part tags
   */
  static async getAllPartTags(organizationId: string) {
    const tags = await prisma.part_Tag.findMany({ where: { organizationId, dateDeleted: null } });
    return tags.map(partTagTransformer);
  }

  /**
   * Gets all part review FAQs for the given organization Id
   * @param organizationId organization Id of the FAQ
   * @returns all the part review faqs from the given organization
   */
  static async getAllPartReviewFAQs(organizationId: string) {
    const partReviewFAQs = await prisma.frequentlyAskedQuestion.findMany({
      where: { dateDeleted: null, partReviewFaqOrgId: organizationId },
      ...getFaqQueryArgs(organizationId)
    });

    return partReviewFAQs.map(faqTransformer);
  }

  /**
   * creates a new part tag with no ascociated parts
   * @param name the name of the tag
   * @param colorHexCode the color of the tag
   * @param creator the user creating the tag -- must be admin
   * @param organizationId the organization id
   * @returns the created part tag
   */
  static async createPartTag(name: string, colorHexCode: string, creator: User, organizationId: string): Promise<PartTag> {
    if (!(await userHasPermission(creator.userId, organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role)))) {
      throw new AccessDeniedAdminOnlyException('create part review tag');
    }

    const partTag = await prisma.part_Tag.create({
      data: { name, colorHexCode, organization: { connect: { organizationId } } }
    });

    return partTag;
  }

  /**
   * updates an existing part tag
   * @param partTagId the id of the part tag to update
   * @param name the name of the tag
   * @param colorHexCode the color of the tag
   * @param updater the user updating the tag -- must be admin
   * @param organizationId the organization id
   * @returns the updated part tag
   */
  static async updatePartTag(
    partTagId: string,
    name: string,
    colorHexCode: string,
    updater: User,
    organizationId: string
  ): Promise<PartTag> {
    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update part review tag');
    }

    const partTag = await prisma.part_Tag.findUnique({ where: { partTagId } });

    if (!partTag || partTag.organizationId !== organizationId) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (partTag.dateDeleted) {
      throw new DeletedException('Part Tag', partTagId);
    }

    const updatedPartTag = await prisma.part_Tag.update({ where: { partTagId }, data: { name, colorHexCode } });

    return updatedPartTag;
  }

  /**
   * deletes an existing part tag
   * @param partTagId the id of the part tag to delete
   * @param deleter the user deleting the tag -- must be admin
   * @param organizationId the organization id
   * @returns the delted part tag
   * @throws if there are existing parts with this tag
   */
  static async deletePartTag(partTagId: string, deleter: User, organizationId: string) {
    if (!(await userHasPermission(deleter.userId, organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role)))) {
      throw new AccessDeniedAdminOnlyException('delete part review tag');
    }

    const partTagWithParts = await prisma.part_Tag.findUnique({ where: { partTagId }, include: { parts: true } });

    if (!partTagWithParts || partTagWithParts.organizationId !== organizationId) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (
      partTagWithParts.parts.some((part) => {
        return part.dateDeleted === null;
      })
    ) {
      throw new HttpException(409, `Cannot delete part tag ${partTagId} because it has associated parts`);
    }

    await prisma.part_Tag.update({ where: { partTagId }, data: { dateDeleted: new Date() } });
  }

  /**
   * Creates an faq
   * @param question the question
   * @param answer the answer
   * @param creator user creating -- must be admin
   * @param organizationId the organization
   * @returns the faq
   */
  static async createFaq(
    question: string,
    answer: string,
    creator: User,
    organizationId: string
  ): Promise<FrequentlyAskedQuestion> {
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create part review faq');
    }

    const faq = await prisma.frequentlyAskedQuestion.create({
      data: {
        question,
        answer,
        userCreated: { connect: { userId: creator.userId } },
        partReviewFaqOrg: { connect: { organizationId } }
      },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(faq);
  }

  /**
   * updates an faq
   * @param faqId the faq to update
   * @param question the question
   * @param answer the answer
   * @param updater the user updating -- must be an admin
   * @param organizationId the organization
   * @returns the updated faq
   */
  static async updateFaq(
    faqId: string,
    question: string,
    answer: string,
    updater: User,
    organizationId: string
  ): Promise<FrequentlyAskedQuestion> {
    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update faq');
    }

    const faq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId } });

    if (!faq || faq.partReviewFaqOrgId !== organizationId) {
      throw new NotFoundException('Faq', faqId);
    }

    if (faq.dateDeleted) {
      throw new DeletedException('Faq', faqId);
    }

    const updatedFaq = await prisma.frequentlyAskedQuestion.update({
      where: { faqId },
      data: { question, answer },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(updatedFaq);
  }

  /**
   * Deletes an faq
   * @param faqId the faq to delete
   * @param deleter the user deleting -- must be admin
   * @param organizationId the organization
   * @returns the deleted faq
   */
  static async deleteFaq(faqId: string, deleter: User, organizationId: string): Promise<FrequentlyAskedQuestion> {
    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete faq');
    }

    const faq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId }, ...getFaqQueryArgs });

    if (!faq || faq.partReviewFaqOrgId !== organizationId) {
      throw new NotFoundException('Faq', faqId);
    }

    if (faq.dateDeleted) {
      throw new DeletedException('Faq', faqId);
    }

    const deletedFaq = await prisma.frequentlyAskedQuestion.update({
      where: { faqId },
      data: { userDeleted: { connect: { userId: deleter.userId } }, dateDeleted: new Date() },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(deletedFaq);
  }

  /**
   * Gets all of the common mistakes associated with part reviews in the given organization
   * @param organizationId the organization
   * @returns an array of common mistakes
   */
  static async getAllCommonMistakes(organizationId: string): Promise<PartReviewCommonMistake[]> {
    const commonMistakes = await prisma.part_Review_Common_Mistake.findMany({
      where: { dateDeleted: null, organizationId },
      ...getFaqQueryArgs(organizationId)
    });

    return commonMistakes.map(partsReviewCommonMistakeTransformer);
  }

  /**
   * Creates a common mistake
   * @param title the title
   * @param description the description
   * @param starred whether or not it is starred
   * @param creator the use creating -- must be an admin
   * @param organizationId the organization
   * @returns the created common mistake
   */
  static async createCommonMistake(
    title: string,
    description: string,
    starred: boolean,
    creator: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    if (starred && !(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create common mistake');
    }

    const commonMistake = await prisma.part_Review_Common_Mistake.create({
      data: {
        title,
        description,
        starred,
        userCreated: { connect: { userId: creator.userId } },
        organization: { connect: { organizationId } }
      }
    });

    return partsReviewCommonMistakeTransformer(commonMistake);
  }

  /**
   * Updates a common mistake
   * @param commonMistakeId the id of the common mistake to be updated
   * @param title the title
   * @param description the description
   * @param starred whether or not it is starred
   * @param updater the user makign the update -- must be admin
   * @param organizationId the organization
   * @returns the updated common mistake
   */
  static async updateCommonMistake(
    commonMistakeId: string,
    title: string,
    description: string,
    starred: boolean,
    updater: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    const commonMistake = await prisma.part_Review_Common_Mistake.findUnique({
      where: { partReviewCommonMistakeId: commonMistakeId }
    });

    if (!commonMistake || commonMistake.organizationId !== organizationId) {
      throw new NotFoundException('Common Mistake', commonMistakeId);
    }

    if (commonMistake.dateDeleted) {
      throw new DeletedException('Common Mistake', commonMistakeId);
    }

    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update common mistake');
    }

    const updatedCommonMistake = await prisma.part_Review_Common_Mistake.update({
      where: { partReviewCommonMistakeId: commonMistakeId },
      data: { title, description, starred }
    });

    return partsReviewCommonMistakeTransformer(updatedCommonMistake);
  }

  /**
   * Deletes a common mistake
   * @param commonMistakeId the id of the common mistake to delete
   * @param deleter the user deleting -- must be admin
   * @param organizationId the orgainization
   * @returns the deleted common mistake
   */
  static async deleteCommonMistake(commonMistakeId: string, deleter: User, organizationId: string) {
    const commonMistake = await prisma.part_Review_Common_Mistake.findUnique({
      where: { partReviewCommonMistakeId: commonMistakeId }
    });

    if (!commonMistake || commonMistake.organizationId !== organizationId) {
      throw new NotFoundException('Common Mistake', commonMistakeId);
    }

    if (commonMistake.dateDeleted) {
      throw new DeletedException('Common Mistake', commonMistakeId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete common mistake');
    }

    await prisma.part_Review_Common_Mistake.update({
      where: { partReviewCommonMistakeId: commonMistakeId },
      data: { userDeleted: { connect: { userId: deleter.userId } }, dateDeleted: new Date() }
    });
  }

  /**
   * Creates a new part review request.
   * @param partId - the id of the part to request a review on
   * @param requester - user who is creating the review request
   * @param reviewerId - user who is being asked to review
   * @param organizationId - organization id to validate permissions
   * @returns the created and transformed PartReviewRequest
   */
  static async createPartReviewRequest(partId: string, requester: User, reviewerId: string, organizationId: string) {
    await PartReviewService.getPartWithQueryArgs(partId, requester.userId, organizationId);

    if (!userHasPermission(requester.userId, organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role))) {
      throw new AccessDeniedGuestException('Guests must be at least members to access this part.');
    }

    const createdRequest = await prisma.part_Review_Request.create({
      data: {
        part: { connect: { partId } },
        requester: { connect: { userId: requester.userId } },
        reviewerRequested: { connect: { userId: reviewerId } }
      },
      ...getPartReviewRequestQueryArgs(organizationId)
    });

    return partReviewRequestTransformer(createdRequest);
  }

  /**
   * soft deletes an existing part review request if the requester, reviewer, or an admin initiates the request
   * @param reviewRequestId - the ID of the part whose review request should be deleted
   * @param user - the user attempting to delete the review request
   * @param organizationId - the organization ID to validate permissions
   * @returns the soft-deleted and transformed PartReviewRequest
   */
  static async deletePartReviewRequest(reviewRequestId: string, user: User, organizationId: string) {
    const reviewRequest = await prisma.part_Review_Request.findUnique({
      where: { partReviewRequestId: reviewRequestId },
      include: { part: { include: { project: { include: { wbsElement: true } } } } }
    });

    if (!reviewRequest || reviewRequest.part.project.wbsElement.organizationId !== organizationId) {
      throw new NotFoundException('Review Request', reviewRequestId);
    }

    if (reviewRequest.dateDeleted) {
      throw new DeletedException('Review Request', reviewRequestId);
    }

    const isRequester = reviewRequest.requesterId === user.userId;
    const isReviewer = reviewRequest.reviewerId === user.userId;
    const isLeader = await userHasPermission(user.userId, organizationId, isLeadership);

    if (!isRequester && !isReviewer && !isLeader) {
      throw new AccessDeniedException('Only the requester, reviewer, or leadership can delete a part review request.');
    }

    const softDeletedRequest = await prisma.part_Review_Request.update({
      where: { partReviewRequestId: reviewRequest.partReviewRequestId },
      data: { dateDeleted: new Date() },
      ...getPartReviewRequestQueryArgs(organizationId)
    });
    return partReviewRequestTransformer(softDeletedRequest);
  }

  /**
   * Sends a notification to the reviewer of a part review request
   * @param reviewerId id of the reviewer
   * @param partId id of the part
   * @param creator id of the creator
   * @param organizationId id of the organization
   */
  static async notifyReviewer(reviewerId: string, partId: string, creator: User, organizationId: string) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, creator.userId, organizationId);

    if (!part.reviewRequests.some((request) => request.reviewerId === reviewerId)) {
      throw new HttpException(400, 'User is not a reviewer for this part');
    }

    const reviewer = await prisma.user.findUnique({
      where: { userId: reviewerId },
      ...getUserWithSettingsQueryArgs(organizationId)
    });
    if (!reviewer) {
      throw new NotFoundException('User', reviewerId);
    }

    const wbsNum = `${part.project.wbsElement.carNumber}.${part.project.wbsElement.projectNumber}.0`;
    const partLink = `/projects/${wbsNum}/part/${part.index}`;

    await sendPartReviewRequestPopUp(partLink, part.commonName, reviewerId, organizationId);
    if (reviewer.userSettings?.slackId) {
      await sendSlackPartReviewRequestNotif(
        reviewer.userSettings.slackId,
        part.project.wbsElement.name,
        part.commonName,
        partLink
      );
    }
  }

  /**
   * Sends a notification to the assignee of a part
   * @param assigneeId id of the assignee
   * @param partId id of the part
   * @param creator id of the creator
   * @param organizationId id of the organization
   */
  static async notifyAssignee(assigneeId: string, partId: string, creator: User, organizationId: string) {
    const part = await PartReviewService.getPartWithQueryArgs(partId, creator.userId, organizationId);

    if (!part.assignees.some((assignee) => assignee.userId === assigneeId)) {
      throw new HttpException(400, 'User is not an assignee for this part');
    }

    const assignee = await prisma.user.findUnique({
      where: { userId: assigneeId },
      ...getUserWithSettingsQueryArgs(organizationId)
    });
    if (!assignee) {
      throw new NotFoundException('User', assigneeId);
    }

    const wbsNum = `${part.project.wbsElement.carNumber}.${part.project.wbsElement.projectNumber}.0`;
    const partLink = `/projects/${wbsNum}/part/${part.index}`;

    await sendPartAssignmentPopUp(partLink, part.commonName, assigneeId, organizationId);
    if (assignee.userSettings?.slackId) {
      await sendSlackPartAssignmentNotif(
        assignee.userSettings.slackId,
        part.project.wbsElement.name,
        part.commonName,
        partLink
      );
    }
  }

  /**
   * Creates a part review popup
   *
   * @param organizationId Id of the organization
   * @param reviewId ID of the review
   * @param xCoord X coordinate of the popup
   * @param yCoord Y coordinate of the popup
   * @param fileIndex the index of the file this popup is on
   * @param title Title of the popup
   * @param description Description of the popup
   * @param creator The user creating the popup
   * @returns The newly created popup
   */
  static async createPartReviewPopup(
    organizationId: string,
    reviewId: string,
    xCoord: number,
    yCoord: number,
    fileIndex: number,
    title: string,
    description: string,
    creator: User
  ) {
    const review = await prisma.part_Review.findUnique({
      where: { partReviewId: reviewId },
      include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
    });

    if (!review || review.submission.part.project.wbsElement.organizationId !== organizationId) {
      throw new NotFoundException('Part Review', reviewId);
    }

    if (review.dateDeleted) {
      throw new DeletedException('Part Review', reviewId);
    }

    const isAdminUser = await userHasPermission(creator.userId, organizationId, isAdmin);

    if (review.userCreatedId !== creator.userId && !isAdminUser) {
      throw new AccessDeniedAdminOnlyException('create part review popup');
    }

    const newPopup = await prisma.part_Review_Popup.create({
      data: {
        review: { connect: { partReviewId: reviewId } },
        xCoord,
        yCoord,
        fileIndex,
        title,
        description: description ?? ''
      },
      ...getPartReviewQueryArgs
    });
    return newPopup;
  }

  /**
   * Updates a part review popup
   * @param organizationId id of the organization
   * @param popupId ID of the popup to update
   * @param xCoord New X coordinate
   * @param yCoord New Y coordinate
   * @param fileIndex the index of the file this popup is on
   * @param title New title
   * @param description New description
   * @param updater The user updating the popup
   * @returns The updated popup
   */
  static async updatePartReviewPopup(
    organizationId: string,
    popupId: string,
    xCoord: number,
    yCoord: number,
    fileIndex: number,
    title: string,
    description: string,
    updater: User
  ) {
    const popup = await prisma.part_Review_Popup.findUnique({
      where: { partReviewPopupId: popupId },
      include: {
        review: {
          include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
        }
      }
    });

    if (!popup || popup.review.submission.part.project.wbsElement.organizationId !== organizationId) {
      throw new NotFoundException('Pop Up', popupId);
    }

    if (popup.deletedAt) {
      throw new DeletedException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(updater.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('update part review popup');
    }

    return await prisma.part_Review_Popup.update({
      where: { partReviewPopupId: popupId },
      data: { xCoord, yCoord, fileIndex, title, description, updatedAt: new Date() },
      ...getPartReviewQueryArgs
    });
  }

  /**
   * Deletes a part review popup
   * @param popupId ID of the popup to delete
   * @param deleter The user deleting the popup
   * @returns Confirmation message
   */
  static async deletePartReviewPopup(popupId: string, deleter: User, organizationId: string) {
    const popup = await prisma.part_Review_Popup.findUnique({
      where: { partReviewPopupId: popupId },
      include: {
        review: {
          include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
        }
      }
    });

    if (!popup || popup.review.submission.part.project.wbsElement.organizationId !== organizationId) {
      throw new NotFoundException('Pop Up', popupId);
    }

    if (popup.deletedAt) {
      throw new DeletedException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(deleter.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('delete part review popup');
    }

    const deletedPopup = await prisma.part_Review_Popup.update({
      where: { partReviewPopupId: popupId },
      data: { deletedAt: new Date() },
      ...getPartReviewQueryArgs
    });

    return partReviewPopupTransformer(deletedPopup);
  }

  /**
   * Downloads a file from Google Drive given a fileId
   * @param fileId The ID of the file in Google Drive
   * @returns the file buffer and MIME type
   */
  static async downloadFile(
    fileId: string,
    user: User,
    organization: Organization
  ): Promise<{ buffer: Buffer; type: string }> {
    if (!userHasPermission(user.userId, organization.organizationId, (role) => isAtLeastRank(RoleEnum.MEMBER, role))) {
      throw new AccessDeniedException('Only members of the current organization can upload files');
    }
    const fileData = await downloadFile(fileId);
    return fileData;
  }

  /**
   * Sets the part review sample image for an organization, User must be admin
   * @param image the image which will be uploaded and have its id stored in the org
   * @param submitter the user submitting the sample image
   * @param organization the organization who's sample image is being set
   * @returns the updated organization
   * @throws if the user is not an admin
   */
  static async setPartReviewSampleImage(
    image: Express.Multer.File,
    submitter: User,
    organization: Organization
  ): Promise<Organization> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update part review sample image');
    }

    const previewImageData = await uploadFile(image);

    if (!previewImageData?.name) {
      throw new HttpException(500, 'Image Name not found');
    }

    const updatedOrg = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { partReviewSampleImageId: previewImageData.id }
    });

    return updatedOrg;
  }

  /**
   * Gets the part review sample image of the organization
   * @param organizationId the id of the organization
   * @returns the id of the image
   */
  static async getPartReviewSampleImage(organizationId: string): Promise<string | null> {
    const organization = await prisma.organization.findUnique({ where: { organizationId } });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    return organization.partReviewSampleImageId;
  }
}
