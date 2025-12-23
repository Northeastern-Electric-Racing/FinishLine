import { Box } from '@mui/system';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Availability, Event } from 'shared';
import {
  TableContainer,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Button
} from '@mui/material';
import { useGetAvailabilities, useGetAvailability, useSetAvailability } from '../../hooks/calendar.hooks';
import { transform } from 'typescript';

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
  console.log('AvailabilityPanel rendering');
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
  const [selfAvailabilities, setSelfAvailabilities] = useState<boolean[][]>(
    Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => false))
  );
  const [totalUsers, setTotalUsers] = useState<number>(1);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [unavailableUsers, setUnavailableUsers] = useState<string[]>([]);

  const { data: personalAvailabilities, refetch: refetchAvailabilities } = useGetAvailabilities(event.eventId);
  const { data: userAvailability, refetch: refetchAvailability } = useGetAvailability();

  const [editingAvailability, setEditingAvailability] = useState<boolean>(false);
  const passedCells = useRef<Set<string>>(new Set());

  const cellSelectedRef = useRef<{ row: number; col: number } | null>(null);
  const mouseState = useRef<boolean>(false);

  const [, updatePanels] = useState({});
  const { mutateAsync: setAvailability } = useSetAvailability();

  const availabilityOptions = [
    {
      label: 'Edit Your Availability',
      action: () => {
        setEditingAvailability(true);
      },
      disabled: editingAvailability
    },
    {
      label: 'Close',
      action: () => {
        endPanel();
      }
    }
  ];

  const editAvailabilityOptions = [
    {
      label: 'Save Changes',
      action: async () => {
        await setAvailability(transformAvailabilityGraph());
        await refetchAvailability();
        await refetchAvailabilities();
        setEditingAvailability(false);
      },
      color: 'rgba(50, 139, 52, 1)',
      bgColor: 'rgba(50, 139, 52, 0.2)'
    },
    {
      label: 'Cancel',
      action: () => {
        setEditingAvailability(false);
      },
      color: 'rgba(200, 50, 50, 1)',
      bgColor: 'rgba(200, 50, 50, 0.2)'
    },
    {
      label: 'Clear All',
      action: () => {
        setSelfAvailabilities(Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => false)));
      },
      color: 'rgba(200, 50, 50, 1)',
      bgColor: 'rgba(200, 50, 50, 0.2)'
    }
  ];

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

    transformAvailabilityList();

    if (!editingAvailability) return;

    const handleDown = () => {
      mouseState.current = true;
      passedCells.current.clear();
    };

    const handleUp = () => (mouseState.current = false);

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [personalAvailabilities, editingAvailability]);

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
    cellSelectedRef.current = { row, col };
    updatePanels({});
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

  const toggleCellAvailability = (row: number, col: number) => {
    if (passedCells.current.has(`${row},${col}`)) return;

    setSelfAvailabilities((prev) => {
      const newAvailabilities = prev.map((row) => [...row]); // Deep copy
      newAvailabilities[col][row] = !newAvailabilities[col][row];
      return newAvailabilities;
    });

    passedCells.current.add(`${row},${col}`);
  };

  const transformAvailabilityGraph = () => {
    const newAvailabilities: { dateSet: Date; availability: number[] }[] = [];
    const baseDate = dateBounds[0];

    for (let col = 0; col < 7; col++) {
      const availabilityForDay: number[] = [];
      for (let row = 0; row < 12; row++) {
        if (selfAvailabilities[col][row]) {
          availabilityForDay.push(row);
        }
      }
      const dateSet = new Date(baseDate);
      dateSet.setDate(baseDate.getDate() + col);
      newAvailabilities.push({ dateSet, availability: availabilityForDay });
    }

    return newAvailabilities as Availability[];
  };

  const transformAvailabilityList = async () => {
    const newSelfAvailabilities: boolean[][] = Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => false));
    userAvailability?.forEach((av) => {
      const day = av.dateSet.getDay();
      av.availability.forEach((hour) => {
        newSelfAvailabilities[day][hour] = true;
      });
    });
    setSelfAvailabilities(newSelfAvailabilities);
  };

  const ParticipantLists = () => {
    /**
     * This component has a critical problem which does not have a solution with React.
     * When hovering over different cells, we want to update the list of participants
     * without re-rendering the entire AvailabilityPanel (which causes flickering).
     *
     * The only way to achieve this is to use a ref to store the currently selected cell,
     * and useMemo to compute the selected users based on that ref.
     *
     * This way, we avoid re-rendering the entire AvailabilityPanel, and only re-compute
     * the selected users when the ref changes.
     *
     * However, this is not a perfect solution, It does less flickering but yet still causes flickering.
     * This is because any sort of state change in the parent component (AvailabilityPanel) will cause a re-render
     * Therefore: causing a reset in the scroll position of the participant lists.
     *
     * A more robust solution would require a different architecture, using getAttribute on DOM elements
     * to store the cell position, and then using event listeners to update the participant lists.
     * This would avoid React's rendering model altogether for this specific functionality.
     *
     * In summary, there is no clear solution to this problem within React's paradigm without causing some form of flickering or scroll reset.
     */
    const selectedUsers = useMemo(() => {
      if (!cellSelectedRef.current) {
        return {
          available: availableUsers,
          unavailable: unavailableUsers
        };
      }

      const { row, col } = cellSelectedRef.current;
      const selectedAvailable = availabilities[col][row];
      const selectedUnavailable = availableUsers.filter((user) => !availabilities[col][row].includes(user));

      return {
        available: selectedAvailable,
        unavailable: selectedUnavailable
      };
    }, []);

    return (
      <>
        <AvailabilityList
          title="Available Participants"
          inner={selectedUsers.available.sort().map((name, index) => (
            <Typography key={index} align="center">
              {name}
            </Typography>
          ))}
        />
        <AvailabilityList
          title="Unavailable Participants"
          inner={selectedUsers.unavailable.sort().map((name, index) => (
            <Typography key={index} align="center">
              {name}
            </Typography>
          ))}
        />
      </>
    );
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

  const AvailabilityList = ({ title, inner }: { title: string; inner: JSX.Element[] }) => {
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
            overflow: 'auto',
            display: 'flex'
          }}
        >
          <Box
            sx={{
              overflow: 'auto',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%'
            }}
            display="flex"
            flexDirection="column"
            flexGrow={1}
            py={1}
          >
            {inner}
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
        justifyContent: 'flex-end',
        display: 'flex',
        alignItems: 'flex-end',
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeTime}ms ease-in-out`
      }}
      onClick={() => endPanel()}
    >
      <Box
        onClick={(e) => (editingAvailability ? e.stopPropagation() : null)}
        sx={{
          width: { xs: '100%', md: '50%' },
          height: '100%',
          bgcolor: 'background.paper',
          zIndex: 0, // Fix Overlapping
          opacity: editingAvailability ? 1 : 0,
          transition: `opacity ${fadeTime}ms ease-in-out`,
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
          Your Availability
        </Typography>
        <AvailabilityTable
          generateCell={(cellDetails) => {
            const { row, col } = cellDetails;
            return (
              <Box p={0.5}>
                <Box
                  sx={{
                    borderRadius: 1,
                    bgcolor: `rgba(244, 67, 54, ${selfAvailabilities[col][row] ? 0.8 : 0.1})`,
                    width: '100%',
                    height: '100%',
                    minHeight: 40,
                    display: 'flex',
                    transition: 'background-color 100ms ease-in-out !important'
                  }}
                  onMouseEnter={() => mouseState.current && toggleCellAvailability(row, col)}
                  onMouseDown={() => toggleCellAvailability(row, col)}
                ></Box>
              </Box>
            );
          }}
        />
        <Box display="flex" justifyContent="left" alignItems="center" height="18%" mt={2} mb={1}>
          <AvailabilityList
            title="Your Availability Options"
            inner={editAvailabilityOptions.map((option, index) => (
              <Button
                size="small"
                key={index}
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                }}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  backgroundColor: 'transparent',
                  pointerEvents: 'auto',
                  minWidth: 'fit-content', // Add this
                  whiteSpace: 'nowrap', // Add this
                  flexShrink: 0, // Add this
                  '&:hover': {
                    color: option.color || 'white',
                    borderColor: option.color || 'white',
                    backgroundColor: option.bgColor || 'rgba(255, 255, 255, 0.1)'
                  },
                  marginX: 1,
                  marginY: 0.2
                }}
              >
                {option.label}
              </Button>
            ))}
          />
        </Box>
      </Box>
      <Box
        onClick={(e) => e.stopPropagation()}
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
              <Box
                onMouseEnter={() => onCellSelect(row, col)}
                onMouseLeave={() => {
                  cellSelectedRef.current = null;
                  updatePanels({});
                }}
                p={0.5}
              >
                <Box
                  sx={{
                    borderRadius: 1,
                    bgcolor: `rgba(244, 67, 54, ${(availabilities[col][row].length / totalUsers) * 0.8})`,
                    width: '100%',
                    height: '100%',
                    minHeight: 40,
                    display: 'flex',
                    transition: 'background-color 100ms ease-in-out'
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
          <AvailabilityList
            title="Availability Options"
            inner={availabilityOptions.map((option, index) => (
              <Button
                size="small"
                key={index}
                variant="outlined"
                disabled={option.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                }}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  backgroundColor: 'transparent',
                  pointerEvents: 'auto',
                  minWidth: 'fit-content', // Add this
                  whiteSpace: 'nowrap', // Add this
                  flexShrink: 0, // Add this
                  '&:hover': {
                    color: 'white',
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  marginX: 1,
                  marginY: 0.2
                }}
              >
                {option.label}
              </Button>
            ))}
          />
          <ParticipantLists />
        </Box>
      </Box>
    </Box>
  );
};

export default AvailabilityPanel;
