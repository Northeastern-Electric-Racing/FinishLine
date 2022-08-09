/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, useState, SyntheticEvent } from 'react';
import { Container, Form } from 'react-bootstrap';
import { WbsNumber, WorkPackage, WbsElementStatus } from 'shared';
import { useAuth } from '../../../services/auth.hooks';
import { useAllUsers } from '../../../services/users.hooks';
import { useEditWorkPackage } from '../../../services/work-packages.hooks';
import { routes } from '../../../routes';
import { wbsPipe } from '../../../pipes';
import EditableTextInputList from '../../../components/editable-text-input-list/editable-text-input-list';
import ErrorPage from '../../../pages/ErrorPage/error-page';
import LoadingIndicator from '../../../components/loading-indicator/loading-indicator';
import PageBlock from '../../../layouts/page-block/page-block';
import PageTitle from '../../../layouts/page-title/page-title';
import { EditableTextInputListUtils } from '../../CreateWorkPackagePage/create-wp-form';
import DependenciesList from '../work-package-view-container/dependencies-list/dependencies-list';
import EditModeOptions from './edit-mode-options/edit-mode-options';
import WorkPackageEditDetails from './work-package-edit-details/work-package-edit-details';

interface WorkPackageEditContainerProps {
  workPackage: WorkPackage;
  exitEditMode: () => void;
}

// Making this an object. Later on more functions can be used that can pass up state from inputs for wiring and such.
export const FormContext = createContext({
  editMode: false,
  setField: (field: string, value: any) => {}
});

const WorkPackageEditContainer: React.FC<WorkPackageEditContainerProps> = ({
  workPackage,
  exitEditMode
}) => {
  const auth = useAuth();
  const { mutateAsync } = useEditWorkPackage(workPackage.wbsNum);
  const { data: userData, isLoading, isError, error } = useAllUsers();

  // states for the form's payload
  const [projectLead, setProjectLead] = useState(workPackage.projectLead?.userId);
  const [projectManager, setProjectManager] = useState(workPackage.projectManager?.userId);
  const [name, setName] = useState<string>(workPackage.name);
  const [crId, setCrId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(workPackage.startDate);
  const [duration, setDuration] = useState<number>(workPackage.duration);
  const [deps, setDeps] = useState<WbsNumber[]>(workPackage.dependencies);
  const [ea, setEa] = useState<{ id: number; detail: string }[]>(
    workPackage.expectedActivities
      .filter((ea) => ea.dateDeleted === undefined)
      .map((ea) => ({
        id: ea.id,
        detail: ea.detail
      }))
  );
  const [dels, setDels] = useState<{ id: number; detail: string }[]>(
    workPackage.deliverables
      .filter((del) => del.dateDeleted === undefined)
      .map((d) => ({
        id: d.id,
        detail: d.detail
      }))
  );
  const [status, setStatus] = useState<WbsElementStatus>(workPackage.status);
  const [progress, setProgress] = useState<number>(workPackage.progress);

  const expectedActivitiesUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = ea.slice();
      clone.push({
        id: -1,
        detail: val
      });
      setEa(clone);
    },
    remove: (idx) => {
      const clone = ea.slice();
      clone.splice(idx, 1);
      setEa(clone);
    },
    update: (idx, val) => {
      const clone = ea.slice();
      clone[idx].detail = val;
      setEa(clone);
    }
  };

  const deliverablesUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = dels.slice();
      clone.push({
        id: -1,
        detail: val
      });
      setDels(clone);
    },
    remove: (idx) => {
      const clone = dels.slice();
      clone.splice(idx, 1);
      setDels(clone);
    },
    update: (idx, val) => {
      const clone = dels.slice();
      clone[idx].detail = val;
      setDels(clone);
    }
  };

  const setters = {
    setProjectLead,
    setProjectManager,
    setName,
    setCrId,
    setStartDate,
    setDuration,
    setDeps,
    setEa,
    setDels,
    setStatus,
    setProgress
  };

  const transformDate = (date: Date) => {
    const month =
      date.getUTCMonth() + 1 < 10
        ? `0${date.getUTCMonth() + 1}`
        : (date.getUTCMonth() + 1).toString();
    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate().toString();
    return `${date.getUTCFullYear().toString()}-${month}-${day}`;
  };

  const transformWbsNum = (wbsNum: WbsNumber) => {
    return {
      carNumber: wbsNum.carNumber,
      projectNumber: wbsNum.projectNumber,
      workPackageNumber: wbsNum.workPackageNumber
    };
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const { userId } = auth.user!;

    const payload = {
      projectLead,
      projectManager,
      workPackageId: workPackage.id,
      userId,
      name,
      crId: parseInt(crId),
      startDate: transformDate(startDate),
      duration,
      dependencies: deps.map((dep) => transformWbsNum(dep)),
      expectedActivities: ea,
      deliverables: dels,
      wbsElementStatus: status,
      progress
    };

    console.log(payload);

    try {
      await mutateAsync(payload);
      exitEditMode();
    } catch (_) {
      return;
    }
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const projectWbsString: string = wbsPipe({ ...workPackage.wbsNum, workPackageNumber: 0 });
  return (
    <Container fluid className="mb-5">
      <Form onSubmit={handleSubmit}>
        <PageTitle
          title={`${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`}
          previousPages={[
            { name: 'Projects', route: routes.PROJECTS },
            { name: projectWbsString, route: `${routes.PROJECTS}/${projectWbsString}` }
          ]}
          actionButton={
            <Form.Control
              type="number"
              placeholder="Change Request ID #"
              min="0"
              required
              onChange={(e) => setCrId(e.target.value.trim())}
            />
          }
        />
        <WorkPackageEditDetails
          workPackage={workPackage}
          users={userData!.filter((u) => u.role !== 'GUEST')}
          setters={setters}
        />
        <DependenciesList dependencies={workPackage.dependencies} setter={setDeps} />
        <PageBlock title="Expected Activities">
          <EditableTextInputList
            items={ea.map((ea) => ea.detail)}
            add={expectedActivitiesUtil.add}
            remove={expectedActivitiesUtil.remove}
            update={expectedActivitiesUtil.update}
          />
        </PageBlock>
        <PageBlock title={'Deliverables'}>
          <EditableTextInputList
            items={dels.map((d) => d.detail)}
            add={deliverablesUtil.add}
            remove={deliverablesUtil.remove}
            update={deliverablesUtil.update}
          />
        </PageBlock>
        <EditModeOptions exitEditMode={exitEditMode} />
      </Form>
    </Container>
  );
};

export default WorkPackageEditContainer;
