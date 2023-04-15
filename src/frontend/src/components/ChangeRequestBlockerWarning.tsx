/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsPipe, WorkPackage } from 'shared';
import { Dialog, DialogContent, DialogTitle, Grid, Breakpoint, IconButton, useTheme, DialogActions } from '@mui/material';
import NERSuccessButton from '../components/NERSuccessButton';
import NERFailButton from '../components/NERFailButton';
import { Close } from '@mui/icons-material';
import BulletList from './BulletList';

interface BlockerWarningModalProps {
  blockingWorkPackages: WorkPackage[];
  open: boolean;
  onHide: () => void;
  handleContinue: () => Promise<void>;
}

const ChangeRequestWarningModal: React.FC<BlockerWarningModalProps> = ({
  blockingWorkPackages,
  open,
  onHide,
  handleContinue
}: BlockerWarningModalProps) => {
  const theme = useTheme();

  const dialogWidth: Breakpoint = 'md';
  return (
    <Dialog fullWidth maxWidth={dialogWidth} open={open} onClose={onHide}>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '30' }}>
        WARNING: THIS WORK PACKAGE BLOCKS OTHERS
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
              title="The following work packages will be automatically delayed:"
              list={blockingWorkPackages.map((wp) => {
                return '#' + wbsPipe(wp.wbsNum) + ' - ' + wp.projectName + ' - ' + wp.name;
              })}
              readOnly
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <NERFailButton type="submit" variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} onClick={handleContinue}>
          Continue
        </NERSuccessButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRequestWarningModal;
