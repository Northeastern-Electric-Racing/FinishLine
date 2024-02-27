import { Box, Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { User } from 'shared';

interface DRCModalProps {
  open: boolean;
  title: string;
  onHide: () => void;
  onSubmit?: () => void;
  currentUser?: User;
  usersToAvailabilities: Map<User, number[]>;
}

interface TimeBoxProps {
  text?: string;
  fontSize?: number;
  backgroundColor: string;
  onClick?: () => void;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = [
  '10-11 AM',
  '11-12 PM',
  '12-1 PM',
  '1-2 PM',
  '2-3 PM',
  '3-4 PM',
  '4-5 PM',
  '5-6 PM',
  '6-7 PM',
  '7-8 PM',
  '8-9 PM',
  '9-10 PM'
];

const getBackgroundColor = (frequency?: number): string => {
  switch (frequency) {
    case 0:
      return 'white';
    case 1:
      return 'red';
    case 2:
      return 'blue';
    case 3:
      return 'green';
    case 4:
      return 'purple';
    case 5:
      return 'orange';
    case 6:
      return 'yellow';
    default:
      return 'white';
  }
};

const DRCModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, currentUser, usersToAvailabilities }) => {
  const header = `Are you availble for the ${title} Design Review`;

  const renderDayHeaders = () => {
    return [
      <TimeBox backgroundColor={getBackgroundColor(0)} />,
      daysOfWeek.map((day) => <TimeBox key={day} backgroundColor={getBackgroundColor()} text={day} fontSize={12} />)
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

  const handleSelect = (selectedTime: number) => {
    if (currentUser) {
      const userAvailabilities = usersToAvailabilities.get(currentUser) || [];
      userAvailabilities.push(selectedTime);
      usersToAvailabilities.set(currentUser, userAvailabilities);
    }
  };

  const renderSchedule = () => {
    const frequencyTable = createFrequencyTable();
    return times.map((time, timeIndex) => (
      <Grid container item xs={12}>
        <TimeBox backgroundColor={getBackgroundColor()} text={time} fontSize={13} />
        {daysOfWeek.map((_day, dayIndex) => {
          const index = dayIndex * times.length + timeIndex;
          return (
            <TimeBox
              key={index}
              backgroundColor={getBackgroundColor(frequencyTable.get(index))}
              onClick={() => currentUser && handleSelect(index)}
            />
          );
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

const TimeBox: React.FC<TimeBoxProps> = ({ text, fontSize, backgroundColor, onClick }) => {
  return (
    <Box
      sx={{
        height: '25px',
        width: '81px',
        backgroundColor,
        cursor: 'pointer',
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: '0.1px',
        color: 'black',
        textAlign: 'center',
        fontSize,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
      onClick={onClick}
    >
      {text}
    </Box>
  );
};

export { DRCModal, TimeBox };
