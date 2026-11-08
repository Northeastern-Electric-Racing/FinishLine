/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useGetBayDashboardCountdowns } from '../../../../hooks/bay-dashboard.hooks';
import { useNow } from '../../../../hooks/utils.hooks';
import { getCountdownDisplay, pickDisplayedCountdowns } from '../../../../utils/bay-dashboard-countdown.utils';

interface CountdownWidgetProps {
  // the organization's slug, used to load its countdowns
  slug: string;
}

const GAUGE_RED = '#de5454';
const GAUGE_LIGHT_RED = '#e8a0a0';
// a semicircle centered at the bottom of a 200 x 110 viewBox, leaving room for the stroke
const GAUGE_ARC = 'M 20 100 A 80 80 0 0 1 180 100';
// how often the days are recalculated, so the TV rolls over at midnight without a refresh
const CLOCK_TICK_MS = 60 * 1000;

const textSx = { fontFamily: 'Oswald, sans-serif', fontWeight: 400, color: 'white', lineHeight: 1 };

const CountdownMessage: React.FC<{ message: string }> = ({ message }) => (
  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography sx={{ ...textSx, fontSize: '4cqw' }}>{message}</Typography>
  </Box>
);

/**
 * The countdown in the top right of the TV. The primary countdown is shown as a gauge filling up from its
 * start date to its end date, and the next countdown is shown in the badge in the corner.
 */
const CountdownWidget: React.FC<CountdownWidgetProps> = ({ slug }) => {
  const now = useNow(CLOCK_TICK_MS);
  const { data: countdowns, isLoading, isError, error } = useGetBayDashboardCountdowns(slug);

  const content = () => {
    // a failed refetch keeps the last countdowns that loaded, so only show the error when there's nothing to display
    if (isError && countdowns === undefined) return <CountdownMessage message={error.message} />;
    if (isLoading || countdowns === undefined) return <LoadingIndicator />;

    const { primary, secondary } = pickDisplayedCountdowns(countdowns, now);
    if (!primary) return <CountdownMessage message="No countdowns" />;

    const primaryDisplay = getCountdownDisplay(primary, now);
    const secondaryDisplay = secondary && getCountdownDisplay(secondary, now);

    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
          <Box sx={{ position: 'relative', width: '50cqw' }}>
            <svg viewBox="0 0 200 110" width="100%" style={{ display: 'block' }}>
              <path d={GAUGE_ARC} fill="none" stroke={GAUGE_LIGHT_RED} strokeWidth={24} pathLength={1} />
              <path
                d={GAUGE_ARC}
                fill="none"
                stroke={GAUGE_RED}
                strokeWidth={24}
                pathLength={1}
                strokeDasharray={`${primaryDisplay.progress} 1`}
              />
            </svg>
            <Typography
              sx={{
                ...textSx,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: '17cqw'
              }}
            >
              {primaryDisplay.days}
            </Typography>
          </Box>
          <Typography sx={{ ...textSx, fontSize: '5.5cqw', mt: '2cqw', textAlign: 'center' }}>
            {primaryDisplay.label}
          </Typography>
        </Box>
        {secondaryDisplay && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: '2cqw',
              width: '17cqw',
              aspectRatio: '1',
              borderRadius: '50%',
              bgcolor: GAUGE_RED,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: '1.5cqw',
              boxSizing: 'border-box'
            }}
          >
            <Typography sx={{ ...textSx, fontSize: '7cqw' }}>{secondaryDisplay.days}</Typography>
            <Typography sx={{ ...textSx, fontSize: '1.7cqw', mt: '0.5cqw', textAlign: 'center' }}>
              {secondaryDisplay.label}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return <Box sx={{ containerType: 'inline-size', position: 'relative', width: '100%', height: '100%' }}>{content()}</Box>;
};

export default CountdownWidget;
