import { CompetitionDocumentsSummary, ExecutiveSummary } from 'shared';

/**
 * Transforms a competition documents summary received from the API so that its
 * date string field is converted into a Date object.
 *
 * @param competitionDocumentsSummary The competition documents summary with dates as strings.
 * @returns The competition documents summary with `dateSynced` as a Date (or undefined if not set).
 */
const competitionDocumentsSummaryTransformer = (
  competitionDocumentsSummary: CompetitionDocumentsSummary
): CompetitionDocumentsSummary => {
  return {
    ...competitionDocumentsSummary,
    dateSynced: competitionDocumentsSummary.dateSynced ? new Date(competitionDocumentsSummary.dateSynced) : undefined
  };
};

/**
 * Transforms an executive summary received from the API so that its date string
 * fields are converted into Date objects, including those of the nested
 * competition documents summary.
 *
 * @param executiveSummary The executive summary with dates as strings.
 * @returns The executive summary with `seasonStartDate`, `seasonEndDate`, `dateCreated`,
 * and `dateDeleted` as Dates (optional ones are undefined if not set), and the nested
 * competition documents summary transformed as well.
 */
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
