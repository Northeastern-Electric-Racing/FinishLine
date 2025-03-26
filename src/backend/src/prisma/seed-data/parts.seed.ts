/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import type { Prisma } from '@prisma/client';

const basicPart = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 1,
      commonName: 'Basic Part',
      description: 'Basic part with all fields populated',
      previewImageLink: 'https://NER.com/basicpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};

const partWithoutDescription = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 2,
      commonName: 'Part without description',
      previewImageLink: 'https://NER.com/partwithoutdes.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};

const partWithoutImage = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 3,
      commonName: 'Part without image',
      description: 'Part without image but with everything else',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partWithEmptyHistory = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 4,
      commonName: 'Part with empty history',
      description: 'Basic part but with empty history',
      previewImageLink: 'https://NER.com/partemptyhistory.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partWithLongName = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 5,
      commonName: 'ThisPartHasANameThatIsWayTooLongAndMightCauseProblemsWithVisibilityOnTheWebsiteMaybeIDK',
      description: 'part with super long name',
      previewImageLink: 'https://NER.com/partwithlongname.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partIndexNegative = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: -1,
      commonName: 'Part with negative index',
      description: 'This parts index is negative',
      previewImageLink: 'https://NER.com/negativeindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partIndexZero = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 0,
      commonName: 'Part with index 0',
      description: 'This parts index is 0',
      previewImageLink: 'https://NER.com/zeroindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partIndexLarge = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 99999999,
      commonName: 'Part with very large index',
      description: 'This part index is very large',
      previewImageLink: 'https://NER.com/largeindexpart.jpg',
      status: 'IN_PROGRESS',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partReadyForReview = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 9,
      commonName: 'Part with READY_FOR_REVIEW status',
      description: 'This part is ready for review',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'READY_FOR_REVIEW',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partInReview = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 10,
      commonName: 'Part with IN_REVIEW status',
      description: 'This part is in review',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'IN_REVIEW',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partReviewed = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 11,
      commonName: 'Part with REVIEWED status',
      description: 'This part is reviewed.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'REVIEWED',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partApproved = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 12,
      commonName: 'Part with APPROVED status',
      description: 'This part is approved.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partCurrentDate = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 13,
      commonName: 'Part with current date',
      description: 'This part has the current date.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date(),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partPastDate = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 14,
      commonName: 'Part with past date',
      description: 'This part is old.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2000-01-01T00:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partUnixEpochDate = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 15,
      commonName: 'Part with date of Unix Epoch',
      description: 'This part is was made at the unix epoch.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('1970-01-01T00:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partFutureDate = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 16,
      commonName: 'Part with date of future',
      description: 'This part is was made in the future.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2100-12-31T23:59:59Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
      }
    }
  };
};
const partLeapYearDate = (projectId: string, userCreatedId: string, assigneeIds: string[]): Prisma.PartCreateArgs => {
  return {
    data: {
      index: 17,
      commonName: 'Part with date with a leap year',
      description: 'This part is was during a leap year.',
      previewImageLink: 'https://NER.com/testimage.jpg',
      status: 'APPROVED',
      createdAt: new Date('2024-02-29T12:00:00Z'),
      project: {
        connect: { projectId }
      },
      userCreated: {
        connect: { userId: userCreatedId }
      },
      assignees: {
        connect: assigneeIds.map((userId) => ({ userId }))
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

export const MechanicalPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '001',
      name: 'Mechanical',
      colorHexCode: '#283922',
      dateCreated: new Date(),
      organizationId
    }
  };
};

export const ElectricalPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '002',
      name: 'Electrical',
      colorHexCode: '#278923',
      dateCreated: new Date('2025-01-01T00:00:00Z'),
      organizationId
    }
  };
};

export const StructuralPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '003',
      name: 'Structural',
      colorHexCode: '#A133FF',
      dateCreated: new Date(),
      organizationId
    }
  };
};

export const dbSeedAllPartTags = { MechanicalPartTag, ElectricalPartTag, StructuralPartTag };
