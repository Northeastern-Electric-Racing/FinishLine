/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExecutiveSummary } from 'shared';
import { buildNewMemberJourneyData } from '../utils/exec-summary.utils';

interface NewMemberJourneyChartProps {
  executiveSummaries: ExecutiveSummary[];
}

const SIGN_UPS_COLOR = '#ef4345';
const ONBOARDED_COLOR = '#4a7fc9';
const NEW_ACTIVE_MEMBERS_COLOR = '#8e44ec';

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { dataKey: string; value: number }[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const getValue = (key: string) => payload.find((entry) => entry.dataKey === key)?.value ?? 0;

  return (
    <Box
      sx={{
        backgroundColor: SIGN_UPS_COLOR,
        color: 'white',
        borderRadius: 2,
        p: 2,
        minWidth: 180
      }}
    >
      <Typography fontWeight="bold" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <li>Sign-Ups: {getValue('signUps')}</li>
        <li>Onboarded Members: {getValue('onboarded')}</li>
        <li>New Active Members: {getValue('newActiveMembers')}</li>
      </Box>
    </Box>
  );
};

const NewMemberJourneyChart: React.FC<NewMemberJourneyChartProps> = ({ executiveSummaries }) => {
  const data = buildNewMemberJourneyData(executiveSummaries);

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 2, width: 700 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 1 }}>
          New Member Journey Over Time
        </Typography>

        {data.length === 0 ? (
          <Typography textAlign="center">No recruitment data available.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
              <XAxis dataKey="label" stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
              <YAxis stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ color: 'white' }} />
              <Line type="linear" dataKey="signUps" name="Sign-Ups" stroke={SIGN_UPS_COLOR} strokeWidth={2} dot={{ r: 6 }} />
              <Line
                type="linear"
                dataKey="onboarded"
                name="Onboarded"
                stroke={ONBOARDED_COLOR}
                strokeWidth={2}
                dot={{ r: 6 }}
              />
              <Line
                type="linear"
                dataKey="newActiveMembers"
                name="New Active Members"
                stroke={NEW_ACTIVE_MEMBERS_COLOR}
                strokeWidth={2}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default NewMemberJourneyChart;