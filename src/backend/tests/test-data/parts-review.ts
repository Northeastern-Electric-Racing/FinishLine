import { CreatePartTag, CreateCommonMistake, CreatePartReviewFAQ, createTestUser } from "../test-utils";
import { supermanAdmin } from "./users.test-data";
import { Part, User } from '@prisma/client';

export const partTag1 = CreatePartTag(
    [],
    'tag1',
    '1',
    '#000000',
);

export const partTag2 = CreatePartTag(
    [],
    "tag2",
    '2',
    '#696969',
);

export const CreateCommonMistake1 = CreateCommonMistake (
    //  title: string,
    //  description: string,
    //  starred: boolean,
    //  user: User,
    //  organizationId: string

    "title1",
    "description1",
    false,
    ,
    "4"
)

export const CreateCommonMistake2 = CreateCommonMistake (
    //  title: string,
    //  description: string,
    //  starred: boolean,
    //  user: User,
    //  organizationId: string

    "title2",
    "description2",
    false,
    supermanAdmin,
    "4"
)

export const CreatePartReviewFAQ1 = CreatePartReviewFAQ (

)
