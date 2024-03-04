import { DesignReview, User } from 'shared';
import NERModal from '../components/NERModal';
import { Box, Grid, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { meetingTimePipe } from '../utils/pipes';
import NERFormModal from '../components/NERFormModal';

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
      sx={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
      paddingX="10px"
    >
      {icon}
      <Typography paddingLeft="5px">{text}</Typography>
    </Typography>
  );
};

const MemberChip: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box sx={{ borderRadius: '9px', backgroundColor: 'white', width: 'fit-content', margin: '8px' }}>
      <Typography fontSize="15px" paddingX="8px" color="#242526">{`${user.firstName} ${user.lastName}`}</Typography>
    </Box>
  );
};

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  if (!designReview) {
    return null;
  }

  return (
    <NERModal open={open} onHide={onHide} title={designReview.teamType.name} showCloseButton>
      <Grid container direction="row">
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
      <Grid container direction="row" paddingY="40px">
        <Grid item xs={12}>
          <Grid container sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid item xs={2}>
              <Typography>Required: </Typography>
            </Grid>
            <Grid item xs={10}>
              <Grid container spacing={0}>
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
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Optional: </Typography>
              </Grid>
              <Grid item xs={10}>
                <Grid container spacing={0}>
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
    </NERModal>
  );
};

export default DRCSummaryModal;
