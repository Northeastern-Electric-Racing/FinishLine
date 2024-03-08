import express from 'express';
import DesignReviewController from '../controllers/design-review.controllers';

const designReviewRouter = express.Router();

designReviewRouter.delete('/:designReviewId/delete', DesignReviewController.deleteDesignReview);
designReviewRouter.get('/:designReviewId', DesignReviewController.getSingleDesignReview);

export default designReviewRouter;
