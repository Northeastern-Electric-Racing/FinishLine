/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, wbsPipe } from 'shared';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Breakpoint,
  IconButton,
  useTheme,
  DialogActions,
  Typography
} from '@mui/material';
import NERSuccessButton from './NERSuccessButton';
import NERFailButton from './NERFailButton';
import { Close } from '@mui/icons-material';
import { useGetBlockingWorkPackages } from '../hooks/work-packages.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';

interface BlockerWarningModalProps {
  duration: number;
  // the change request's wbs element; budget change requests have none, so nothing can be blocked
  wbsNum?: WbsNumber;
  open: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
}

const ChangeRequestWarningModal: React.FC<BlockerWarningModalProps> = ({
  duration,
  wbsNum,
  open,
  onHide,
  onSubmit
}: BlockerWarningModalProps) => {
  const theme = useTheme();
  // only fetched once the warning actually opens, rather than every time the review modal mounts
  const {
    data: blockingWorkPackages,
    isLoading,
    isError,
    error
  } = useGetBlockingWorkPackages(wbsNum ?? { carNumber: 0, projectNumber: 0, workPackageNumber: 0 }, open && !!wbsNum);
  const dialogStyle = {
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
  };

  const title = `The following work packages' start dates will be delayed by ${duration} weeks`;
  const list = (blockingWorkPackages ?? []).map((wp) => {
    return '#' + wbsPipe(wp.wbsNum) + ' - ' + wp.projectName + ' - ' + wp.name;
  });
  const listPrepared = list.map((bullet, idx) => <li key={idx}>{bullet}</li>);
  const BuiltList = <ul>{listPrepared}</ul>;

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
      <DialogContent sx={dialogStyle}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>{title}</Typography>
            {isError ? <ErrorPage error={error} /> : isLoading ? <LoadingIndicator /> : BuiltList}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <NERFailButton type="submit" variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} onClick={onSubmit}>
          Continue
        </NERSuccessButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRequestWarningModal;
