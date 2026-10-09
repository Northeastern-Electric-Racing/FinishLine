/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { RecruitmentCycle, Term } from 'shared';

interface RecruitmentMembershipProps {
  recruitmentCycles: RecruitmentCycle[];
}

const TERMS: Term[] = [Term.FALL, Term.SPRING];

const NEW_MEMBERS_COLOR = '#8e3c2d';
const RETURNING_MEMBERS_COLOR = '#ef4345';

interface StatBlockProps {
  value: string;
  label: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label }) => (
  <Box textAlign="center">
    <Typography variant="h5" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2" fontWeight="bold">
      {label}
    </Typography>
  </Box>
);

interface LegendSwatchProps {
  color: string;
  label: string;
}

const LegendSwatch: React.FC<LegendSwatchProps> = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box sx={{ width: 10, height: 10, backgroundColor: color }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

const RecruitmentMembership: React.FC<RecruitmentMembershipProps> = ({ recruitmentCycles }) => {
  const [tabValue, setTabValue] = useState<number>(0);

  const selectedTerm = TERMS[tabValue];
  const cycle = recruitmentCycles.find((c) => c.term === selectedTerm);

  const chartData =
    cycle?.divisionCounts.map((divisionCount) => ({
      name: divisionCount.teamType.name,
      newMembers: divisionCount.newMembers ?? 0,
      returningMembers: divisionCount.returningMembers ?? 0
    })) ?? [];

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 2, width: 700 }}>
      <CardContent>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
          Recruitment &amp; Membership
        </Typography>

        <Box display="flex" justifyContent="center" mb={2}>
          <Tabs
            value={tabValue}
            onChange={(_event, newValue: number) => setTabValue(newValue)}
            aria-label="recruitment-membership-term-tabs"
            sx={{
              '& .MuiTab-root': { color: 'white', fontWeight: 'bold' },
              '& .MuiTab-root.Mui-selected': { color: '#ef4345' },
              '& .MuiTabs-indicator': { backgroundColor: '#ef4345' }
            }}
          >
            {TERMS.map((term, idx) => (
              <Tab label={term.charAt(0) + term.slice(1).toLowerCase()} value={idx} key={term} />
            ))}
          </Tabs>
        </Box>

        {!cycle ? (
          <Typography textAlign="center">No recruitment data available for {selectedTerm}.</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={4}>
            <Box flex="0 0 220px">
              <Typography variant="h6" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 2 }}>
                Recruitment Stats
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" gap={4}>
                  <StatBlock value={`${cycle.eventsHeld ?? 0}`} label="Events" />
                  <StatBlock value={`${cycle.signUps ?? 0}`} label="Sign-Ups" />
                </Box>
                <Box display="flex" gap={4}>
                  <StatBlock value={`${cycle.onboarded ?? 0}`} label="Onboarded" />
                  <StatBlock value={`${cycle.activeMembers ?? 0}`} label="Active" />
                </Box>
              </Box>
            </Box>

            <Box flex="1 1 300px" minWidth={300}>
              <Typography variant="h6" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 1 }}>
                Total Active Members By Division
              </Typography>
              <Box display="flex" gap={2} mb={1}>
                <LegendSwatch color={NEW_MEMBERS_COLOR} label="New Members" />
                <LegendSwatch color={RETURNING_MEMBERS_COLOR} label="Returning Members" />
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
                  <XAxis dataKey="name" stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
                  <YAxis stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="returningMembers" stackId="division" fill={RETURNING_MEMBERS_COLOR} name="Returning Members" />
                  <Bar dataKey="newMembers" stackId="division" fill={NEW_MEMBERS_COLOR} name="New Members" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitmentMembership;