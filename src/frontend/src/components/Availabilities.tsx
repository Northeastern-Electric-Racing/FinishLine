import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { User } from "shared";
import { EnumToArray, HeatmapColors } from "../utils/design-review.utils";
import { fullNamePipe } from "../utils/pipes";
import NERFailButton from "./NERFailButton";
import NERSuccessButton from "./NERSuccessButton";
import WarningIcon from '@mui/icons-material/Warning';

interface AvailabilitiesProps {
    currentAvailableUsers: User[];
    currentUnavailableUsers: User[];
    usersToAvailabilities: Map<User, number[]>;
  }
  
  const Availabilities: React.FC<AvailabilitiesProps> = ({
    currentAvailableUsers,
    currentUnavailableUsers,
    usersToAvailabilities
  }) => {
    const totalUsers = usersToAvailabilities.size;
    const fontSize = totalUsers > 10 ? '1em' : totalUsers > 15 ? '0.8em' : '1.2em';
    const colors = EnumToArray(HeatmapColors);
  
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
  
  export default Availabilities;