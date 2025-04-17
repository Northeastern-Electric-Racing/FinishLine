import { Organization, User } from '@prisma/client';
import { userHasPermission, getUserRole } from '../utils/users.utils';
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
  AccessDeniedGuestException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import {
  getPartQueryArgs,
  getPartReviewQueryArgs,
  getPartReviewRequestQueryArgs
} from '../prisma-query-args/part-review.query-args';
import { faqTransformer } from '../transformers/faq.transformer';
import {
  partReviewRequestTransformer,
  partsReviewCommonMistakeTransformer,
  partTransformer,
  partPreviewTransformer,
  partReviewTransformer
} from '../transformers/part-review.transformer';
import { isUserPartOfTeams } from '../utils/teams.utils';
import { uploadFile } from '../utils/google-integration.utils';
import ProjectsService from './projects.services';

export default class PartReviewService {
  /**
   * Uses the given partId to get the specific part and all of its constituent data
   * @param wbsNumber the wbsNum of the project this part is under
   * @param indexNum the index number of the part on this project
   * @returns a single Part
   */
  static async getPart(organization: Organization, wbsNumber: WbsNumber, indexNum: string) {
    const project: Project = await ProjectsService.getSingleProject(wbsNumber, organization);
    const index = Number(indexNum);
    const part = await prisma.part.findUnique({
      where: {
        ProjectId_and_index: {
          projectId: project.id,
          index
        },
        dateDeleted: null
      },
      ...getPartQueryArgs(organization.organizationId)
    });

    if (!part) throw new NotFoundException('Part', `projectId: ${project.id} and index number: ${indexNum}`);

    return partTransformer(part);
  }
  /**
   * Gets all parts for the given project
   * @param wbsNumber the wbs number of the project
   * @param organization the organization to get the parts for
   * @returns all the parts from the given project
   */
  static async getAllPartsForProject(wbsNumber: WbsNumber, organization: Organization) {
    const project: Project = await ProjectsService.getSingleProject(wbsNumber, organization);

    const parts = await prisma.part.findMany({
      where: {
        projectId: project.id,
        dateDeleted: null
      },
      ...getPartQueryArgs(organization.organizationId)
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
   * @param previewImageId
   * @param reviewStatus
   * @param tagIds
   * @param assigneeIds
   * @returns
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
    assigneeIds: string[]
  ) {
    const wbsNumber: WbsNumber = validateWBS(wbsNum);

    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization);

    if (!project) throw new NotFoundException('Project', wbsNum);

    const perms =
      (await userHasPermission(creator.userId, organization.organizationId, isLeadership)) ||
      isUserPartOfTeams(project.teams, creator);

    if (!perms) throw new AccessDeniedException('Only leadership and team members can create a part');

    const part = await prisma.part.create({
      data: {
        index,
        commonName,
        description,
        status: reviewStatus,
        tags: {
          connect: tagIds.map((partTagId) => ({ partTagId }))
        },
        project: { connect: { projectId: project.projectId } },
        assignees: {
          connect: assigneeIds.map((userId) => ({ userId }))
        },
        userCreated: { connect: { userId: creator.userId } }
      },
      ...getPartQueryArgs(organization.organizationId)
    });

    return partTransformer(part);
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
    const part = await prisma.part.findUnique({
      where: {
        partId
      },
      ...getPartQueryArgs(organizationId)
    });
    if (!part) throw new NotFoundException('Part', partId);

    if (part.dateDeleted) throw new DeletedException('Part', partId);

    if (previewImage.size > 1000000) throw new HttpException(413, 'files bust be less than 1 mb');

    const hasPermission =
      (await userHasPermission(submitter.userId, organizationId, isLeadership)) ||
      submitter.userId === part.userCreated.userId;
    if (!hasPermission) throw new AccessDeniedException('Only leadership and part creators can add a preview image');

    const { id } = await uploadFile(previewImage);

    const updatedPart = await prisma.part.update({
      where: { partId },
      data: {
        previewImageId: id
      },
      ...getPartQueryArgs(organizationId)
    });

    return partTransformer(updatedPart);
  }

  static async updatePart(
    organizationId: string,
    partId: string,
    updater: User,
    index: number,
    commonName: string,
    description: string,
    reviewStatus: Review_Status,
    tagIds: string[],
    assigneeIds: string[]
  ) {
    const part = await prisma.part.findUnique({
      where: { partId },
      ...getPartQueryArgs(organizationId)
    });

    if (!part) throw new NotFoundException('Part', partId);

    if (part.dateDeleted) throw new DeletedException('Part', partId);

    const hasPermission =
      (await userHasPermission(updater.userId, organizationId, isLeadership)) || updater.userId === part.userCreated.userId;

    if (!hasPermission) throw new AccessDeniedException('Only leadership and the part creator can update part data');

    const updatedPart = await prisma.part.update({
      where: { partId },
      data: {
        index,
        commonName,
        description,
        status: reviewStatus,
        tags: {
          set: tagIds.map((partTagId) => ({ partTagId }))
        },
        assignees: {
          set: assigneeIds.map((userId) => ({ userId }))
        }
      },
      ...getPartQueryArgs(organizationId)
    });

    return partTransformer(updatedPart);
  }

  static async deletePart(partId: string, deleter: User, organizationId: string) {
    const part = await prisma.part.findUnique({
      where: { partId },
      ...getPartQueryArgs(organizationId)
    });

    if (!part) throw new NotFoundException('Part', partId);

    if (part.dateDeleted) throw new DeletedException('Part', partId);

    const hasPermission =
      (await userHasPermission(deleter.userId, organizationId, isLeadership)) || deleter.userId === part.userCreated.userId;

    if (!hasPermission) throw new AccessDeniedException('Only leadership and the part creator can delete a part');

    const deletedPart = await prisma.part.update({
      where: { partId },
      data: {
        dateDeleted: new Date(),
        userDeleted: {
          connect: {
            userId: deleter.userId
          }
        }
      },
      ...getPartQueryArgs(organizationId)
    });

    return partTransformer(deletedPart);
  }

  /**
   * Creates a review on a submission for a part
   * @param organizationId the organization
   * @param creator the creator of the review
   * @param submissionId the submission
   * @param notes optional notes on the review
   * @param newPartStatus the new status of the part which the review is added to.
   * if this status is Reviewed or approved, the completedAt date is set to now
   * @returns the created review
   */
  static async createReview(
    organizationId: string,
    creator: User,
    submissionId: string,
    newPartStatus: string,
    notes: string
  ) {
    const submission = await prisma.partSubmission.findUnique({
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

    await prisma.part.update({
      where: {
        partId: submission.partId
      },
      data: {
        status: review_status
      }
    });

    const review = await prisma.partReview.create({
      data: {
        submission: {
          connect: { partSubmissionId: submissionId }
        },
        userCreated: {
          connect: { userId: creator.userId }
        },
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
  static async updateReview(organizationId: string, updater: User, reviewId: string, newPartStatus: string, notes: string) {
    const review = await prisma.partReview.findUnique({
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

    const updatedReview = await prisma.partReview.update({
      where: { partReviewId: reviewId },
      data: {
        notes,
        completedAt
      },
      ...getPartReviewQueryArgs(organizationId)
    });

    await prisma.part.update({
      where: {
        partId: review.submission.partId
      },
      data: {
        status: review_status
      }
    });

    return partReviewTransformer(updatedReview);
  }

  /**
   * Uploads an array of files to a given review
   * @param reviewId the review
   * @param uploader the user uploading (must be creator)
   * @param organizationId the organization
   * @param files an array of files to upload
   * @returns the updated review
   */
  static async uploadReviewFiles(reviewId: string, uploader: User, organizationId: string, files: Express.Multer.File[]) {
    const review = await prisma.partReview.findUnique({
      where: { partReviewId: reviewId },
      include: { submission: { include: { part: { include: { project: { include: { wbsElement: true } } } } } } }
    });

    if (!review) throw new NotFoundException('Part Review', reviewId);
    if (review.dateDeleted) throw new DeletedException('Part Review', reviewId);
    if (review.submission.part.project.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Part Review');

    if (uploader.userId !== review.userCreatedId) throw new AccessDeniedException('only review creators can update reviews');

    const fileIds = await Promise.all(
      files.map(async (file) => {
        return (await uploadFile(file)).id;
      })
    );

    const updatedReview = await prisma.partReview.update({
      where: { partReviewId: reviewId },
      data: {
        fileIds
      },
      ...getPartReviewQueryArgs(organizationId)
    });

    return partReviewTransformer(updatedReview);
  }

  /**
   * Uses the given organizationID to and returns an array of part tags
   * @param organizationId the organization to get the parts for
   * @returns an array of part tags
   */
  static async getAllPartTags(organizationId: string) {
    return prisma.partTag.findMany({
      where: {
        organizationId,
        dateDeleted: null
      }
    });
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
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create part review tag');
    }

    const partTag = await prisma.partTag.create({
      data: {
        name,
        colorHexCode,
        organization: {
          connect: {
            organizationId
          }
        }
      }
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

    const partTag = await prisma.partTag.findUnique({
      where: {
        partTagId
      }
    });

    if (!partTag) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (partTag.dateDeleted) {
      throw new DeletedException('Part Tag', partTagId);
    }

    const updatedPartTag = await prisma.partTag.update({
      where: {
        partTagId
      },
      data: {
        name,
        colorHexCode
      }
    });

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
  static async deletePartTag(partTagId: string, deleter: User, organizationId: string): Promise<PartTag> {
    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete part review tag');
    }

    const partTagWithParts = await prisma.partTag.findUnique({
      where: { partTagId },
      include: {
        parts: true
      }
    });

    if (!partTagWithParts) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (
      !partTagWithParts.parts.every((part) => {
        return !part.dateDeleted;
      })
    ) {
      throw new HttpException(409, `Cannot delete part tag ${partTagId} because it has associated parts`);
    }

    const deletedPartTag = await prisma.partTag.update({
      where: {
        partTagId
      },
      data: {
        dateDeleted: new Date()
      }
    });

    return deletedPartTag;
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
        userCreated: {
          connect: {
            userId: creator.userId
          }
        },
        partReviewFaqOrg: {
          connect: {
            organizationId
          }
        }
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
    const faq = await prisma.frequentlyAskedQuestion.findUnique({
      where: {
        faqId
      }
    });

    if (!faq) {
      throw new NotFoundException('Faq', faqId);
    }

    if (faq.dateDeleted) {
      throw new DeletedException('Faq', faqId);
    }

    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update faq');
    }

    const updatedFaq = await prisma.frequentlyAskedQuestion.update({
      where: {
        faqId
      },
      data: {
        question,
        answer
      },
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
    const faq = await prisma.frequentlyAskedQuestion.findUnique({
      where: {
        faqId
      },
      ...getFaqQueryArgs
    });

    if (!faq) {
      throw new NotFoundException('Faq', faqId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete faq');
    }

    const deletedFaq = await prisma.frequentlyAskedQuestion.update({
      where: {
        faqId
      },
      data: {
        userDeleted: {
          connect: {
            userId: deleter.userId
          }
        },
        dateDeleted: new Date()
      },
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
    const commonMistakes = await prisma.partReviewCommonMistake.findMany({
      where: {
        dateDeleted: null,
        organizationId
      },
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
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create common mistake');
    }

    const commonMistake = await prisma.partReviewCommonMistake.create({
      data: {
        title,
        description,
        starred,
        userCreated: {
          connect: {
            userId: creator.userId
          }
        },
        organization: {
          connect: {
            organizationId
          }
        }
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
    const commonMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      }
    });

    if (!commonMistake) {
      throw new NotFoundException('Common Mistake', commonMistakeId);
    }

    if (commonMistake.dateDeleted) {
      throw new DeletedException('Common Mistake', commonMistakeId);
    }

    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update common mistake');
    }

    const updatedCommonMistake = await prisma.partReviewCommonMistake.update({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      },
      data: {
        title,
        description,
        starred
      }
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
  static async deleteCommonMistake(
    commonMistakeId: string,
    deleter: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    const commonMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      }
    });

    if (!commonMistake) {
      throw new NotFoundException('Common Mistake', commonMistakeId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete common mistake');
    }

    const deletedCommonMistake = await prisma.partReviewCommonMistake.update({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      },
      data: {
        userDeleted: {
          connect: {
            userId: deleter.userId
          }
        },
        dateDeleted: new Date()
      }
    });

    return partsReviewCommonMistakeTransformer(deletedCommonMistake);
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
    const part = await prisma.part.findUnique({
      where: { partId }
    });

    if (!part) {
      throw new NotFoundException('Part', partId);
    }

    if (part.dateDeleted) {
      throw new DeletedException('Part', partId);
    }

    const role = await getUserRole(requester.userId, organizationId);
    const hasAccess = isAtLeastRank(RoleEnum.MEMBER, role);

    if (!hasAccess) {
      throw new AccessDeniedGuestException('Guests must be at least members to access this part.');
    }

    const createdRequest = await prisma.partReviewRequest.create({
      data: {
        part: {
          connect: { partId }
        },
        requester: {
          connect: { userId: requester.userId }
        },
        reviewerRequested: {
          connect: { userId: reviewerId }
        }
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
    const reviewRequest = await prisma.partReviewRequest.findUnique({
      where: { partReviewRequestId: reviewRequestId }
    });

    if (!reviewRequest) {
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

    const softDeletedRequest = await prisma.partReviewRequest.update({
      where: {
        partReviewRequestId: reviewRequest.partReviewRequestId
      },
      data: {
        dateDeleted: new Date()
      },
      ...getPartReviewRequestQueryArgs(organizationId)
    });
    return partReviewRequestTransformer(softDeletedRequest);
  }

  /*
   * Creates a part review popup
   * @param organizationId Id of the organization
   * @param reviewId ID of the review
   * @param xCoord X coordinate of the popup
   * @param yCoord Y coordinate of the popup
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
    title: string,
    description: string,
    creator: User
  ) {
    const review = await prisma.partReview.findUnique({
      where: {
        partReviewId: reviewId
      }
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException('Part Review', reviewId);
    }

    const isAdminUser = await userHasPermission(creator.userId, organizationId, isAdmin);

    if (review.userCreatedId !== creator.userId && !isAdminUser) {
      throw new AccessDeniedAdminOnlyException('create part review popup');
    }

    const newPopup = await prisma.part_Review_Popup.create({
      data: {
        review: {
          connect: {
            partReviewId: reviewId
          }
        },
        xCoord,
        yCoord,
        title,
        description
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
    title: string,
    description: string,
    updater: User
  ) {
    const popup = await prisma.part_Review_Popup.findUnique({
      where: {
        partReviewPopupId: popupId
      }
    });

    if (!popup || popup.deletedAt !== null) {
      throw new NotFoundException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(updater.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('update part review popup');
    }

    return prisma.part_Review_Popup.update({
      where: {
        partReviewPopupId: popupId
      },
      data: {
        xCoord,
        yCoord,
        title,
        description,
        updatedAt: new Date()
      },
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
      include: { review: { select: { userCreatedId: true, partReviewId: true } } }
    });

    if (!popup || popup.deletedAt) {
      throw new NotFoundException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(deleter.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('delete part review popup');
    }

    const deletedPopup = await prisma.part_Review_Popup.update({
      where: { partReviewPopupId: popupId },
      data: {
        deletedAt: new Date()
      },
      ...getPartReviewQueryArgs
    });

    return deletedPopup;
  }
}
