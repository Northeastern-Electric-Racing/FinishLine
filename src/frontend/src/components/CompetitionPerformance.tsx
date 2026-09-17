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
import { useState } from 'react';
import { Competition, CompetitionPerformance } from 'shared';

interface CompetitionPerformanceProps {
  competitionPerformances: CompetitionPerformance[];
}

// TODO: replace with real total possible values once schema is updated
const PLACEHOLDER_MAX_POINTS = 650;
const PLACEHOLDER_MAX_ENDURANCE_LAPS = 40;

const COMPETITIONS: Competition[] = [Competition.FSAE, Competition.FHE];

const formatOrdinal = (place?: number): string => {
  if (place === undefined) return 'N/A';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const mod100 = place % 100;
  const suffix = suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0];
  return `${place}${suffix}`;
};

// Formats a raw seconds value as m:ss (e.g. 112 -> "1:52"),
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

// TODO: placeholder ring, needs to be fixed once we have points per event data
const PointsRing: React.FC<PointsRingProps> = ({ earned, max }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(earned / max, 1);
  const dashArray = `${circumference * fraction} ${circumference * (1 - fraction)}`;

  return (
    <Box position="relative" display="inline-flex">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={radius} fill="none" stroke="#3a3a3a" strokeWidth={12} />
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill="none"
          stroke="#ef4345"
          strokeWidth={12}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography textAlign="center" fontSize={14}>
          {earned}
          <br />
          <Box component="span" sx={{ borderTop: '1px solid white', display: 'inline-block', pt: 0.3 }}>
            {max}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

const CompetitionPerformanceSection: React.FC<CompetitionPerformanceProps> = ({ competitionPerformances }) => {
  const [tabValue, setTabValue] = useState<number>(0);

  const selectedCompetition = COMPETITIONS[tabValue];
  const performance = competitionPerformances.find((cp) => cp.competition === selectedCompetition);

  //NOTE: Width  is currently hardcoded to emulate the full mock executive panel
  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 2, width: 500 }}>
      <CardContent>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Competition Performance
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_event, newValue: number) => setTabValue(newValue)}
          aria-label="competition-performance-tabs"
          sx={{
            mb: 2,
            '& .MuiTab-root': { color: 'white' },
            '& .MuiTab-root.Mui-selected': { color: '#ef4345' },
            '& .MuiTabs-indicator': { backgroundColor: '#ef4345' }
          }}
        >
          {COMPETITIONS.map((competition, idx) => (
            <Tab label={competition} value={idx} key={competition} />
          ))}
        </Tabs>

        {!performance ? (
          <Typography>No data available for {selectedCompetition}.</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="2 1 220px">
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

            <Box flex="1 1 140px" display="flex" justifyContent="center" alignItems="flex-start">
              <PointsRing earned={performance.totalPointsEarned ?? 0} max={PLACEHOLDER_MAX_POINTS} />
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} width="100%">
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

export default CompetitionPerformanceSection;
