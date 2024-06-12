import { Project, WorkPackage } from 'shared';
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
  if (change.type === 'create-project') {
    return <GanttProjectCreateModal project={change.element as Project} handleClose={handleClose} open={open} />;
  } else if (change.type === 'create-work-package') {
    return <GanttWorkPackageCreateModal workPackage={change.element as WorkPackage} handleClose={handleClose} open={open} />;
  }
  return <GanttTimeLineChangeModal change={change} handleClose={handleClose} open={open} />;
};
