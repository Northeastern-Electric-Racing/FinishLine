import { DesignReview, DesignReviewStatus, User } from 'shared';
import NERModal from '../components/NERModal';
import { Box, FormControlLabel, Grid, IconButton, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import { DesignReviewDelayModal } from '../components/DesignReviewDelayModal';
import { DesignReviewPill } from '../components/DesignReviewPill';
import { DesignReviewMemberPill } from '../components/DesignReviewMemberPill';
import NERFailButton from '../components/NERFailButton';
import NERSuccessButton from '../components/NERSuccessButton';
import { NERButton } from '../components/NERButton';
import StageGateWorkPackageModalContainer from './WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import { meetingDatePipe, meetingStartTimePipe } from '../utils/pipes';
import { useCurrentUser } from '../hooks/users.hooks';
import { useToast } from '../hooks/toasts.hooks';
import { getTeamTypeIcon } from '../utils/design-review.utils';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  const [requiredMembers, setRequiredMembers] = useState<User[]>(designReview.requiredMembers);
  const [optionalMembers, setOptionalMembers] = useState<User[]>(designReview.optionalMembers);
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const currentUser = useCurrentUser();
  const toast = useToast();
  const handleRemoveRequiredMember = (user: User) => {
    if (2 === 2) {
      setRequiredMembers(requiredMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
  };

  const handleRemoveOptionalMember = (user: User) => {
    if (2 === 2) {
      setOptionalMembers(optionalMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
  };

  const ModalButtons: React.FC = () => (
    <Box
      sx={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <NERButton
        sx={{
          textTransform: 'uppercase',
          color: '#474849',
          backgroundColor: '#d9d9d9',
          ':hover': { backgroundColor: '#A4A4A4' },
          fontSize: 10,
          marginLeft: 1,
          fontWeight: 'bold'
        }}
        disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
      >
        Schedule Another DR
      </NERButton>
      <NERSuccessButton
        sx={{
          fontSize: 10,
          marginLeft: 1,
          fontWeight: 'bold'
        }}
        onClick={() => setShowStageGateModal(true)}
        disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
      >
        Stage Gate
      </NERSuccessButton>
      <NERFailButton
        sx={{
          fontSize: 10,
          marginLeft: 1,
          fontWeight: 'bold'
        }}
        onClick={() => setShowDelayModal(true)}
        disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
      >
        Request Delay to WP
      </NERFailButton>
    </Box>
  );

  const CheckBoxForm: React.FC = () => (
    <FormControlLabel
      label="Mark Design Review as Complete"
      sx={{ marginBottom: 5 }}
      control={
        <Checkbox
          checked={checked}
          onChange={handleChange}
          sx={{
            color: 'inherit',
            '&.Mui-checked': { color: 'inherit' }
          }}
        />
      }
    />
  );

  const MembersGrid: React.FC = () => (
    <Box marginLeft="15px">
      <Grid container direction="row" paddingY="20px">
        <Grid item xs={12}>
          <Grid container>
            <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
              <Typography>Required: </Typography>
            </Grid>
            <Grid item xs={10}>
              <Grid container>
                {requiredMembers.map((member, index) => (
                  <Grid item key={index}>
                    <DesignReviewMemberPill
                      user={member}
                      handleClick={() => {
                        handleRemoveRequiredMember(member);
                      }}
                    />
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
                  {optionalMembers.map((member, index) => (
                    <Grid item key={index}>
                      <DesignReviewMemberPill
                        user={member}
                        handleClick={() => {
                          handleRemoveOptionalMember(member);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  const SummaryDetails: React.FC = () => (
    <Grid container direction="row" alignItems="center" justifyContent="center" columnSpacing={1}>
      <Grid item xs={3}>
        <DesignReviewPill
          icon={<AccessTimeIcon />}
          isLink={false}
          displayText={`${meetingDatePipe(designReview.dateCreated)} ${meetingStartTimePipe(designReview.meetingTimes)}`}
        />
      </Grid>
      <Grid item xs={3}>
        <DesignReviewPill icon={<LocationOnIcon />} isLink={false} displayText={designReview.location ?? 'Online'} />
      </Grid>
      <Grid item xs={3}>
        <DesignReviewPill
          isLink
          icon={<DescriptionIcon />}
          linkURL={designReview.docTemplateLink ?? ''}
          displayText={designReview.docTemplateLink ? 'Questions Doc' : 'No Doc'}
        />
      </Grid>
      <Grid item xs={3}>
        <DesignReviewPill
          isLink
          icon={<VideocamIcon />}
          linkURL={designReview.zoomLink ?? ''}
          displayText={designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}
        />
      </Grid>
    </Grid>
  );

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={designReview.wbsName}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
    >
      <IconButton sx={{ position: 'absolute', right: 16, top: 12 }}>
        <EditIcon />
      </IconButton>
      <StageGateWorkPackageModalContainer
        wbsNum={designReview.wbsNum}
        modalShow={showStageGateModal}
        handleClose={() => setShowStageGateModal(false)}
        hideStatus
      />
      <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />

      <Grid container direction="column">
        <Grid item>
          <SummaryDetails />
        </Grid>

        <Grid item>
          <MembersGrid />
        </Grid>

        <Grid item>
          <CheckBoxForm />
        </Grid>

        <Grid item>
          <ModalButtons />
        </Grid>
      </Grid>
    </NERModal>
  );
};

export default DRCSummaryModal;
