/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { Competition, CompetitionPerformance, isAdmin } from 'shared';
import { useCurrentUser } from '../hooks/users.hooks';
import NERSuccessButton from './NERSuccessButton';
import NERFailButton from './NERFailButton';

interface CompetitionPerformanceProps {
  competitionPerformances: CompetitionPerformance[];
}

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

interface CompetitionPerformanceForm {
  finalPlace: string;
  totalPointsEarned: string;
  maxPoints: string;
  bestStaticEvent: string;
  worstStaticEvent: string;
  bestDynamicEvent: string;
  worstDynamicEvent: string;
  accelerationTopTime: string;
  enduranceLapsCompleted: string;
  maxLaps: string;
  autocrossTopTime: string;
  enduranceAvgLapTime: string;
}

const numberToInput = (value?: number): string => (value === undefined ? '' : `${value}`);
const timeToInput = (seconds?: number): string => (seconds === undefined ? '' : formatTime(seconds));

const toFormValues = (performance: CompetitionPerformance): CompetitionPerformanceForm => ({
  finalPlace: numberToInput(performance.finalPlace),
  totalPointsEarned: numberToInput(performance.totalPointsEarned),
  maxPoints: numberToInput(performance.maxPoints),
  bestStaticEvent: performance.bestStaticEvent ?? '',
  worstStaticEvent: performance.worstStaticEvent ?? '',
  bestDynamicEvent: performance.bestDynamicEvent ?? '',
  worstDynamicEvent: performance.worstDynamicEvent ?? '',
  accelerationTopTime: timeToInput(performance.accelerationTopTimeSeconds),
  enduranceLapsCompleted: numberToInput(performance.enduranceLapsCompleted),
  maxLaps: numberToInput(performance.maxLaps),
  autocrossTopTime: timeToInput(performance.autocrossTopTimeSeconds),
  enduranceAvgLapTime: timeToInput(performance.enduranceAvgLapTimeSeconds)
});

const PillInput = styled(InputBase)({
  backgroundColor: '#3a3a3a',
  color: 'white',
  borderRadius: 8,
  padding: '0 10px',
  fontSize: 14,
  '& input': { padding: '4px 0', textAlign: 'center' }
});

interface UnderlinedLabelProps {
  label: string;
  value: string;
  editing?: boolean;
  inputValue?: string;
  onChange?: (value: string) => void;
}

const UnderlinedLabel: React.FC<UnderlinedLabelProps> = ({ label, value, editing = false, inputValue = '', onChange }) => (
  <Typography component="div" sx={{ mb: 1 }}>
    <Box component="span" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
      {label}
    </Box>
    {': '}
    {editing ? (
      <PillInput
        value={inputValue}
        onChange={(e) => onChange?.(e.target.value)}
        inputProps={{ 'aria-label': label }}
        sx={{ width: 120, verticalAlign: 'middle' }}
      />
    ) : (
      value
    )}
  </Typography>
);

interface StatBlockProps {
  value: string;
  label: string;
  editingContent?: React.ReactNode;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label, editingContent }) => (
  <Box textAlign="center">
    {editingContent ?? (
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    )}
    <Typography variant="body2">{label}</Typography>
  </Box>
);

interface PointsRingProps {
  earned: number;
  max: number;
  maxContent?: React.ReactNode;
}

// TODO: this is a simple two-tone ring (earned vs. remaining). The mock shows a segmented
// ring broken out by event category, which would need per-category point data we don't have.
const PointsRing: React.FC<PointsRingProps> = ({ earned, max, maxContent }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? Math.min(earned / max, 1) : 0;
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
        <Typography component="div" textAlign="center" fontSize={14}>
          {earned}
          <br />
          <Box component="div" sx={{ borderTop: '1px solid white', display: 'inline-block', pt: 0.3 }}>
            {maxContent ?? max}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

const CompetitionPerformanceSection: React.FC<CompetitionPerformanceProps> = ({ competitionPerformances }) => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CompetitionPerformanceForm | null>(null);
  const user = useCurrentUser();
  const canEdit = isAdmin(user.role);

  const selectedCompetition = COMPETITIONS[tabValue];
  const performance = competitionPerformances.find((cp) => cp.competition === selectedCompetition);

  const startEditing = () => {
    if (!performance) return;
    setForm(toFormValues(performance));
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => setIsEditing(false);

  const updateField = (key: keyof CompetitionPerformanceForm) => (value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const labelEditProps = (key: keyof CompetitionPerformanceForm) => ({
    editing: isEditing,
    inputValue: form?.[key] ?? '',
    onChange: updateField(key)
  });

  const statInput = (key: keyof CompetitionPerformanceForm, label: string, width = 90) => (
    <PillInput
      value={form?.[key] ?? ''}
      onChange={(e) => updateField(key)(e.target.value)}
      inputProps={{ 'aria-label': label }}
      sx={{ width, height: 36, mb: 0.5 }}
    />
  );

  //NOTE: Width and height are currently hardcoded to emulate the full mock executive panel
  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 0, width: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <Typography variant="h5" fontWeight="bold">
            Competition Performance
          </Typography>
          {canEdit && performance && !isEditing && (
            <IconButton
              aria-label="Edit competition performance"
              onClick={startEditing}
              size="small"
              sx={{ color: 'white' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

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
            <Tab label={competition} value={idx} key={competition} disabled={isEditing} />
          ))}
        </Tabs>

        {!performance ? (
          <Typography>No data available for {selectedCompetition}.</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 220px" maxWidth={300}>
              <Box
                sx={{
                  backgroundColor: '#ef4345',
                  borderRadius: 3,
                  p: 2,
                  mb: 2
                }}
              >
                <UnderlinedLabel
                  label="Final Place"
                  value={formatOrdinal(performance.finalPlace)}
                  {...labelEditProps('finalPlace')}
                />
                <UnderlinedLabel
                  label="Total Points Earned"
                  value={`${performance.totalPointsEarned ?? 'N/A'}`}
                  {...labelEditProps('totalPointsEarned')}
                />
              </Box>

              <UnderlinedLabel
                label="Best Static Event"
                value={performance.bestStaticEvent ?? 'N/A'}
                {...labelEditProps('bestStaticEvent')}
              />
              <UnderlinedLabel
                label="Worst Static Event"
                value={performance.worstStaticEvent ?? 'N/A'}
                {...labelEditProps('worstStaticEvent')}
              />
              <UnderlinedLabel
                label="Best Dynamic Event"
                value={performance.bestDynamicEvent ?? 'N/A'}
                {...labelEditProps('bestDynamicEvent')}
              />
              <UnderlinedLabel
                label="Worst Dynamic Event"
                value={performance.worstDynamicEvent ?? 'N/A'}
                {...labelEditProps('worstDynamicEvent')}
              />
            </Box>

            {(isEditing || (performance.totalPointsEarned !== undefined && performance.maxPoints !== undefined)) && (
              <Box flex="1 1 140px" display="flex" justifyContent="center" alignItems="flex-start">
                <PointsRing
                  earned={isEditing ? Number(form?.totalPointsEarned) || 0 : (performance.totalPointsEarned ?? 0)}
                  max={isEditing ? Number(form?.maxPoints) || 0 : (performance.maxPoints ?? 0)}
                  maxContent={isEditing ? statInput('maxPoints', 'Max Points', 50) : undefined}
                />
              </Box>
            )}

            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3} width="100%">
              <Box flexBasis="45%">
                <StatBlock
                  value={formatTime(performance.accelerationTopTimeSeconds)}
                  label="Acceleration Top Time"
                  editingContent={isEditing ? statInput('accelerationTopTime', 'Acceleration Top Time') : undefined}
                />
              </Box>
              {(isEditing || (performance.enduranceLapsCompleted !== undefined && performance.maxLaps !== undefined)) && (
                <Box flexBasis="45%">
                  <StatBlock
                    value={`${performance.enduranceLapsCompleted}/${performance.maxLaps}`}
                    label="Endurance Laps Completed"
                    editingContent={
                      isEditing ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          {statInput('enduranceLapsCompleted', 'Endurance Laps Completed', 50)}
                          <Typography>/</Typography>
                          {statInput('maxLaps', 'Max Laps', 50)}
                        </Box>
                      ) : undefined
                    }
                  />
                </Box>
              )}
              <Box flexBasis="45%">
                <StatBlock
                  value={formatTime(performance.autocrossTopTimeSeconds)}
                  label="Autocross Top Time"
                  editingContent={isEditing ? statInput('autocrossTopTime', 'Autocross Top Time') : undefined}
                />
              </Box>
              <Box flexBasis="45%">
                <StatBlock
                  value={formatTime(performance.enduranceAvgLapTimeSeconds)}
                  label="Endurance Average Lap Time"
                  editingContent={isEditing ? statInput('enduranceAvgLapTime', 'Endurance Average Lap Time') : undefined}
                />
              </Box>
            </Box>
          </Box>
        )}

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <NERFailButton onClick={handleCancel}>Cancel</NERFailButton>
            <NERSuccessButton onClick={handleSave}>Save</NERSuccessButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitionPerformanceSection;
