import { validateWBS } from 'shared';
import { RequestEventChange } from '../../../../utils/gantt.utils';
import { GanttProjectCreateModal } from './GanttProjectCreateModal';
import { GanttTimeLineChangeModal } from './GanttTimeLineChangeModal';
import { GanttWorkPackageCreateModal } from './GanttWorkPackageCreateModal';

interface GanttRequestChangeModalProps {
  change: RequestEventChange;
  handleClose: () => void;
  open: boolean;
}

export const GanttRequestChangeModal = ({ change, handleClose, open }: GanttRequestChangeModalProps) => {
  if (change.createProject) {
    return <GanttProjectCreateModal change={change} handleClose={handleClose} open={open} />;
  }
  try {
    validateWBS(change.eventId);
    return <GanttTimeLineChangeModal change={change} handleClose={handleClose} open={open} />;
  } catch {
    return <GanttWorkPackageCreateModal change={change} handleClose={handleClose} open={open} />;
  }
};
