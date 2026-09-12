import { GraphData } from './statistics-types.js';
import { TeamType } from './calendar-types.js';
import { TeamPreview } from './team-types.js';
import { User } from './user-types.js';

export enum Competition {
  FSAE = 'FSAE',
  FHE = 'FHE'
}

export enum Term {
  FALL = 'FALL',
  SPRING = 'SPRING'
}

export enum DataSource {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export interface ExecutiveSummary {
  executiveSummaryId: string;
  seasonName: string;
  seasonStartDate: Date;
  seasonEndDate: Date;
  goals: string;
  winsAndImprovements: string;
  budgetNotes: string;
  recruitmentNotes: string;
  dateCreated: Date;
  userCreated: User;
  dateDeleted?: Date;
  deletedBy?: User;
  competitionPerformances: CompetitionPerformance[];
  competitionDocumentsSummary?: CompetitionDocumentsSummary;
  recruitmentCycles: RecruitmentCycle[];
}

export interface CompetitionPerformance {
  competitionPerformanceId: string;
  executiveSummaryId: string;
  competition: Competition;
  finalPlace?: number;
  totalPointsEarned?: number;
  bestStaticEvent?: string;
  worstStaticEvent?: string;
  bestDynamicEvent?: string;
  worstDynamicEvent?: string;
  accelerationTopTimeSeconds?: number;
  autocrossTopTimeSeconds?: number;
  enduranceLapsCompleted?: number;
  enduranceAvgLapTimeSeconds?: number;
}

export interface CompetitionDocumentsSummary {
  competitionDocumentsSummaryId: string;
  executiveSummaryId: string;
  submittedOnTimeCount: number;
  firstSubmissionRejectedCount: number;
  source: DataSource;
  dateSynced?: Date;
}

export interface RecruitmentCycle {
  recruitmentCycleId: string;
  executiveSummaryId: string;
  term: Term;
  eventsHeld: number;
  signUps: number;
  onboarded: number;
  activeMembers: number;
  divisionCounts: RecruitmentDivisionCount[];
}

export interface RecruitmentDivisionCount {
  recruitmentDivisionCountId: string;
  recruitmentCycleId: string;
  teamType: TeamType;
  newMembers: number;
  returningMembers: number;
}

export interface CreateExecutiveSummaryArgs {
  seasonName: string;
  seasonStartDate: Date;
  seasonEndDate: Date;
  goals?: string;
  winsAndImprovements?: string;
  budgetNotes?: string;
  recruitmentNotes?: string;
}

export type EditExecutiveSummaryArgs = Omit<CreateExecutiveSummaryArgs, 'seasonName' | 'seasonStartDate' | 'seasonEndDate'>;

export interface CreateCompetitionPerformanceArgs {
  executiveSummaryId: string;
  competition: Competition;
  finalPlace?: number;
  totalPointsEarned?: number;
  bestStaticEvent?: string;
  worstStaticEvent?: string;
  bestDynamicEvent?: string;
  worstDynamicEvent?: string;
  accelerationTopTimeSeconds?: number;
  autocrossTopTimeSeconds?: number;
  enduranceLapsCompleted?: number;
  enduranceAvgLapTimeSeconds?: number;
}

export type EditCompetitionPerformanceArgs = Omit<CreateCompetitionPerformanceArgs, 'executiveSummaryId' | 'competition'>;

export interface CreateCompetitionDocumentsSummaryArgs {
  executiveSummaryId: string;
  submittedOnTimeCount: number;
  firstSubmissionRejectedCount: number;
  source?: DataSource;
  dateSynced?: Date;
}

export type EditCompetitionDocumentsSummaryArgs = Omit<CreateCompetitionDocumentsSummaryArgs, 'executiveSummaryId'>;

export interface RecruitmentDivisionCountArgs {
  teamTypeId: string;
  newMembers: number;
  returningMembers: number;
}

export interface CreateRecruitmentCycleArgs {
  executiveSummaryId: string;
  term: Term;
  eventsHeld: number;
  signUps: number;
  onboarded: number;
  activeMembers: number;
  divisionCounts: RecruitmentDivisionCountArgs[];
}

export type EditRecruitmentCycleArgs = Omit<CreateRecruitmentCycleArgs, 'executiveSummaryId' | 'term'>;

export interface VehicleDevelopmentProjectSummary {
  wbsElementId: string;
  name: string;
  team: TeamPreview;
  startDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
}

export interface VehicleDevelopmentSummary {
  executiveSummaryId: string;
  projects: VehicleDevelopmentProjectSummary[];
}

export interface BudgetSummary {
  executiveSummaryId: string;
  budgetByDivision: GraphData;
}
