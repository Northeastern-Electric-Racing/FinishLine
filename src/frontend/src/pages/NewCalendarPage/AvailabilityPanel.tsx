import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { Event } from 'shared';
import { TableContainer, Typography, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@mui/material';
import { useGetAvailability } from '../../hooks/calendar.hooks';

const fadeTime = 250;

const startTime = 10; // 10 AM
const endTime = 21; // 9 PM
const diff = endTime - startTime - 1;

interface CellDetails {
  row: number;
  col: number;
  rowSize: number;
  colSize: number;
}

const AvailabilityPanel = ({ event, closePanel }: { event: Event; closePanel: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [initialStartTime] = useState<Date>(
    event.scheduledTimes && event.scheduledTimes[0] && event.scheduledTimes[0].startTime
      ? new Date(event.scheduledTimes[0].startTime)
      : new Date()
  );
  const [dateBounds, setDateBounds] = useState<Date[]>([]);
  const [hours, setHours] = useState<number[]>([]);
  const [availabilities, setAvailabilities] = useState<string[][][]>(
    Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => []))
  );
  const [totalUsers, setTotalUsers] = useState<number>(1);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [unavailableUsers, setUnavailableUsers] = useState<string[]>([]);

  const [cellSelected, setCellSelected] = useState<{ row: number; col: number } | null>(null);
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<string[]>([]);
  const [selectedUnavailableUsers, setSelectedUnavailableUsers] = useState<string[]>([]);

  const { data: personalAvailabilities } = useGetAvailability(event.eventId);

  useEffect(() => {
    if (!personalAvailabilities) return;

    const availabilityMatrix: string[][][] = Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => []));
    const availableUsersSet: Set<string> = new Set();

    personalAvailabilities.forEach((pa) => {
      pa.availabilities.forEach((av) => {
        const day = av.dateSet.getDay(); // 0 (Sun) to 6 (Sat)

        if (av.availability.length > 0) {
          availableUsersSet.add(`${pa.firstName} ${pa.lastName}`);
        }

        av.availability.forEach((hour) => {
          availabilityMatrix[day][hour].push(`${pa.firstName} ${pa.lastName}`);
        });
      });
    });

    const unavailableUsersSet: Set<string> = new Set();

    personalAvailabilities.forEach((pa) => {
      const fullName = `${pa.firstName} ${pa.lastName}`;
      if (!availableUsersSet.has(fullName)) {
        unavailableUsersSet.add(fullName);
      }
    });

    setAvailableUsers(Array.from(availableUsersSet));
    setUnavailableUsers(Array.from(unavailableUsersSet));

    setAvailabilities(availabilityMatrix);
    setTotalUsers(personalAvailabilities.length);
  }, [personalAvailabilities]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });

    const days: Date[] = new Array(7);
    const sundayDate = new Date(initialStartTime);
    sundayDate.setDate(sundayDate.getDate() - (initialStartTime.getDay() % 7)); // Set to Monday of that week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sundayDate);
      currentDate.setDate(sundayDate.getDate() + i);
      days[i] = currentDate;
    }
    setDateBounds(days);

    const hours: number[] = [];
    for (let hour = startTime; hour <= endTime; hour++) {
      hours.push(hour);
    }
    setHours(hours);
  }, [initialStartTime]);

  if (!event || !event.scheduledTimes || !event.scheduledTimes[0].startTime) {
    return null;
  }

  const endPanel = () => {
    setVisible(false);
    setTimeout(() => {
      closePanel();
    }, fadeTime);
  };

  const onCellSelect = (row: number, col: number) => {
    setCellSelected({ row, col });
    setSelectedAvailableUsers(availabilities[col][row]);
    const unavailableInCell = unavailableUsers.filter((user) => !availabilities[col][row].includes(user));
    setSelectedUnavailableUsers(unavailableInCell);
  };

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  const hourToString = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${ampm}`;
  };

  const AvailabilityTable = ({ generateCell }: { generateCell: (cellDetails: CellDetails) => JSX.Element }) => {
    return (
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxWidth: '100%'
        }}
      >
        <Table
          stickyHeader
          sx={{
            '& .MuiTableCell-head': {
              bgcolor: 'background.paper'
            },
            minWidth: 650
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {dateBounds.map((date) => (
                <TableCell key={date.toDateString()}>
                  <Typography align="center">
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Typography>
                  <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                    {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {hours.map((hour) => (
              <TableRow>
                <TableCell sx={{ ...stickyLeft, zIndex: 1 }}>
                  <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                    {hourToString(hour)}
                  </Typography>
                </TableCell>
                {dateBounds.map((date, i) => (
                  <TableCell key={date.toDateString()} sx={{ p: 0 }}>
                    {generateCell({ row: hour - diff, col: i, rowSize: hours.length - diff, colSize: dateBounds.length })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const AvailabilityList = ({ title, names }: { title: string; names: string[] }) => {
    return (
      <Box px={1} py={1} height="100%" width={`${(1 / 3) * 100}%`} display="flex" flexDirection="column">
        <Box>
          <Typography
            flexGrow={1}
            variant="h4"
            sx={{
              textAlign: {
                xs: 'center',
                md: 'center'
              },
              fontSize: { xs: 5, md: 20 },
              sticky: 'true'
            }}
          >
            {title}
          </Typography>
          <Divider sx={{ borderColor: 'grey.100', my: '1px' }} />
        </Box>
        <Box
          sx={{
            overflow: 'scroll',
            display: 'flex'
          }}
        >
          <Box
            sx={{
              overflow: 'scroll',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%'
            }}
            display="flex"
            flexDirection="column"
            flexGrow={1}
          >
            {names.sort().map((name, index) => (
              <Typography key={index} align="center">
                {name}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    );
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
          display: { xs: 'none', md: 'block' },
          width: '50%',
          height: '100%',
          boxShadow: 24,
          px: 4
        }}
        onClick={() => endPanel()}
      />
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          px: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          flexGrow={1}
          variant="h4"
          pt={3}
          pb={1}
          sx={{
            textAlign: {
              xs: 'center',
              md: 'left'
            },
            fontSize: { xs: 20, md: 32 }
          }}
        >
          {event.title} Availability
        </Typography>
        <AvailabilityTable
          generateCell={(cellDetails) => {
            const { row, col } = cellDetails;
            return (
              <Box onMouseEnter={() => onCellSelect(row, col)} onMouseLeave={() => setCellSelected(null)} p={0.5}>
                <Box
                  sx={{
                    borderRadius: 1,
                    bgcolor: `rgba(244, 67, 54, ${(availabilities[col][row].length / totalUsers) * 0.8})`,
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
                      opacity: 0,
                      ':hover': { opacity: 1 },
                      transition: 'opacity 100ms ease-in-out',
                      userSelect: 'none'
                    }}
                  >
                    {availabilities[col][row].length} / {totalUsers}
                  </Typography>
                </Box>
              </Box>
            );
          }}
        />
        <Box display="flex" justifyContent="left" alignItems="center" height="18%" mt={2} mb={1}>
          <AvailabilityList title="Available Participants" names={cellSelected ? selectedAvailableUsers : availableUsers} />
          <AvailabilityList
            title="Unavailable Participants"
            names={cellSelected ? selectedUnavailableUsers : unavailableUsers}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AvailabilityPanel;
