import { DesignReview, User } from 'shared';
import NERModal from '../components/NERModal';
import { Box, Button, FormControlLabel, Grid, IconButton, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import { meetingTimePipe } from '../utils/pipes';
import Checkbox from '@mui/material/Checkbox';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

interface chipProps {
  icon: React.ReactNode;
  text: string;
}
const Chip: React.FC<chipProps> = ({ icon, text }) => {
  return (
    <Typography
      sx={{
        fontSize: 13,
        whiteSpace: 'normal',

        display: 'flex',
        alignItems: 'center',
        paddingRight: '5px' // Adjusted paddingRight to create space between icon and text
      }}
    >
      {icon}
      <Typography paddingLeft="5px">{text}</Typography>
    </Typography>
  );
};

const MemberChip: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box sx={{ borderRadius: '11px', backgroundColor: '#d9d9d9', width: 'fit-content', margin: '8px' }}>
      <Typography
        fontSize="15px"
        paddingX="10px"
        paddingY="1px"
        color="#242526"
      >{`${user.firstName} ${user.lastName}`}</Typography>
    </Box>
  );
};

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  return (
    <NERModal open={open} onHide={onHide} title={designReview.teamType.name} hideFormButtons>
      <IconButton sx={{ position: 'absolute', right: 16, top: 12 }}>
        <EditIcon />
      </IconButton>
      <Grid container direction="column">
        <Grid item xs={12}>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item xs={3}>
              <Chip icon={<AccessTimeIcon />} text={designReview.meetingTimes.map(meetingTimePipe).join(', ')} />
            </Grid>
            <Grid item xs={3}>
              <Chip icon={<LocationOnIcon />} text={designReview.location ?? 'Online'} />
            </Grid>
            <Grid item xs={3}>
              <Chip icon={<DescriptionIcon />} text={designReview.docTemplateLink ?? 'No Doc'} />
            </Grid>
            <Grid item xs={3}>
              <Chip icon={<VideocamIcon />} text={designReview.zoomLink ?? 'No Zoom'} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" paddingY="40px">
            <Grid item xs={12}>
              <Grid container>
                <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
                  <Typography>Required: </Typography>
                </Grid>
                <Grid item xs={10}>
                  <Grid container>
                    {designReview.requiredMembers.map((member, index) => (
                      <Grid item key={index}>
                        <MemberChip user={member} />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
                    <Typography>Optional: </Typography>
                  </Grid>
                  <Grid item>
                    <Grid container>
                      {designReview.optionalMembers.map((member, index) => (
                        <Grid item key={index}>
                          <MemberChip user={member} />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            label="Mark Design Review as Complete"
            sx={{ marginBottom: 5 }}
            control={
              <Checkbox
                sx={{
                  color: 'white',
                  '&.Mui-checked': { color: 'white' }
                }}
              />
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              display: 'flex',
              flexDirection: 'row',
              zIndex: 1
            }}
          >
            <Button
              sx={{
                color: '#474849',
                backgroundColor: '#d9d9d9',
                ':hover': { backgroundColor: '#A4A4A4' },
                fontSize: 10,
                marginLeft: 1,
                fontWeight: 'bold'
              }}
            >
              Schedule Another DR
            </Button>
            <Button
              sx={{
                color: '#474849',
                backgroundColor: '#82e94b',
                ':hover': { backgroundColor: '#559334' },
                fontSize: 10,
                marginLeft: 1,
                fontWeight: 'bold'
              }}
            >
              Stage Gate
            </Button>
            <Button
              sx={{
                color: 'white',
                backgroundColor: '#EF4345',
                ':hover': { backgroundColor: '#A72D2D' },
                fontSize: 10,
                marginLeft: 1,
                fontWeight: 'bold'
              }}
            >
              Request Delay to WP
            </Button>
          </Box>
        </Grid>
      </Grid>
    </NERModal>
  );
};

export default DRCSummaryModal;
