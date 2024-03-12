import { Box, Grid, Typography } from '@mui/material';
import TimeSlot from '../components/TimeSlot';
import { User } from 'shared';
import { useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import NERFailButton from '../components/NERFailButton';
import NERSuccessButton from '../components/NERSuccessButton';
import {
  REVIEW_TIMES,
  DAY_NAMES,
  NUMBER_OF_TIME_SLOTS,
  EnumToArray,
  getBackgroundColor,
  HeatmapColors
} from '../utils/design-review.utils';
import { fullNamePipe } from '../utils/pipes';

interface DRCViewProps {
  title: string;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

const DRCView: React.FC<DRCViewProps> = ({ usersToAvailabilities, existingMeetingData }) => {
  const totalUsers = usersToAvailabilities.size;
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

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
      EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot key={day} backgroundColor="#D9D9D9" text={day} fontSize={'1em'} isModal={false} />
      ))
    ];
  };

  const renderSchedule = () => {
    // Populates the availableUsers map
    for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
      availableUsers.set(time, []);
    }
    usersToAvailabilities.forEach((availableTimes, user) => {
      availableTimes.forEach((time) => {
        const usersAtTime = availableUsers.get(time) || [];
        usersAtTime.push(user);
        availableUsers.set(time, usersAtTime);
      });
    });

    // Populates the unavailableUsers map
    const allUsers = [...usersToAvailabilities.keys()];
    for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
      const currentUsers = availableUsers.get(time) || [];
      const currentUnavailableUsers = allUsers.filter((user) => !currentUsers.includes(user));
      unavailableUsers.set(time, currentUnavailableUsers);
    }

    return (
      <Grid container>
        {renderDayHeaders()}
        {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
          <Grid container item xs={12} onMouseLeave={handleOnMouseLeave}>
            <TimeSlot backgroundColor={HeatmapColors.zero} text={time} fontSize={'1em'} isModal={false} />
            {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
              const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
              return (
                <TimeSlot
                  key={index}
                  backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                  onMouseOver={() => handleOnMouseOver(index)}
                  isModal={false}
                  icon={existingMeetingData.get(index)}
                />
              );
            })}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderLegend = () => {
    const colors = EnumToArray(HeatmapColors);
    return (
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography style={{ marginRight: '10px' }}>0/0</Typography>
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            sx={{
              width: '1.5vw',
              height: '1.5vw',
              backgroundColor: colors[i]
            }}
          />
        ))}
        <Typography style={{ marginLeft: '10px' }}>
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
                  fontSize: '1.5em',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}
              >
                Available Users
              </Typography>
              {currentAvailableUsers.map((user) => (
                <Typography style={{ textAlign: 'center', fontSize }}>{fullNamePipe(user)}</Typography>
              ))}
            </Grid>
            <Grid>
              <Typography
                style={{
                  textDecoration: 'underline',
                  fontSize: '1.5em',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}
              >
                Unvailable Users
              </Typography>
              {currentUnavailableUsers.map((user) => (
                <Typography style={{ textAlign: 'center', fontSize }}>{fullNamePipe(user)}</Typography>
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
