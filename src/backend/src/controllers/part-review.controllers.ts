import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';
import { WbsNumber, validateWBS } from 'shared';
import { HttpException } from '../utils/errors.utils';

export default class PartReviewController {
  static async getPart(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, indexNum } = req.params;

      const wbsNumber: WbsNumber = validateWBS(wbsNum);
      const part = await PartReviewService.getPart(req.organization, wbsNumber, indexNum);
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllPartsForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);

      const parts = await PartReviewService.getAllPartsForProject(wbsNumber, req.organization);
      res.status(200).json(parts);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createPart(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, index, commonName, description, reviewStatus, tagIds, assigneeIds, reviewerIds } = req.body;
      const part = await PartReviewService.createPart(
        req.organization,
        wbsNum,
        req.currentUser,
        index,
        commonName,
        description,
        reviewStatus,
        tagIds,
        assigneeIds,
        reviewerIds
      );
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { partId } = req.params;
      if (!file) throw new HttpException(400, 'Invalid or undefined image data');

      const newPreviewImage = await PartReviewService.uploadPartPreviewImage(
        file,
        partId,
        req.currentUser,
        req.organization.organizationId
      );

      res.status(200).json(newPreviewImage);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, 'Invalid or undefined file data');
      }

      const fileId = await PartReviewService.uploadFile(req.file);

      res.status(200).json(fileId);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updatePart(req: Request, res: Response, next: NextFunction) {
    try {
      const { index, commonName, description, reviewStatus, tagIds, assigneeIds } = req.body;
      const { partId } = req.params;
      const part = await PartReviewService.updatePart(
        req.organization.organizationId,
        partId,
        req.currentUser,
        index,
        commonName,
        description,
        reviewStatus,
        tagIds,
        assigneeIds
      );
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deletePart(req: Request, res: Response, next: NextFunction) {
    try {
      const { partId } = req.params;
      await PartReviewService.deletePart(partId, req.currentUser, req.organization.organizationId);
      res.status(200).json({ message: `Successfully deleted part #${partId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { submissionId, notes, fileIds, status } = req.body;
      const review = await PartReviewService.createReview(
        req.organization.organizationId,
        req.currentUser,
        submissionId,
        status,
        fileIds,
        notes
      );
      res.status(200).json(review);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const { notes, status, fileIds } = req.body;
      const updatedReview = await PartReviewService.updateReview(
        req.organization.organizationId,
        req.currentUser,
        reviewId,
        status,
        notes,
        fileIds
      );
      res.status(200).json(updatedReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { partId, name, fileIds, notes } = req.body;
      const submission = await PartReviewService.createSubmission(
        partId,
        req.currentUser,
        req.organization.organizationId,
        name,
        fileIds,
        notes
      );
      res.status(200).json(submission);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const { name, notes } = req.body;
      const updatedSubmission = await PartReviewService.updateSubmission(
        submissionId,
        req.currentUser,
        req.organization.organizationId,
        name,
        notes
      );
      res.status(200).json(updatedSubmission);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllPartTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await PartReviewService.getAllPartTags(req.organization.organizationId);
      res.status(200).json(tags);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllPartReviewFAQS(req: Request, res: Response, next: NextFunction) {
    try {
      const partReviewFAQS = await PartReviewService.getAllPartReviewFAQs(req.organization.organizationId);
      res.status(200).json(partReviewFAQS);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createPartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, colorHexCode } = req.body;
      const partTag = await PartReviewService.createPartTag(
        name,
        colorHexCode,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(partTag);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updatePartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { partTagId } = req.params;
      const { name, colorHexCode } = req.body;
      const updatedPartTag = await PartReviewService.updatePartTag(
        partTagId,
        name,
        colorHexCode,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).send(updatedPartTag);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deletePartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { partTagId } = req.params;
      await PartReviewService.deletePartTag(partTagId, req.currentUser, req.organization.organizationId);
      res.status(200).send({ message: 'Successfully deleted part tag' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const faq = await PartReviewService.createFaq(question, answer, req.currentUser, req.organization.organizationId);
      res.status(200).json(faq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params;
      const { question, answer } = req.body;
      const updatedfaq = await PartReviewService.updateFaq(
        faqId,
        question,
        answer,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(updatedfaq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params;
      const deletedfaq = await PartReviewService.deleteFaq(faqId, req.currentUser, req.organization.organizationId);
      res.status(200).json(deletedfaq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllCommonMistakes(req: Request, res: Response, next: NextFunction) {
    try {
      const commonMistakes = await PartReviewService.getAllCommonMistakes(req.organization.organizationId);
      res.status(200).json(commonMistakes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, starred } = req.body;
      const commonMistake = await PartReviewService.createCommonMistake(
        title,
        description,
        starred,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(commonMistake);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { commonMistakeId } = req.params;
      const { title, description, starred } = req.body;
      const commonMistake = await PartReviewService.updateCommonMistake(
        commonMistakeId,
        title,
        description,
        starred,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(commonMistake);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { commonMistakeId } = req.params;
      await PartReviewService.deleteCommonMistake(commonMistakeId, req.currentUser, req.organization.organizationId);
      res.status(200).json({ message: 'Successfully deleted common mistake' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createPartReviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { partId } = req.params;
      const { reviewerId } = req.body;

      const request = await PartReviewService.createPartReviewRequest(
        partId,
        req.currentUser,
        reviewerId,
        req.organization.organizationId
      );

      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  }

  static async deletePartReviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewRequestId } = req.params;

      await PartReviewService.deletePartReviewRequest(reviewRequestId, req.currentUser, req.organization.organizationId);

      res.status(200).json({ message: 'Successfully deleted review request' });
    } catch (error) {
      next(error);
    }
  }

  static async createPartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { reviewId } = req.params;
      const organizationID = req.organization.organizationId;
      const { xCoord, yCoord, fileIndex, title, description } = req.body;
      const newPopup = await PartReviewService.createPartReviewPopup(
        organizationID,
        reviewId,
        xCoord,
        yCoord,
        fileIndex,
        title,
        description,
        user
      );
      res.status(200).json(newPopup);
    } catch (error) {
      next(error);
    }
  }

  static async updatePartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { popupId } = req.params;
      const organizationID = req.organization.organizationId;
      const { xCoord, yCoord, fileIndex, title, description } = req.body;
      const updatedPopup = await PartReviewService.updatePartReviewPopup(
        organizationID,
        popupId,
        xCoord,
        yCoord,
        fileIndex,
        title,
        description,
        user
      );
      res.status(200).json(updatedPopup);
    } catch (error) {
      next(error);
    }
  }

  static async deletePartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { popupId } = req.params;
      const organizationID = req.organization.organizationId;
      await PartReviewService.deletePartReviewPopup(popupId, user, organizationID);
      res.status(200).json({ message: 'Popup deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const fileData = await PartReviewService.downloadFile(fileId);

      res.setHeader('content-type', String(fileData.type));
      res.setHeader('content-disposition', `attachment; filename="file-${fileId}"`);
      res.send(fileData.buffer);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setPartReviewSampleImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, 'Invalid or undefined image data');
      }

      const updatedOrg = await PartReviewService.setPartReviewSampleImage(req.file, req.currentUser, req.organization);

      res.status(200).json(updatedOrg);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getPartReviewSampleImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization } = req;

      const partReviewSampleImageId = await PartReviewService.getPartReviewSampleImage(organization.organizationId);
      res.status(200).json(partReviewSampleImageId);
    } catch (error: unknown) {
      next(error);
    }
  }
}
