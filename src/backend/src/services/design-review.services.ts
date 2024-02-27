import { Design_Review, Design_Review_Status, TeamType } from "@prisma/client";
import { User, isGuest } from "shared";
import { AccessDeniedGuestException } from "../utils/errors.utils";
import prisma from "../prisma/prisma";

export default class DesignReviewService {


    static async createDesignReview(
        user: User,
        dateScheduled: string,
        teamType: TeamType,
        requiredMembers: User[],
        optionalMembers: User[],
        location: string,
        isOnline: boolean,
        isInPerson: boolean,
        zoomLink: string,
        docTemplateLink: string,
        wbsElementId: number,
        meetingTimes: number[]
    ): Promise<Design_Review> {
        if (isGuest(user.role)) throw new AccessDeniedGuestException('create design review');

        const userCreatedId = user.userId;

        const { teamTypeId } = teamType;

        const design_review = await prisma.design_Review.create({
            data: {
              dateScheduled,
              dateCreated: new Date(),
              status: Design_Review_Status.UNCONFIRMED,
              location,
              isOnline,
              isInPerson,
              docTemplateLink,
              userCreatedId,
              teamTypeId,
              requiredMembers: { connect: requiredMembers.map((user) => ({ userId: user.userId })) },
              optionalMembers: { connect: optionalMembers.map((user) => ({ userId: user.userId })) },
              zoomLink,
              meetingTimes,
              wbsElementId
            }
          });
      
          return design_review;
    }
}

//requiredMembers?: UserCreateNestedManyWithoutRequiredDesignReviewsInput
//    optionalMembers?: UserCreateNestedManyWithoutOptionalDesignReviewsInput
//     confirmedMembers?: UserCreateNestedManyWithoutUserConfirmedDesignReviewsInput
//     deniedMembers?: UserCreateNestedManyWithoutUserDeniedDesignReviewsInput
//     attendees?: UserCreateNestedManyWithoutAttendedDesignReviewsInput
//     userDeleted?: UserCreateNestedOneWithoutDeletedDesignReviewsInput
//     wbsElement: WBS_ElementCreateNestedOneWithoutDesignReviewsInput