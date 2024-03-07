import { Button, Grid, Icon, Typography } from '@mui/material';
import { DRCViewProps, getBackgroundColor, times, daysOfWeek, TimeSlot, getIcon } from './DesignReviewCommon';
import { User } from 'shared';
import { ReactElement, useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';

const DRCView: React.FC<DRCViewProps> = ({ title, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const timeslotIcons = new Map<number, ReactElement>();
  const numberOfTimeSlots = times.length * daysOfWeek.length;
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor()} isModal={false} />,
      daysOfWeek.map((day) => (
        <TimeSlot key={day} backgroundColor={getBackgroundColor()} text={day} fontSize={'1em'} isModal={false} />
      ))
    ];
  };

  const timeslotData = new Map<number, string>();
  timeslotData.set(5, 'warning');
  timeslotData.set(6, 'build');
  timeslotData.set(7, 'computer');
  timeslotData.set(8, 'electrical');

  function createAvailableUsers() {
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
  }

  function createUnavailableUsers() {
    const allUsers = [...usersToAvailabilities.keys()];
    for (let time = 0; time < numberOfTimeSlots; time++) {
      const currentUsers = availableUsers.get(time) || [];
      const currentUnavailableUsers = allUsers.filter((user) => !currentUsers.includes(user));
      unavailableUsers.set(time, currentUnavailableUsers);
    }
    return unavailableUsers;
  }

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
            <TimeSlot backgroundColor={getBackgroundColor()} text={time} fontSize={'1em'} isModal={false} />
            {daysOfWeek.map((_day, dayIndex) => {
              const index = dayIndex * times.length + timeIndex;
              return (
                <TimeSlot
                  key={index}
                  backgroundColor={getBackgroundColor(availableUsers.get(index)?.length)}
                  onMouseOver={() => handleOnMouseOver(index)}
                  isModal={false}
                  icon={timeslotData.get(index)}
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#2C2C2C',
          padding: '20px',
          borderRadius: '8px',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <Grid display={'flex'} gap={2}>
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
        <Grid
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <WarningIcon style={{ color: 'yellow', fontSize: '2em', marginTop: '5px' }} />
          <Button
            style={{
              fontFamily: 'oswald',
              backgroundColor: '#848484',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1em',
              padding: '8px',
              width: '30%'
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              fontFamily: 'oswald',
              backgroundColor: '#EF4345',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1em',
              padding: '8px',
              width: '30%'
            }}
          >
            Finalize
          </Button>
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
