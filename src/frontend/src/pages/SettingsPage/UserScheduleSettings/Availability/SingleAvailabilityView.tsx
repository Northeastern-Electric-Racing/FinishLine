import { Box, Grid } from '@mui/material';
import { HeatmapColors, EnumToArray, REVIEW_TIMES, ExistingMeetingData } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';
import { Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import { useState } from 'react';
import NERArrows from '../../../../components/NERArrows';

interface SingleAvailabilityViewProps {
  totalAvailability: Availability[];
  existingMeetingData: ExistingMeetingData;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({ totalAvailability, existingMeetingData }) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
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
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item>
          <TimeSlot backgroundColor={HeatmapColors[0]} small={true} text={time} fontSize={'13px'} />
          {selectedTimes.map((availability, dayIndex) => {
            const backgroundColor = availability.availability.includes(timeIndex) ? HeatmapColors[3] : HeatmapColors[0];
            return (
              <TimeSlot
                key={timeIndex * EnumToArray(REVIEW_TIMES).length + dayIndex}
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
