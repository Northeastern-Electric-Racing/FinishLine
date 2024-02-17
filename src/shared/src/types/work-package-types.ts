/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export enum TimelineStatus {
  Ahead = 'AHEAD',
  OnTrack = 'ON_TRACK',
  Behind = 'BEHIND',
  VeryBehind = 'VERY_BEHIND'
}

export enum WorkPackageStage {
  Research = 'RESEARCH',
  Design = 'DESIGN',
  Manufacturing = 'MANUFACTURING',
  Install = 'INSTALL',
  Testing = 'TESTING'
}
