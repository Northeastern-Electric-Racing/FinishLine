/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Car, WbsElementStatus } from 'shared';

export const exampleCar1: Car = {
  wbsElementId: 'wbs-element-1',
  id: 'car-1',
  name: 'Car 2023',
  wbsNum: {
    carNumber: 23,
    projectNumber: 0,
    workPackageNumber: 0
  },
  dateCreated: new Date('2023-01-01'),
  deleted: false,
  status: WbsElementStatus.Active,
  links: [],
  changes: [],
  descriptionBullets: []
};

export const exampleCar2: Car = {
  wbsElementId: 'wbs-element-2',
  id: 'car-2',
  name: 'Car 2024',
  wbsNum: {
    carNumber: 24,
    projectNumber: 0,
    workPackageNumber: 0
  },
  dateCreated: new Date('2024-01-01'),
  deleted: false,
  status: WbsElementStatus.Active,
  links: [],
  changes: [],
  descriptionBullets: []
};

export const exampleCar3: Car = {
  wbsElementId: 'wbs-element-3',
  id: 'car-3',
  name: 'Car 2025',
  wbsNum: {
    carNumber: 25,
    projectNumber: 0,
    workPackageNumber: 0
  },
  dateCreated: new Date('2025-01-01'),
  deleted: false,
  status: WbsElementStatus.Active,
  links: [],
  changes: [],
  descriptionBullets: []
};

export const exampleAllCars: Car[] = [exampleCar1, exampleCar2, exampleCar3];

export const exampleCurrentCar: Car = exampleCar3; // Latest car by car number

// Additional test data for global car filter
export const exampleEmptyCarArray: Car[] = [];

export const exampleSingleCar: Car[] = [exampleCar3];
