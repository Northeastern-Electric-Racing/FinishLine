/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * Response types for the MCP API, which is consumed by an LLM rather than by the FinishLine client.
 *
 * These are deliberately flat and lossy: users collapse to their id and a single "First Last" name,
 * other relations collapse to names, and nothing is included unless a chat bot would plausibly need
 * it. Response size is a real cost here, so prefer dropping a field over including it "just in case".
 */

/** A person, reduced to what a model needs to name them and to pass them back to a write tool. */
export interface McpUser {
  userId: string;
  name: string;
}

export interface McpProjectSummary {
  wbsNum: string;
  name: string;
  summary: string;
  viewOnFinishline: string;
}

export interface McpProjectList {
  /** the car these projects belong to, resolved to the newest car when the caller did not specify */
  carNumber: number;
  projects: McpProjectSummary[];
  /** how many projects the car has in total, so the caller knows whether it has them all */
  total: number;
  /** the offset to request for the next page, absent when this page is the last one */
  nextOffset?: number;
}

export interface McpLink {
  type: string;
  url: string;
}

export interface McpProjectDetail {
  wbsNum: string;
  name: string;
  summary: string;
  status: string;
  budget: number;
  lead?: McpUser;
  manager?: McpUser;
  teams: string[];
  links: McpLink[];
  startDate?: Date;
  endDate?: Date;
  workPackageCount: number;
  viewOnFinishline: string;
}

export interface McpDescriptionBulletGroup {
  type: string;
  details: string[];
}

export interface McpWorkPackage {
  wbsNum: string;
  name: string;
  status: string;
  stage?: string;
  startDate: Date;
  endDate: Date;
  durationWeeks: number;
  lead?: McpUser;
  manager?: McpUser;
  descriptionBullets: McpDescriptionBulletGroup[];
  blockedBy: string[];
  viewOnFinishline: string;
}

export interface McpTask {
  taskId: string;
  title: string;
  notes: string;
  status: string;
  priority: string;
  startDate?: Date;
  deadline?: Date;
  assignees: McpUser[];
  labels: string[];
  createdBy: McpUser;
  parentWbsNum: string;
  parentName: string;
  viewOnFinishline: string;
}

export interface McpTaskList {
  tasks: McpTask[];
  /** how many tasks the project has in total, so the caller knows whether it has them all */
  total: number;
  /** the offset to request for the next page, absent when this page is the last one */
  nextOffset?: number;
}

/** A project named just well enough for the model to pass its wbsNum to another tool. */
export interface McpProjectRef {
  wbsNum: string;
  name: string;
}

/** A team the current user is on, with the projects that membership lets them create tasks on. */
export interface McpCurrentUserTeam {
  teamName: string;
  /** whether the user heads, leads, or is a member of the team */
  position: 'HEAD' | 'LEAD' | 'MEMBER';
  /** the team's projects on the newest car */
  projects: McpProjectRef[];
}

/** The user an MCP connection acts as, and what that lets the write tools do. */
export interface McpCurrentUser {
  userId: string;
  name: string;
  /** the user's role in the organization, such as MEMBER, HEAD, or ADMIN */
  role?: string;
  /** heads and admins can create and update any task, not only ones on their teams' projects or that they created */
  canManageAllTasks: boolean;
  /** the car the teams' projects are listed for */
  carNumber: number;
  teams: McpCurrentUserTeam[];
}

/** One of a project's teams, with everyone who can be assigned the project's tasks. */
export interface McpProjectTeam {
  teamName: string;
  head: McpUser;
  leads: McpUser[];
  members: McpUser[];
}

export interface McpEventTime {
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

export interface McpEvent {
  eventId: string;
  title: string;
  description?: string;
  location?: string;
  zoomLink?: string;
  status: string;
  eventType: string;
  calendars: string[];
  times: McpEventTime[];
  recurring: boolean;
  teams: string[];
  viewOnFinishline: string;
}
