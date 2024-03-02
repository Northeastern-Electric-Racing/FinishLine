import express from 'express';
import DesignReviewController from '../controllers/design-review.controllers';

const designReviewRouter = express.Router();

designReviewRouter.get('/', DesignReviewController.getAllDesignReviews);

designReviewRouter.delete('/:designReviewId/delete', DesignReviewController.deleteDesignReview);

export default designReviewRouter;
