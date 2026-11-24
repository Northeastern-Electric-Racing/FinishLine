import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NewMemberSignUpEvent, Term } from 'shared';
import { displayEnum } from '../utils/pipes';

interface NewMemberSignUpsProps {
  events: NewMemberSignUpEvent[];
  // only these terms (e.g. "Fall 2025") are shown
  termLabels: string[];
}

const SEGMENT_SHADES = ['#ef4345', '#d93a3c', '#e8595b', '#c53436'];
// Events from August onward belong to the fall term, earlier ones to the spring term.
const FALL_START_MONTH = 7;

interface TermSignUps {
  label: string;
  sortValue: number;
  total: number;
  events: NewMemberSignUpEvent[];
}

/** Groups events into (term, year) buckets by their date, oldest term first. */
export const buildTermSignUps = (events: NewMemberSignUpEvent[]): TermSignUps[] => {
  const terms = new Map<string, TermSignUps>();
  [...events]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((event) => {
      const term = event.date.getMonth() >= FALL_START_MONTH ? Term.FALL : Term.SPRING;
      const year = event.date.getFullYear();
      const key = `${term}-${year}`;
      const existing = terms.get(key);
      terms.set(key, {
        label: `${displayEnum(term)} ${year}`,
        // spring comes before fall within a calendar year
        sortValue: year * 2 + (term === Term.FALL ? 1 : 0),
        total: (existing?.total ?? 0) + event.signUps,
        events: [...(existing?.events ?? []), event]
      });
    });
  return [...terms.values()].sort((a, b) => a.sortValue - b.sortValue);
};

const NewMemberSignUps: React.FC<NewMemberSignUpsProps> = ({ events, termLabels }) => {
  const allTerms = buildTermSignUps(events);
  const visibleTerms = allTerms.filter((term) => termLabels.includes(term.label));

  const maxEvents = Math.max(0, ...visibleTerms.map((term) => term.events.length));
  const chartData = visibleTerms.map((term) => {
    const row: Record<string, string | number> = { name: term.label, total: term.total, zero: 0 };
    term.events.forEach((event, i) => {
      row[`event${i}`] = event.signUps;
    });
    return row;
  });

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 0, width: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
          <Typography variant="h5" fontWeight="bold" sx={{ textDecoration: 'underline' }}>
            New Member Sign-Ups Across Events
          </Typography>
        </Box>

        {visibleTerms.length === 0 ? (
          <Typography textAlign="center">No recruitment events recorded for these terms.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#3a3a3a" vertical={false} />
              <XAxis dataKey="name" stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
              <YAxis stroke="white" tick={{ fill: 'white', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                content={({ active, label }) => {
                  const term = visibleTerms.find((t) => t.label === label);
                  if (!active || !term) return null;
                  return (
                    <Box sx={{ backgroundColor: '#333', color: 'white', borderRadius: '6px', p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {term.label}: {term.total} sign-ups
                      </Typography>
                      {term.events.map((event) => (
                        <Typography variant="caption" display="block" key={event.eventId}>
                          {event.title} ({event.date.toLocaleDateString()}): {event.signUps}
                        </Typography>
                      ))}
                    </Box>
                  );
                }}
              />
              {Array.from({ length: maxEvents }, (_, i) => (
                <Bar
                  key={`event${i}`}
                  dataKey={`event${i}`}
                  stackId="signups"
                  fill={SEGMENT_SHADES[i % SEGMENT_SHADES.length]}
                  stroke="white"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  maxBarSize={48}
                />
              ))}
              {/* zero-height bar on top of each stack, used only to print the total above it */}
              <Bar dataKey="zero" stackId="signups" fill="transparent" isAnimationActive={false}>
                <LabelList dataKey="total" position="top" style={{ fill: 'white', fontWeight: 'bold', fontSize: 14 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default NewMemberSignUps;
