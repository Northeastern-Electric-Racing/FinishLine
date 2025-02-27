import type { Prisma } from '@prisma/client';

const basicPart = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 1,
      commonName: 'Basic Part',
      description: 'Basic part with all fields populated',
      previewImageLink: 'https://NER.com/basicpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part', 'Updated specs', 'Assigned to review', 'Reviewed part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};

const partWithoutDescription = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 2,
      commonName: 'Part without description',
      previewImageLink: 'https://NER.com/partwithoutdes.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};

const partWithoutImage = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 3,
      commonName: 'Part without image',
      description: 'Part without image but with everything else',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partWithEmptyHistory = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 4,
      commonName: 'Part with empty history',
      description: 'Basic part but with empty history',
      previewImageLink: 'https://NER.com/partemptyhistory.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: [],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partWithLongName = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 5,
      commonName: 'ThisPartHasANameThatIsWayTooLongAndMightCauseProblemsWithVisibilityOnTheWebsiteMaybeIDK',
      description: 'part with super long name',
      previewImageLink: 'https://NER.com/partwithlongname.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partIndexNegative = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: -1,
      commonName: 'Part with negative index',
      description: 'This parts index is negative',
      previewImageLink: 'https://NER.com/negativeindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partIndexZero = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 0,
      commonName: 'Part with index 0',
      description: 'This parts index is 0',
      previewImageLink: 'https://NER.com/zeroindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partIndexLarge = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 99999999,
      commonName: 'Part with very large index',
      description: 'This part index is very large',
      previewImageLink: 'https://NER.com/largeindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partReadyForReview = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 9,
      commonName: 'Part with READY_FOR_REVIEW status',
      description: 'This part is ready for review',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'READY_FOR_REVIEW',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part', 'Ready for Review'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partInReview = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 10,
      commonName: 'Part with IN_REVIEW status',
      description: 'This part is in review',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'IN_REVIEW',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partReviewed = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 11,
      commonName: 'Part with REVIEWED status',
      description: 'This part is reviewed.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'REVIEWED',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partApproved = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 12,
      commonName: 'Part with APPROVED status',
      description: 'This part is approved.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partCurrentDate = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 13,
      commonName: 'Part with current date',
      description: 'This part has the current date.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date(),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partPastDate = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 14,
      commonName: 'Part with past date',
      description: 'This part is old.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2000-01-01T00:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partUnixEpochDate = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 15,
      commonName: 'Part with date of Unix Epoch',
      description: 'This part is was made at the unix epoch.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('1970-01-01T00:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partFutureDate = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 16,
      commonName: 'Part with date of future',
      description: 'This part is was made in the future.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2100-12-31T23:59:59Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};
const partLeapYearDate = (projectId: string, userCreatedId: string): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 17,
      commonName: 'Part with date with a leap year',
      description: 'This part is was during a leap year.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2024-02-29T12:00:00Z'),
      history: ['Created part', 'Assigned for Review', 'In Review', 'Finished Reviewing', 'Approved'],
      projectId,
      userCreatedId,
      assignees: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      },
      reviewers: {
        connect: [{ userId: 'REPLACE_WITH_USER_ID' }] // to be replaced in seed.ts
      }
    }
  };
};

export const dbSeedAllParts = {
  basicPart,
  partWithoutDescription,
  partWithoutImage,
  partWithEmptyHistory,
  partWithLongName,
  partIndexNegative,
  partIndexZero,
  partIndexLarge,
  partReadyForReview,
  partInReview,
  partReviewed,
  partApproved,
  partCurrentDate,
  partPastDate,
  partUnixEpochDate,
  partFutureDate,
  partLeapYearDate
};
