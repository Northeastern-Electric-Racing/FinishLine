import { Grid, Typography } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { User } from 'shared';
import { useState } from 'react';

const DRCViewModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const numberOfTimeSlots = times.length * daysOfWeek.length;
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor()} />,
      daysOfWeek.map((day) => <TimeSlot key={day} backgroundColor={getBackgroundColor()} text={day} fontSize='12px' />)
    ];
  };

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
    setCurrentAvailableUsers(availableUsers.get(index) || []);
    setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
  };

  const handleOnMouseLeave = () => {
    setCurrentAvailableUsers([]);
    setCurrentUnavailableUsers([]);
  };

  const renderSchedule = () => {
    createAvailableUsers();
    createUnavailableUsers();
    return times.map((time, timeIndex) => (
      <Grid container item xs={12} sx={{ maxWidth: '700px' }} onMouseLeave={handleOnMouseLeave}>
        <TimeSlot backgroundColor={getBackgroundColor()} text={time} fontSize={'13px'} />
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

  const renderAvailabilites = () => {
    return (
      <Grid display={'flex'} gap={2}>
        <Grid>
          <Typography style={{ textDecoration: 'underline', fontFamily: 'oswald', fontSize: '1.2em' }}>
            Available Users
          </Typography>
          {currentAvailableUsers.map((user) => (
            <Typography style={{ fontFamily: 'oswald', textAlign: 'center' }}>
              {user.firstName} {user.lastName}
            </Typography>
          ))}
        </Grid>
        <Grid>
          <Typography style={{ textDecoration: 'underline', fontFamily: 'oswald', fontSize: '1.2em' }}>
            Unvailable Users
          </Typography>
          {currentUnavailableUsers.map((user) => (
            <Typography style={{ fontFamily: 'oswald', textAlign: 'center' }}>
              {user.firstName} {user.lastName}
            </Typography>
          ))}
        </Grid>
      </Grid>
    );
  };

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit} hideFormButtons showCloseButton>
      <Grid display={'flex'}>
        <Grid container sx={{ maxWidth: '700px' }}>
          {renderDayHeaders()}
          {renderSchedule()}
        </Grid>
        <Grid>{renderAvailabilites()}</Grid>
      </Grid>
    </NERModal>
  );
};

export default DRCViewModal;
