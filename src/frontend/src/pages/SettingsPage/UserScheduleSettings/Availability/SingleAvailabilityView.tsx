import { Grid } from '@mui/material';
import { HeatmapColors, EnumToArray, DAY_NAMES, REVIEW_TIMES } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';

interface SingleAvailabilityViewProps {
  selectedTimes: number[];
  existingMeetingData: Map<number, string>;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({ selectedTimes, existingMeetingData }) => {
  return (
    <Grid container>
      <TimeSlot backgroundColor={HeatmapColors[0]} small={true} />
      {EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot key={day} backgroundColor={HeatmapColors[0]} small={true} text={day} fontSize={'12px'} />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item>
          <TimeSlot backgroundColor={HeatmapColors[0]} small={true} text={time} fontSize={'13px'} />
          {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
            const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
            const backgroundColor = selectedTimes.includes(index) ? HeatmapColors[3] : HeatmapColors[0];
            return (
              <TimeSlot key={index} backgroundColor={backgroundColor} small={true} icon={existingMeetingData.get(index)} />
            );
          })}
        </Grid>
      ))}
    </Grid>
  );
};

export default SingleAvailabilityView;
