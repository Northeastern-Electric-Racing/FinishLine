import { Box, Grid, Typography } from '@mui/material';
import { DRCViewProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { User } from 'shared';
import { useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import NERFailButton from '../components/NERFailButton';
import NERSuccessButton from '../components/NERSuccessButton';

const DRCView: React.FC<DRCViewProps> = ({ usersToAvailabilities, iconData }) => {
  const totalUsers = usersToAvailabilities.size;
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const numberOfTimeSlots = times.length * daysOfWeek.length;
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

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

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor="#D9D9D9" isModal={false} />,
      daysOfWeek.map((day) => <TimeSlot key={day} backgroundColor="#D9D9D9" text={day} fontSize={'1em'} isModal={false} />)
    ];
  };

  const renderSchedule = () => {
    createAvailableUsers();
    createUnavailableUsers();
    return (
      <Grid container>
        {renderDayHeaders()}
        {times.map((time, timeIndex) => (
          <Grid container item xs={12} onMouseLeave={handleOnMouseLeave}>
            <TimeSlot backgroundColor="#D9D9D9" text={time} fontSize={'1em'} isModal={false} />
            {daysOfWeek.map((_day, dayIndex) => {
              const index = dayIndex * times.length + timeIndex;
              return (
                <TimeSlot
                  key={index}
                  backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                  onMouseOver={() => handleOnMouseOver(index)}
                  isModal={false}
                  icon={iconData.get(index)}
                />
              );
            })}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderLegend = () => {
    const colors = ['#D9D9D9', '#E0C0C1', '#E89A9B', '#E4797A', '#EF4345', '#D70C0F'];
    return (
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography style={{ marginRight: '10px', fontFamily: 'oswald' }}>0/0</Typography>
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            sx={{
              width: '1.5vw',
              height: '1.5vw',
              backgroundColor: colors[i]
            }}
          />
        ))}
        <Typography style={{ marginLeft: '10px', fontFamily: 'oswald' }}>
          {totalUsers}/{totalUsers}
        </Typography>
      </Grid>
    );
  };

  const renderAvailabilites = () => {
    const fontSize = totalUsers > 10 ? '1em' : totalUsers > 15 ? '0.8em' : '1.2em';
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
        <Grid style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginBottom: '10px' }}>
          {renderLegend()}
          <Grid style={{ display: 'flex', gap: '2', marginTop: '10px' }}>
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
                <Typography style={{ fontFamily: 'oswald', textAlign: 'center', fontSize }}>
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
                <Typography style={{ fontFamily: 'oswald', textAlign: 'center', fontSize }}>
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
            <NERFailButton>Cancel</NERFailButton>
            <NERSuccessButton>Finalize</NERSuccessButton>
          </Grid>
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
