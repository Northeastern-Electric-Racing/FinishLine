import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { User } from 'shared';

const DRCViewModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor()} />,
      daysOfWeek.map((day) => <TimeSlot key={day} backgroundColor={getBackgroundColor()} text={day} fontSize={12} />)
    ];
  };

  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const numberOfTimeSlots = times.length * daysOfWeek.length;

  const createAvailableUsers = () => {
    for (let time = 0; time < numberOfTimeSlots; time++) {
      availableUsers.set(time, []);
    }

    usersToAvailabilities.forEach((availableTimes, user) => {
      availableTimes.forEach((time) => {
        const usersAtTime = availableUsers.get(time) || [];
        usersAtTime.push(user);
        availableUsers.set(time, usersAtTime);
      });
    });
    return availableUsers;
  };

  const createUnavailableUsers = () => {
    const allUsers = [...usersToAvailabilities.keys()];
    for (let time = 0; time < numberOfTimeSlots; time++) {
      const currentUsers = availableUsers.get(time) || [];
      const currentUnavailableUsers = allUsers.filter((user) => !currentUsers.includes(user));
      unavailableUsers.set(time, currentUnavailableUsers);
    }
    return unavailableUsers;
  };

  const handleOnMouseOver = (index: number) => {
    console.log(availableUsers.get(index));
    console.log(unavailableUsers.get(index));
  };

  const renderSchedule = () => {
    createAvailableUsers();
    createUnavailableUsers();
    return times.map((time, timeIndex) => (
      <Grid container item xs={12}>
        <TimeSlot backgroundColor={getBackgroundColor()} text={time} fontSize={13} />
        {daysOfWeek.map((_day, dayIndex) => {
          const index = dayIndex * times.length + timeIndex;
          return (
            <TimeSlot
              key={index}
              backgroundColor={getBackgroundColor(availableUsers.get(index)?.length)}
              onMouseOver={() => handleOnMouseOver(index)}
            />
          );
        })}
      </Grid>
    ));
  };

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit} hideFormButtons showCloseButton>
      <Grid container>
        {renderDayHeaders()}
        {renderSchedule()}
      </Grid>
    </NERModal>
  );
};

export default DRCViewModal;
