import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { Event } from 'shared';
import { TableContainer, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const fadeTime = 250;

const startTime = 10; // 10 AM
const endTime = 21; // 9 PM

const AvailabilityPanel = ({ event, closePanel }: { event: Event; closePanel: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, []);

  const endPanel = () => {
    setVisible(false);
    setTimeout(() => {
      closePanel();
    }, fadeTime);
  };

  const getDateBounds = (date: Date) => {
    date = new Date(date);
    const days: Date[] = new Array(7);
    const mondayDate = new Date(date);
    mondayDate.setDate(mondayDate.getDate() - ((date.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(mondayDate);
      currentDate.setDate(mondayDate.getDate() + i);
      days[i] = currentDate;
    }
    return days;
  };

  const hourToString = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${ampm}`;
  };

  const getHours = () => {
    const hours: number[] = [];
    for (let hour = startTime; hour <= endTime; hour++) {
      hours.push(hour);
    }
    return hours;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex',
        display: 'flex',
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeTime}ms ease-in-out`
      }}
    >
      <Box
        sx={{
          width: '50%',
          height: '100%',
          boxShadow: 24,
          px: 4
        }}
        onClick={() => endPanel()}
      />
      <Box
        sx={{
          width: '50%',
          height: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          px: 4
        }}
      >
        <Typography
          flexGrow={1}
          variant="h4"
          fontSize={30}
          pt={3}
          pb={1}
          sx={{
            textAlign: {
              xs: 'center',
              md: 'left'
            }
          }}
        >
          {event.title} Availability
        </Typography>
        {event.scheduledTimes[0]?.startTime && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {getDateBounds(event.scheduledTimes[0].startTime).map((date) => (
                    <TableCell key={date.toDateString()}>
                      <Typography align="center">
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Typography>
                      <Typography flexGrow={1} variant="h6" fontSize={20} align="center">
                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {getHours().map((hour) => (
                  <TableRow>
                    <TableCell>
                      <Typography flexGrow={1} variant="h6" fontSize={16} align="center">
                        {hourToString(hour)}
                      </Typography>
                    </TableCell>
                    {getDateBounds(event.scheduledTimes[0]?.startTime || new Date()).map((date) => (
                      <TableCell key={date.toDateString()} sx={{ p: 0.5 }}>
                        <Box
                          sx={{
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            width: '100%',
                            height: '100%',
                            minHeight: 40,
                            display: 'flex'
                          }}
                        >
                          <Typography
                            color="grey.200"
                            sx={{
                              textAlign: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              ':hover': { color: 'black' }
                            }}
                          >
                            5 / 5
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default AvailabilityPanel;
