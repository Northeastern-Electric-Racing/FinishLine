import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { ExecutiveSummary, Term } from 'shared';
import { displayEnum } from '../utils/pipes';

interface SemesterlyMembershipProps {
  executiveSummaries: ExecutiveSummary[];
}

const BACKGROUND = '#121212';
const ACCENT = '#ef4345';

// first four match the mock (mechanical, electrical, software, business); the rest cover any extra divisions
const DIVISION_COLORS = ['#e0301e', '#4a6aab', '#9b4dea', '#5aa454', '#e69f00', '#00a6a6', '#d6619b', '#b3b3b3'];

interface SemesterPoint {
  label: string;
  sortKey: number;
  // total members (new + returning) keyed by division name
  counts: Record<string, number>;
}

/**
 * Turns every executive summary's recruitment cycles into one point per semester.
 * A season runs fall -> spring, so fall belongs to the season start year and spring to the end year.
 */
export const buildSemesterPoints = (executiveSummaries: ExecutiveSummary[]): SemesterPoint[] => {
  const points = new Map<string, SemesterPoint>();
  executiveSummaries.forEach((summary) => {
    const start = summary.seasonStartDate ? new Date(summary.seasonStartDate).getFullYear() : undefined;
    const end = summary.seasonEndDate ? new Date(summary.seasonEndDate).getFullYear() : undefined;
    summary.recruitmentCycles.forEach((cycle) => {
      const year =
        cycle.term === Term.FALL
          ? (start ?? (end !== undefined ? end - 1 : undefined))
          : (end ?? (start !== undefined ? start + 1 : undefined));
      // without season dates there is no way to place the semester on the time axis
      if (year === undefined) return;

      const label = `${displayEnum(cycle.term)} ${year}`;
      const point = points.get(label) ?? {
        label,
        // spring comes before fall within the same calendar year
        sortKey: year * 2 + (cycle.term === Term.FALL ? 1 : 0),
        counts: {}
      };
      cycle.divisionCounts.forEach((divisionCount) => {
        const { name } = divisionCount.teamType;
        point.counts[name] =
          (point.counts[name] ?? 0) + (divisionCount.newMembers ?? 0) + (divisionCount.returningMembers ?? 0);
      });
      points.set(label, point);
    });
  });
  return [...points.values()].sort((a, b) => a.sortKey - b.sortKey);
};

const MembershipTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box sx={{ backgroundColor: ACCENT, color: 'white', borderRadius: 1, px: 1.5, py: 1, position: 'relative', top: -8 }}>
      <Typography fontWeight="bold" lineHeight={1.2}>
        {label}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, columnCount: payload.length > 3 ? 2 : 1, fontSize: '0.8rem' }}>
        {payload.map((entry) => (
          <li key={entry.dataKey as string}>
            {entry.name}: {entry.value}
          </li>
        ))}
      </Box>
    </Box>
  );
};

const SemesterlyMembership: React.FC<SemesterlyMembershipProps> = ({ executiveSummaries }) => {
  const points = buildSemesterPoints(executiveSummaries);
  const divisions = [...new Set(points.flatMap((point) => Object.keys(point.counts)))].sort();
  const chartData = points.map((point) => ({ name: point.label, ...point.counts }));

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: BACKGROUND, color: 'white', width: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h5" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 1 }}>
          Semesterly Membership
        </Typography>

        {chartData.length === 0 || divisions.length === 0 ? (
          <Typography textAlign="center">No membership data available.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#4a4a4a" vertical={false} />
              <XAxis dataKey="name" stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
              <YAxis stroke="white" tick={{ fill: 'white', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={<MembershipTooltip />}
                cursor={{ stroke: ACCENT, strokeWidth: 2 }}
                position={{ y: -10 }}
                isAnimationActive={false}
              />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ color: 'white', top: 0 }} iconType="square" />
              {divisions.map((division, idx) => {
                const color = DIVISION_COLORS[idx % DIVISION_COLORS.length];
                return (
                  <Line
                    key={division}
                    type="linear"
                    dataKey={division}
                    name={division}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={{ r: 8, fill: color, stroke: color }}
                    activeDot={{ r: 8, fill: color, stroke: color }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SemesterlyMembership;
