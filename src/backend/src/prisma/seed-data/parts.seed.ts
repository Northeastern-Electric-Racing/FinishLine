/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Actual endpoint gets orgID from user, this is just to avoid foreign relation key error
export const getPartTags = (organizationId: string) => [
  {
    partTagId: '001',
    name: 'Mechanical',
    colorHexCode: '#283922',
    dateCreated: new Date(),
    dateDeleted: null,
    organizationId
  },
  {
    partTagId: '002',
    name: 'Electrical',
    colorHexCode: '#278923',
    dateCreated: new Date(),
    dateDeleted: null,
    organizationId
  },
  {
    partTagId: '003',
    name: 'Structural',
    colorHexCode: '#A133FF',
    dateCreated: new Date(),
    dateDeleted: null,
    organizationId
  }
];
