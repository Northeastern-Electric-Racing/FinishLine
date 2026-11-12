import { GanttProjectTask, BaseWbsElement, ProjectGanttItem } from 'shared';
import { RequestEventChange } from '../../../../utils/gantt.utils';
import { GanttProjectCreateModal } from './GanttProjectCreateModal';
import { GanttTimeLineChangeModal } from './GanttTimeLineChangeModal';

export interface GanttRequestChangeModalProps {
  change: RequestEventChange<BaseWbsElement | GanttProjectTask>;
  handleClose: (didCancel: boolean) => void;
  open: boolean;
}

interface GanttRequestChangeModalWithOriginalsProps extends GanttRequestChangeModalProps {
  // the projects as the server sent them, before any edits on the chart
  originalProjects: ProjectGanttItem[];
}

export const GanttRequestChangeModal = ({
  change,
  handleClose,
  open,
  originalProjects
}: GanttRequestChangeModalWithOriginalsProps) => {
  switch (change.type) {
    case 'create-task':
      return <GanttProjectCreateModal change={change} handleClose={handleClose} open={open} />;
    case 'edit-task':
      return (
        <GanttTimeLineChangeModal
          change={change}
          handleClose={handleClose}
          open={open}
          originalProject={originalProjects.find((project) => project.id === (change.element as ProjectGanttItem).id)}
        />
      );
  }
};
