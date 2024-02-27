import { NextFunction, Request, Response } from "express";
import { getCurrentUser } from "../utils/auth.utils";
import { User } from "shared";
import { Design_Review } from "@prisma/client";
import DesignReviewService from "../services/design-review.services";

export default class DesignReviewController {
    
    static async createDesignReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user: User = await getCurrentUser(res);
            const {
                dateScheduled,
                teamType,
                requiredMembers,
                optionalMembers,
                location,
                isOnline,
                isInPerson,
                zoomLink,
                docTemplateLink,
                wbsElementId,
                meetingTime
            } = req.body;

            const createdDesignReview: Design_Review = await DesignReviewService.createDesignReview(
                user,
                dateScheduled,
                teamType,
                requiredMembers,
                optionalMembers,
                location,
                isOnline,
                isInPerson,
                zoomLink,
                docTemplateLink,
                wbsElementId,
                meetingTime
            );
            return res.status(200).json(createdDesignReview);
        }
        catch (error: unknown) {
            next(error);
        }
        
    }


}