import { ChangeRequestType, DesignReview, User, WbsNumber, wbsPipe } from 'shared';
import NERModal from '../components/NERModal';
import { Box, Button, FormControlLabel, Grid, IconButton, Link, TextField, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import { meetingTimePipe } from '../utils/pipes';
import Checkbox from '@mui/material/Checkbox';
import { routes } from '../utils/routes';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import { useAuth } from '../hooks/auth.hooks';
import { useCreateStageGateChangeRequest } from '../hooks/change-requests.hooks';
import { useToast } from '../hooks/toasts.hooks';
import StageGateWorkPackageModal from './WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModal';

// component for regular DR pills
const Pill: React.FC<{
  icon: React.ReactNode;
  text: string;
}> = ({ icon, text }) => {
  return (
    <Typography
      sx={{
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingX: 1,
        width: 'fit-content'
      }}
    >
      {icon}
      <Typography paddingLeft="5px">{text}</Typography>
    </Typography>
  );
};

// component for the DR pills that are links (zoom and docs)
const LinkPill: React.FC<{
  icon: React.ReactNode;
  linkText: string;
  displayText: string;
}> = ({ icon, linkText, displayText }) => {
  return (
    <Typography
      sx={{
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingX: 1,
        width: 'fit-content'
      }}
    >
      {icon}
      <Link target="_blank" sx={{ color: 'white' }} href={linkText} paddingLeft="5px">
        {displayText}
      </Link>
    </Typography>
  );
};

// component for the member pill displaying full name
const MemberPill: React.FC<{ user: User }> = ({ user }) => {
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

interface StageGateModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

export interface FormInput {
  confirmDone: boolean;
}

// stage gate modal component (redacted loading and error for this specific case)
const StageGateModal: React.FC<StageGateModalProps> = ({ wbsNum, modalShow, handleClose }) => {
  const auth = useAuth();
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync } = useCreateStageGateChangeRequest();

  const handleConfirm = async ({ confirmDone }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create stage gate change request without being logged in');
    try {
      await mutateAsync({
        submitterId: auth.user?.userId,
        wbsNum,
        type: ChangeRequestType.StageGate,
        confirmDone
      });
      history.push(routes.CHANGE_REQUESTS);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return <StageGateWorkPackageModal wbsNum={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

// delay wp modal component
const DelayModal: React.FC<{ open: boolean; onHide: () => void; dr: DesignReview }> = ({ open, onHide, dr }) => {
  const toast = useToast();
  const [weeks, setWeeks] = useState<string>('');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '' || parseInt(e.target.value) >= 1) {
      setWeeks(e.target.value);
    } else {
      toast.error('If delaying, it must be by at least 1 week');
    }
  };

  return (
    <NERModal open={open} title="Delay WP" onHide={onHide} hideFormButtons showCloseButton>
      <TextField
        type="number"
        label="Enter number of weeks"
        variant="outlined"
        value={weeks}
        onChange={onChange}
        fullWidth
        margin="normal"
      />
      <Button
        sx={{
          color: 'white',
          backgroundColor: '#EF4345',
          ':hover': { backgroundColor: '#A72D2D' },
          fontSize: 10,
          fontWeight: 'bold',
          marginLeft: '75%',
          marginTop: '10px'
        }}
      >
        <Link
          underline="none"
          color={'text.primary'}
          component={RouterLink}
          to={`${routes.CHANGE_REQUESTS}/new?wbsNum=${wbsPipe(dr.wbsNum)}&timelineDelay=${weeks}`}
        >
          Delay
        </Link>
      </Button>
    </NERModal>
  );
};

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  return (
    <NERModal open={open} onHide={onHide} title={designReview.wbsName} hideFormButtons>
      <StageGateModal
        wbsNum={designReview.wbsNum}
        modalShow={showStageGateModal}
        handleClose={() => setShowStageGateModal(false)}
      />
      <DelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} dr={designReview} />
      <IconButton sx={{ position: 'absolute', right: 16, top: 12 }}>
        <EditIcon />
      </IconButton>

      <Grid container direction="column">
        <Grid item>
          <Grid container direction="row" alignItems="center" justifyContent="center" columnSpacing={1}>
            <Grid item xs={3}>
              <Pill icon={<AccessTimeIcon />} text={designReview.meetingTimes.map(meetingTimePipe).join(', ')} />
            </Grid>
            <Grid item xs={3}>
              <Pill icon={<LocationOnIcon />} text={designReview.location ?? 'Online'} />
            </Grid>
            <Grid item xs={3}>
              <LinkPill
                icon={<DescriptionIcon />}
                linkText={designReview.docTemplateLink ?? ''}
                displayText={designReview.docTemplateLink ? 'docs' : 'No Doc'}
              />
            </Grid>
            <Grid item xs={3}>
              <LinkPill
                icon={<VideocamIcon />}
                linkText={designReview.zoomLink ?? ''}
                displayText={designReview.zoomLink ? 'zoom.us' : 'No Zoom'}
              />
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
                        <MemberPill user={member} />
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
                          <MemberPill user={member} />
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
              bottom: 10,
              right: 10,
              display: 'flex',
              flexDirection: 'row'
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
              onClick={() => setShowStageGateModal(true)}
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
              onClick={() => setShowDelayModal(true)}
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
