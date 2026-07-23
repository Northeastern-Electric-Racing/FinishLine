/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber } from './project-types.js';

/**
 * Slim ("for dropdown") shapes. These are intentionally minimal: id + display name + just enough
 * context to render and disambiguate an item in a dropdown. They are served by dedicated `/slim`
 * endpoints so callers don't pull the full, deeply-nested objects just to populate a select.
 */

export interface SlimCar {
  id: string;
  name: string;
  wbsNum: WbsNumber;
}

export interface SlimProject {
  id: string;
  name: string;
  wbsNum: WbsNumber;
  carNumber: number;
}

export interface SlimWorkPackage {
  id: string;
  name: string;
  wbsNum: WbsNumber;
  projectName: string;
}

export interface SlimUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SlimTeam {
  teamId: string;
  name: string;
}
