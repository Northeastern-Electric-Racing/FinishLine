import { Grid, Typography } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCViewProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { User } from 'shared';
import { useState } from 'react';

const DRCView: React.FC<DRCViewProps> = ({ title, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const timeslotWidth = '11%';
  const timeslotHeight = '4.7vh';
  const numberOfTimeSlots = times.length * daysOfWeek.length;
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor()} width={timeslotWidth} height={timeslotHeight} />,
      daysOfWeek.map((day) => (
        <TimeSlot
          key={day}
          backgroundColor={getBackgroundColor()}
          text={day}
          fontSize={'1em'}
          width={timeslotWidth}
          height={timeslotHeight}
        />
      ))
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
    return (
      <Grid container>
        {renderDayHeaders()}
        {times.map((time, timeIndex) => (
          <Grid container item xs={12} onMouseLeave={handleOnMouseLeave}>
            <TimeSlot
              backgroundColor={getBackgroundColor()}
              text={time}
              fontSize={'1em'}
              width={timeslotWidth}
              height={timeslotHeight}
            />
            {daysOfWeek.map((_day, dayIndex) => {
              const index = dayIndex * times.length + timeIndex;
              return (
                <TimeSlot
                  key={index}
                  backgroundColor={getBackgroundColor(availableUsers.get(index)?.length)}
                  onMouseOver={() => handleOnMouseOver(index)}
                  width={timeslotWidth}
                  height={timeslotHeight}
                />
              );
            })}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderAvailabilites = () => {
    return (
      <Grid
        display={'flex'}
        gap={2}
        style={{
          backgroundColor: '#2C2C2C',
          padding: '20px',
          borderRadius: '8px',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <Grid>
          <Typography
            style={{
              textDecoration: 'underline',
              fontFamily: 'oswald',
              fontSize: '1.5em',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            Available Users
          </Typography>
          {currentAvailableUsers.map((user) => (
            <Typography style={{ fontFamily: 'oswald', textAlign: 'center', fontSize: '1.2em' }}>
              {user.firstName} {user.lastName}
            </Typography>
          ))}
        </Grid>
        <Grid>
          <Typography
            style={{
              textDecoration: 'underline',
              fontFamily: 'oswald',
              fontSize: '1.5em',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            Unvailable Users
          </Typography>
          {currentUnavailableUsers.map((user) => (
            <Typography style={{ fontFamily: 'oswald', textAlign: 'center', fontSize: '1.2em' }}>
              {user.firstName} {user.lastName}
            </Typography>
          ))}
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid display={'flex'}>
      {renderSchedule()}
      <Grid>{renderAvailabilites()}</Grid>
    </Grid>
  );
};

export default DRCView;
