import { Box, Grid } from '@mui/material';
import { HeatmapColors, enumToArray, REVIEW_TIMES, ExistingMeetingData } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';
import { Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import { useEffect, useState } from 'react';
import NERArrows from '../../../../components/NERArrows';

interface SingleAvailabilityViewProps {
  totalAvailability: Availability[];
  existingMeetingData: ExistingMeetingData;
  initialDate?: Date;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({
  totalAvailability,
  existingMeetingData,
  initialDate
}) => {
  // Use initialDate if provided, otherwise default to today
  const [startDate, setStartDate] = useState<Date>(initialDate || new Date());

  // Update startDate when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
    }
  }, [initialDate]);

  const selectedTimes = getMostRecentAvailabilities(totalAvailability, startDate);

  const onArrowIncrease = () => {
    setStartDate(new Date(startDate.setDate(startDate.getDate() + 7)));
  };

  const onArrowDecrease = () => {
    setStartDate(new Date(startDate.setDate(startDate.getDate() - 7)));
  };
  return (
    <Grid container>
      <TimeSlot backgroundColor={HeatmapColors[0]} small={true} heightOverride="40px" />
      {selectedTimes.map((availability) => (
        <TimeSlot
          key={availability.dateSet.getTime()}
          backgroundColor={HeatmapColors[0]}
          small={true}
          heightOverride="40px"
          text={getDayOfWeek(availability.dateSet) + ' ' + datePipe(availability.dateSet)}
          fontSize={'12px'}
        />
      ))}
      {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item>
          <TimeSlot backgroundColor={HeatmapColors[0]} small={true} text={time} fontSize={'13px'} />
          {selectedTimes.map((availability, dayIndex) => {
            const backgroundColor = availability.availability.includes(timeIndex) ? HeatmapColors[3] : HeatmapColors[0];
            return (
              <TimeSlot
                key={timeIndex * enumToArray(REVIEW_TIMES).length + dayIndex}
                backgroundColor={backgroundColor}
                small={true}
                icon={existingMeetingData.get(dayIndex)?.iconMap.get(timeIndex)}
              />
            );
          })}
        </Grid>
      ))}
      <Box display={'flex'} justifyContent={'space-around'} width={'100%'}>
        <NERArrows onRightArrowPressed={onArrowIncrease} onLeftArrowPressed={onArrowDecrease} />
      </Box>
    </Grid>
  );
};

export default SingleAvailabilityView;
