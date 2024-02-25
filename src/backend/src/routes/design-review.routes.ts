import express from 'express';
import DesignReviewController from '../controllers/design-review.controllers';

const designReviewRouter = express.Router();

designReviewRouter.get('/:DesignReviewId', DesignReviewController.getSingleDesignReview);
export default designReviewRouter;
