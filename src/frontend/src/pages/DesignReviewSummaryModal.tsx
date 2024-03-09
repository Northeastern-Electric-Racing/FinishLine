import { DesignReview, DesignReviewStatus } from 'shared';
import NERModal from '../components/NERModal';
import { Box, Button, FormControlLabel, Grid, IconButton, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import { meetingTimePipe } from '../utils/pipes';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import { StageGateModal } from '../components/DesignReviewStageGateModal';
import { DelayModal } from '../components/DesignReviewDelayModal';
import { Pill } from '../components/DesignReviewPill';
import { MemberPill } from '../components/DesignReviewMemberPill';

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
              <Pill icon={<AccessTimeIcon />} isLink={false} displayText={meetingTimePipe(designReview.meetingTimes[0])} />
            </Grid>
            <Grid item xs={3}>
              <Pill icon={<LocationOnIcon />} isLink={false} displayText={designReview.location ?? 'Online'} />
            </Grid>
            <Grid item xs={3}>
              <Pill
                isLink
                icon={<DescriptionIcon />}
                linkText={designReview.docTemplateLink ?? ''}
                displayText={designReview.docTemplateLink ? 'docs' : 'No Doc'}
              />
            </Grid>
            <Grid item xs={3}>
              <Pill
                isLink
                icon={<VideocamIcon />}
                linkText={designReview.zoomLink ?? ''}
                displayText={designReview.zoomLink ? 'zoom.us' : 'No Zoom'}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" paddingY="20px">
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
              disabled={designReview.status !== DesignReviewStatus.DONE}
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
              disabled={designReview.status !== DesignReviewStatus.DONE}
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
              disabled={designReview.status !== DesignReviewStatus.DONE}
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
