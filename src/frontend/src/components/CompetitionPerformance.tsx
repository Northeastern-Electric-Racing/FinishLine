/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';

// TODO: fill in place holder
export type Competition = 'FSAE' | 'FHE';

export interface CompetitionPerformance {
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

interface CompetitionPerformanceProps {
  competitionPerformances: CompetitionPerformance[];
}

const PLACEHOLDER_MAX_POINTS = 650;
const PLACEHOLDER_MAX_ENDURANCE_LAPS = 40;

const COMPETITIONS: Competition[] = ['FSAE', 'FHE'];

const formatOrdinal = (place?: number): string => {
  if (place === undefined) return 'N/A';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const mod100 = place % 100;
  const suffix = suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0];
  return `${place}${suffix}`;
};

//placeholder converting seconds into min
const formatTime = (seconds?: number): string => {
  if (seconds === undefined) return 'N/A';
  if (seconds < 60) return seconds.toFixed(2);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface UnderlinedLabelProps {
  label: string;
  value: string;
}

const UnderlinedLabel: React.FC<UnderlinedLabelProps> = ({ label, value }) => (
  <Typography sx={{ mb: 1 }}>
    <Box component="span" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
      {label}
    </Box>
    {': '}
    {value}
  </Typography>
);

interface StatBlockProps {
  value: string;
  label: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label }) => (
  <Box textAlign="center">
    <Typography variant="h6" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2">{label}</Typography>
  </Box>
);

interface PointsRingProps {
  earned: number;
  max: number;
}

//placeholder
const PointsRing: React.FC<PointsRingProps> = ({ earned, max }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(earned / max, 1);
  const dashArray = `${circumference * fraction} ${circumference * (1 - fraction)}`;

  return (
    <Box position="relative" display="inline-flex">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={radius} fill="none" stroke="#3a3a3a" strokeWidth={16} />
        <circle
          cx={90}
          cy={90}
          r={radius}
          fill="none"
          stroke="#ef4345"
          strokeWidth={16}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
      </svg>
      <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <Typography textAlign="center">
          {earned}
          <br />
          <Box component="span" sx={{ borderTop: '1px solid white', display: 'inline-block', pt: 0.5 }}>
            {max}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

const CompetitionPerformance: React.FC<CompetitionPerformanceProps> = ({ competitionPerformances }) => {
  const [tabValue, setTabValue] = useState<number>(0);

  const selectedCompetition = COMPETITIONS[tabValue];
  const performance = competitionPerformances.find((cp) => cp.competition === selectedCompetition);

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h4" fontWeight="bold">
            Competition Performance
          </Typography>
          <EditIcon fontSize="small" />
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_event, newValue: number) => setTabValue(newValue)}
          aria-label="competition-performance-tabs"
          sx={{ mb: 2 }}
        >
          {COMPETITIONS.map((competition, idx) => (
            <Tab label={competition} value={idx} key={competition} />
          ))}
        </Tabs>

        {!performance ? (
          <Typography>No data available for {selectedCompetition}.</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 400px">
              <Box
                sx={{
                  backgroundColor: '#ef4345',
                  borderRadius: 3,
                  p: 2,
                  mb: 2
                }}
              >
                <UnderlinedLabel label="Final Place" value={formatOrdinal(performance.finalPlace)} />
                <UnderlinedLabel label="Total Points Earned" value={`${performance.totalPointsEarned ?? 'N/A'}`} />
              </Box>

              <UnderlinedLabel label="Best Static Event" value={performance.bestStaticEvent ?? 'N/A'} />
              <UnderlinedLabel label="Worst Static Event" value={performance.worstStaticEvent ?? 'N/A'} />
              <UnderlinedLabel label="Best Dynamic Event" value={performance.bestDynamicEvent ?? 'N/A'} />
              <UnderlinedLabel label="Worst Dynamic Event" value={performance.worstDynamicEvent ?? 'N/A'} />
            </Box>

            <Box flex="1 1 250px" display="flex" justifyContent="center" alignItems="flex-start">
              <PointsRing earned={performance.totalPointsEarned ?? 0} max={PLACEHOLDER_MAX_POINTS} />
            </Box>

            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={3}
              width="100%"
            >
              <StatBlock value={formatTime(performance.accelerationTopTimeSeconds)} label="Acceleration Top Time" />
              <StatBlock
                value={`${performance.enduranceLapsCompleted ?? 'N/A'}/${PLACEHOLDER_MAX_ENDURANCE_LAPS}`}
                label="Endurance Laps Completed"
              />
              <StatBlock value={formatTime(performance.autocrossTopTimeSeconds)} label="Autocross Top Time" />
              <StatBlock value={formatTime(performance.enduranceAvgLapTimeSeconds)} label="Endurance Average Lap Time" />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitionPerformance;