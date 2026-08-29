/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * Response types for the MCP API, which is consumed by an LLM rather than by the FinishLine client.
 *
 * These are deliberately flat and lossy: users collapse to a single "First Last" string, relations
 * collapse to names, and nothing is included unless a chat bot would plausibly need it. Response
 * size is a real cost here, so prefer dropping a field over including it "just in case".
 */

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
  lead?: string;
  manager?: string;
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
  lead?: string;
  manager?: string;
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
  assignees: string[];
  labels: string[];
  createdBy: string;
  parentWbsNum: string;
  parentName: string;
  viewOnFinishline: string;
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
