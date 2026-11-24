/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useGetAllExecutiveSummaries, useGetNewMemberSignUpEvents } from '../hooks/exec-summaries.hooks';
import {
  buildNewMemberJourneyData,
  buildRecruitmentYoyMetrics,
  EXEC_SUMMARY_BACKGROUND,
  RecruitmentYoyMetrics,
  termLabelShort,
  termLabelSortKey
} from '../utils/exec-summary.utils';
import ErrorPage from '../pages/ErrorPage';
import LoadingIndicator from './LoadingIndicator';
import NewMemberJourneyChart from './NewMemberJourneyChart';
import NewMemberSignUps, { buildTermSignUps } from './NewMemberSignUps';
import SemesterlyMembership, { buildSemesterPoints } from './SemesterlyMembership';
import TermWindowSelector from './TermWindowSelector';

const VISIBLE_TERMS = 6;
const POSITIVE_COLOR = '#5aa454';
const NEGATIVE_COLOR = '#ef4345';

interface MetricProps {
  label: string;
  value?: string | number;
}

const Metric: React.FC<MetricProps> = ({ label, value }) => (
  <li>
    <Box component="span" fontWeight="bold">
      {label}:
    </Box>{' '}
    {value ?? 'N/A'}
  </li>
);

const GrowthMetric: React.FC<{ label: string; percent?: number }> = ({ label, percent }) => (
  <li>
    <Box component="span" fontWeight="bold">
      {label}:
    </Box>{' '}
    {percent === undefined ? (
      'N/A'
    ) : (
      <Box component="span" fontWeight="bold" color={percent >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}>
        {percent > 0 ? '+' : ''}
        {percent}%
      </Box>
    )}
  </li>
);

const KeyYoyMetrics: React.FC<{ metrics: RecruitmentYoyMetrics }> = ({ metrics }) => (
  <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', width: '100%' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="h5" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 2 }}>
        Key YoY Metrics
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 0.5 } }}>
        <Metric label="Best Recruitment Season By New Active Members" value={metrics.bestByNewActiveMembers} />
        <Metric label="Best Recruitment Season By Onboarded Members" value={metrics.bestByOnboarded} />
        <Metric label="Worst Recruitment Season By New Active Members" value={metrics.worstByNewActiveMembers} />
        <Metric label="Worst Recruitment Season By Onboarded Members" value={metrics.worstByOnboarded} />
        <Metric label="Average New Active Members Per Semester" value={metrics.averageNewActiveMembers} />
        <Metric label="Average Active Members Per Semester" value={metrics.averageActiveMembers} />
        <GrowthMetric label="YoY Recruitment Growth" percent={metrics.recruitmentGrowth} />
        <GrowthMetric label="YoY Active New Member Growth" percent={metrics.newActiveMemberGrowth} />
        <GrowthMetric label="YoY Active Member Growth" percent={metrics.activeMemberGrowth} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Recruitment & membership overlay: the new member journey, sign-ups and semesterly membership graphs plus the
 * Key YoY Metrics, all filtered to the same window of consecutive terms.
 */
const RecruitmentMembershipOverlay: React.FC = () => {
  // index of the first term in the window; undefined means "show the newest terms"
  const [windowStart, setWindowStart] = useState<number | undefined>(undefined);
  const {
    data: allSummaries,
    isLoading: summariesIsLoading,
    isError: summariesIsError,
    error: summariesError
  } = useGetAllExecutiveSummaries();
  const {
    data: signUpEvents,
    isLoading: signUpsIsLoading,
    isError: signUpsIsError,
    error: signUpsError
  } = useGetNewMemberSignUpEvents();

  if (summariesIsError) return <ErrorPage message={summariesError?.message} />;
  if (signUpsIsError) return <ErrorPage message={signUpsError?.message} />;
  if (summariesIsLoading || signUpsIsLoading || !allSummaries || !signUpEvents) return <LoadingIndicator />;

  const summaries = allSummaries.filter((summary) => !summary.dateDeleted);
  const journeyPoints = buildNewMemberJourneyData(summaries);
  const semesterPoints = buildSemesterPoints(summaries);
  const signUpTerms = buildTermSignUps(signUpEvents);

  // every term any of the three graphs has data for, oldest first
  const allTermLabels = [
    ...new Set([
      ...journeyPoints.map((p) => p.label),
      ...semesterPoints.map((p) => p.label),
      ...signUpTerms.map((t) => t.label)
    ])
  ].sort((a, b) => termLabelSortKey(a) - termLabelSortKey(b));

  const maxStart = Math.max(0, allTermLabels.length - VISIBLE_TERMS);
  const start = Math.min(windowStart ?? maxStart, maxStart);
  const termLabels = allTermLabels.slice(start, start + VISIBLE_TERMS);

  const metrics = buildRecruitmentYoyMetrics(
    journeyPoints,
    semesterPoints.map((point) => ({
      label: point.label,
      total: Object.values(point.counts).reduce((sum, count) => sum + count, 0)
    })),
    termLabels
  );

  if (allTermLabels.length === 0)
    return (
      <Typography textAlign="center" mt={4}>
        No recruitment or membership data found.
      </Typography>
    );

  return (
    <Box sx={{ backgroundColor: EXEC_SUMMARY_BACKGROUND, color: 'white', borderRadius: 5, p: 2 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TermWindowSelector
          terms={allTermLabels.map((label) => ({ key: label, shortLabel: termLabelShort(label) }))}
          start={start}
          visibleCount={VISIBLE_TERMS}
          onChange={setWindowStart}
        />
      </Box>
      <Box display="grid" gap={2} gridTemplateColumns={{ xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }}>
        <NewMemberJourneyChart executiveSummaries={summaries} termLabels={termLabels} />
        <NewMemberSignUps events={signUpEvents} termLabels={termLabels} />
        <SemesterlyMembership executiveSummaries={summaries} termLabels={termLabels} />
        <KeyYoyMetrics metrics={metrics} />
      </Box>
    </Box>
  );
};

export default RecruitmentMembershipOverlay;
