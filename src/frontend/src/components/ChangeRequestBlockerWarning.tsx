/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, TeamPreview, User, WorkPackage } from 'shared';
import { Dialog, DialogContent, DialogTitle, Grid, Breakpoint, Typography, IconButton, useTheme } from '@mui/material';
import NERSuccessButton from '../components/NERSuccessButton';
import NERFailButton from '../components/NERFailButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../hooks/auth.hooks';
import { Close } from '@mui/icons-material';
import BulletList from './BulletList';

interface BlockerWarningModalProps {
  changeRequest: ChangeRequest;
  workPackages: WorkPackage[];
  modalShow: boolean;
  onHide: () => void;
}

const ChangeRequestBlockerWarning: React.FC<BlockerWarningModalProps> = ({
  changeRequest,
  workPackages,
  modalShow,
  onHide
}: BlockerWarningModalProps) => {
  const auth = useAuth();
  const theme = useTheme();

  if (!auth.user) return <LoadingIndicator />;

  const dialogWidth: Breakpoint = 'md';
  const ViewModal: React.FC = () => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '30' }}>
          WARNING: THIS CHANGE REQUEST BLOCKS OTHERS
          <IconButton
            aria-label="close"
            onClick={onHide}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              height: '20px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '20px',
              border: '6px solid transparent',
              backgroundClip: 'content-box'
            }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BulletList
                title={
                  'By changing the timeline impact of this work package you will be delaying the start of the following work packages:'
                }
                list={workPackages.map((wp) => wp.name)}
                readOnly
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };
  return <ViewModal />;
};

export default ChangeRequestBlockerWarning;
