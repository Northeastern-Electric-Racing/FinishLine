import { Grid } from '@mui/material';
import { HeatmapColors, EnumToArray, REVIEW_TIMES, ExistingMeetingData } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';
import { Availability, getDayOfWeek } from 'shared';
import { datePipe } from '../../../../utils/pipes';

interface SingleAvailabilityViewProps {
  selectedTimes: Availability[];
  existingMeetingData: ExistingMeetingData;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({ selectedTimes, existingMeetingData }) => {
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
    </Grid>
  );
};

export default SingleAvailabilityView;
