import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NewMemberSignUpEvent, Term } from 'shared';
import { displayEnum } from '../utils/pipes';

interface NewMemberSignUpsProps {
  events: NewMemberSignUpEvent[];
}

const VISIBLE_TERMS = 6;
const BAR_COLOR = '#ef4345';
const SEGMENT_SHADES = ['#ef4345', '#d93a3c', '#e8595b', '#c53436'];
// Events from August onward belong to the fall term, earlier ones to the spring term.
const FALL_START_MONTH = 7;

interface TermSignUps {
  key: string;
  label: string;
  shortLabel: string;
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
        key,
        label: `${displayEnum(term)} ${year}`,
        shortLabel: `${term === Term.FALL ? 'F' : 'S'}${String(year).slice(-2)}`,
        // spring comes before fall within a calendar year
        sortValue: year * 2 + (term === Term.FALL ? 1 : 0),
        total: (existing?.total ?? 0) + event.signUps,
        events: [...(existing?.events ?? []), event]
      });
    });
  return [...terms.values()].sort((a, b) => a.sortValue - b.sortValue);
};

const NewMemberSignUps: React.FC<NewMemberSignUpsProps> = ({ events }) => {
  const allTerms = buildTermSignUps(events);
  const maxStart = Math.max(0, allTerms.length - VISIBLE_TERMS);
  // index of the first visible term; undefined means "show the newest terms"
  const [windowStart, setWindowStart] = useState<number | undefined>(undefined);
  const start = Math.min(windowStart ?? maxStart, maxStart);
  const visibleTerms = allTerms.slice(start, start + VISIBLE_TERMS);

  const maxEvents = Math.max(0, ...visibleTerms.map((term) => term.events.length));
  const chartData = visibleTerms.map((term) => {
    const row: Record<string, string | number> = { name: term.label, total: term.total, zero: 0 };
    term.events.forEach((event, i) => {
      row[`event${i}`] = event.signUps;
    });
    return row;
  });

  const selectTerm = (index: number) => setWindowStart(Math.max(0, Math.min(index - VISIBLE_TERMS + 1, maxStart)));

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 0, width: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
          <Typography variant="h5" fontWeight="bold" sx={{ textDecoration: 'underline' }}>
            New Member Sign-Ups Across Events
          </Typography>
          {allTerms.length > 0 && (
            <Box display="flex" alignItems="center">
              <Box display="flex" alignItems="center" flexWrap="wrap">
                {[...allTerms].reverse().map((term) => {
                  const index = allTerms.indexOf(term);
                  const inWindow = index >= start && index < start + VISIBLE_TERMS;
                  return (
                    <Chip
                      key={term.key}
                      label={term.shortLabel}
                      size="small"
                      clickable
                      onClick={() => selectTerm(index)}
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: 'transparent',
                        border: `1px solid ${inWindow ? BAR_COLOR : 'transparent'}`
                      }}
                    />
                  );
                })}
              </Box>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                aria-label="older-terms"
                disabled={start === 0}
                onClick={() => setWindowStart(Math.max(0, start - 1))}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                aria-label="newer-terms"
                disabled={start >= maxStart}
                onClick={() => setWindowStart(Math.min(maxStart, start + 1))}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {allTerms.length === 0 ? (
          <Typography textAlign="center">No recruitment events recorded yet.</Typography>
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
