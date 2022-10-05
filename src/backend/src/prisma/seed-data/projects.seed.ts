/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WBS_Element_Status } from '@prisma/client';

const dbSeedProject1: any = {
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 0,
    dateCreated: new Date('08/01/20'),
    name: 'Impact Attenuator',
    status: WBS_Element_Status.ACTIVE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  projectFields: {
    summary: 'Develop rules-compliant impact attenuator.',
    googleDriveFolderLink: 'https://youtu.be/dQw4w9WgXcQ',
    taskListLink: 'https://youtu.be/dQw4w9WgXcQ',
    slideDeckLink: 'https://youtu.be/dQw4w9WgXcQ',
    bomLink: 'https://youtu.be/dQw4w9WgXcQ',
    budget: 124,
    rules: ['EV3.5.2']
  },
  goals: [
    {
      detail: 'Decrease size by 90% from 247 cubic inches to 24.7 cubic inches',
      dateAdded: new Date('05/26/21')
    }
  ],
  features: [
    {
      detail: 'Capable of absorbing 5000N in a head-on collision',
      dateAdded: new Date('05/26/21')
    }
  ],
  otherConstraints: [
    {
      detail: 'Cannot go further towards the rear of the car than the front roll hoop',
      dateAdded: new Date('05/27/21')
    }
  ]
};

const dbSeedProject2: any = {
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0,
    name: 'Bodywork',
    status: WBS_Element_Status.INACTIVE,
    projectLeadId: 3,
    projectManagerId: 4
  },
  projectFields: {
    summary: 'Develop rules-compliant bodywork.',
    googleDriveFolderLink: 'https://youtu.be/dQw4w9WgXcQ',
    taskListLink: 'https://youtu.be/dQw4w9WgXcQ',
    slideDeckLink: 'https://youtu.be/dQw4w9WgXcQ',
    bomLink: 'https://youtu.be/dQw4w9WgXcQ',
    budget: 50,
    rules: ['T12.3.2', 'T8.2.6']
  },
  goals: [
    {
      detail: 'Decrease weight by 90% from 4.8 pounds to 0.48 pounds',
      dateAdded: new Date('06/10/21')
    }
  ],
  features: [
    {
      detail: 'Provides removable section for easy access to the pedal box',
      dateAdded: new Date('06/11/21')
    }
  ],
  otherConstraints: [
    {
      detail: 'Compatible with a side-pod chassis design',
      dateAdded: new Date('06/12/21')
    }
  ]
};

const dbSeedProject3: any = {
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 12,
    workPackageNumber: 0,
    dateCreated: new Date('08/04/20'),
    name: 'Battery Box',
    status: WBS_Element_Status.ACTIVE,
    projectLeadId: 2,
    projectManagerId: 3
  },
  projectFields: {
    summary: 'Develop rules-compliant battery box.',
    googleDriveFolderLink: 'https://youtu.be/dQw4w9WgXcQ',
    taskListLink: 'https://youtu.be/dQw4w9WgXcQ',
    slideDeckLink: 'https://youtu.be/dQw4w9WgXcQ',
    bomLink: 'https://youtu.be/dQw4w9WgXcQ',
    budget: 5000,
    rules: ['EV3.5.2', 'EV1.4.7', 'EV6.3.10']
  },
  goals: [
    {
      detail: 'Decrease weight by 60% from 100 pounds to 40 pounds',
      dateAdded: new Date('08/02/21')
    }
  ],
  features: [
    {
      detail: 'Provides 50,000 Wh of energy discharge',
      dateAdded: new Date('08/01/21')
    }
  ],
  otherConstraints: [
    {
      detail: 'Maximum power consumption of 25 watts from the low voltage system',
      dateAdded: new Date('08/05/21')
    }
  ]
};

const dbSeedProject4: any = {
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 23,
    workPackageNumber: 0,
    dateCreated: new Date('11/07/20'),
    name: 'Motor Controller Integration',
    status: WBS_Element_Status.INACTIVE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  projectFields: {
    summary: 'Develop rules-compliant motor controller integration.',
    googleDriveFolderLink: 'https://youtu.be/dQw4w9WgXcQ',
    taskListLink: 'https://youtu.be/dQw4w9WgXcQ',
    slideDeckLink: 'https://youtu.be/dQw4w9WgXcQ',
    bomLink: 'https://youtu.be/dQw4w9WgXcQ',
    budget: 0,
    rules: []
  },
  goals: [
    {
      detail: 'Power consumption stays under 10 watts from the low voltage system',
      dateAdded: new Date('05/11/21')
    }
  ],
  features: [
    {
      detail: 'Capable of interfacing via I2C or comparable serial interface.',
      dateAdded: new Date('05/14/21')
    }
  ],
  otherConstraints: [
    {
      detail: 'Must be compatible with chain drive',
      dateAdded: new Date('05/12/21')
    }
  ]
};

const dbSeedProject5: any = {
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 25,
    workPackageNumber: 0,
    dateCreated: new Date('08/03/20'),
    name: 'Wiring Harness',
    status: WBS_Element_Status.COMPLETE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  projectFields: {
    summary: 'Develop rules-compliant wiring harness.',
    googleDriveFolderLink: 'https://youtu.be/dQw4w9WgXcQ',
    taskListLink: 'https://youtu.be/dQw4w9WgXcQ',
    slideDeckLink: 'https://youtu.be/dQw4w9WgXcQ',
    bomLink: 'https://youtu.be/dQw4w9WgXcQ',
    budget: 234,
    rules: ['EV3.5.2', 'T12.3.2', 'T8.2.6', 'EV1.4.7', 'EV6.3.10']
  },
  goals: [
    {
      detail: 'Decrease installed component costs by 63% from $2,700 to $1000',
      dateAdded: new Date('02/05/21')
    }
  ],
  features: [
    {
      detail: 'All wires are bundled and secured to the chassis at least every 6 inches',
      dateAdded: new Date('02/14/21')
    }
  ],
  otherConstraints: [
    {
      detail: 'Utilizes 8020 frame construction',
      dateAdded: new Date('02/16/21')
    }
  ]
};

export const dbSeedAllProjects: any[] = [
  dbSeedProject1,
  dbSeedProject2,
  dbSeedProject3,
  dbSeedProject4,
  dbSeedProject5
];
