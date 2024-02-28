import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';

const DRCViewModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor(0)} />,
      daysOfWeek.map((day) => <TimeSlot key={day} backgroundColor={getBackgroundColor()} text={day} fontSize={12} />)
    ];
  };

  const createFrequencyTable = () => {
    const frequencyTable = new Map<number, number>();
    usersToAvailabilities.forEach((availableTimes, user) => {
      availableTimes.forEach((time) => {
        const count = frequencyTable.get(time) || 0;
        frequencyTable.set(time, count + 1);
      });
    });
    return frequencyTable;
  };

  const renderSchedule = () => {
    const frequencyTable = createFrequencyTable();
    return times.map((time, timeIndex) => (
      <Grid container item xs={12}>
        <TimeSlot backgroundColor={getBackgroundColor()} text={time} fontSize={13} />
        {daysOfWeek.map((_day, dayIndex) => {
          const index = dayIndex * times.length + timeIndex;
          return <TimeSlot key={index} backgroundColor={getBackgroundColor(frequencyTable.get(index))} />;
        })}
      </Grid>
    ));
  };

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit}>
      <Grid container>
        {renderDayHeaders()}
        {renderSchedule()}
      </Grid>
    </NERModal>
  );
};

export default DRCViewModal;
