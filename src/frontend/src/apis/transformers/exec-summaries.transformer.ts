import { CompetitionDocumentsSummary, ExecutiveSummary } from 'shared';

const competitionDocumentsSummaryTransformer = (
  competitionDocumentsSummary: CompetitionDocumentsSummary
): CompetitionDocumentsSummary => {
  return {
    ...competitionDocumentsSummary,
    dateSynced: competitionDocumentsSummary.dateSynced ? new Date(competitionDocumentsSummary.dateSynced) : undefined
  };
};

export const executiveSummaryTransformer = (executiveSummary: ExecutiveSummary): ExecutiveSummary => {
  return {
    ...executiveSummary,
    seasonStartDate: executiveSummary.seasonStartDate ? new Date(executiveSummary.seasonStartDate) : undefined,
    seasonEndDate: executiveSummary.seasonEndDate ? new Date(executiveSummary.seasonEndDate) : undefined,
    dateCreated: new Date(executiveSummary.dateCreated),
    dateDeleted: executiveSummary.dateDeleted ? new Date(executiveSummary.dateDeleted) : undefined,
    competitionDocumentsSummary: executiveSummary.competitionDocumentsSummary
      ? competitionDocumentsSummaryTransformer(executiveSummary.competitionDocumentsSummary)
      : undefined
  };
};
