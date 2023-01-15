/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isProject, validateWBS, WbsNumber } from 'shared';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateWPFormView from './CreateWPFormView';
import { useQuery } from '../../hooks/utils.hooks';
import { numberParamPipe } from '../../utils/pipes';

export interface EditableTextInputListUtils {
  add: (val: any) => void;
  remove: (idx: number) => void;
  update: (idx: number, val: any) => void;
}

export interface FormStates {
  name: Dispatch<SetStateAction<string>>;
  wbsNum: Dispatch<SetStateAction<string>>;
  crId: Dispatch<SetStateAction<string>>;
  startDate: Dispatch<SetStateAction<Date>>;
  duration: Dispatch<SetStateAction<number>>;
}

const CreateWPForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();
  const query = useQuery();

  const [name, setName] = useState(query.get('name') ?? '');
  const [projectWbsNum, setWbsNum] = useState(query.get('wbs') ?? '');
  const [crId, setCrId] = useState(query.get('crId') || '');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState(numberParamPipe(query.get('duration')) ?? -1);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [expectedActivities, setExpectedActivities] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading) return <LoadingIndicator />;

  const depUtils: EditableTextInputListUtils = {
    add: (val) => {
      const clone = dependencies.slice();
      clone.push(val);
      setDependencies(clone);
    },
    remove: (idx) => {
      const clone = dependencies.slice();
      clone.splice(idx, 1);
      setDependencies(clone);
    },
    update: (idx, val) => {
      const clone = dependencies.slice();
      clone[idx] = val;
      setDependencies(clone);
    }
  };

  const eaUtils: EditableTextInputListUtils = {
    add: (val) => {
      const clone = expectedActivities.slice();
      clone.push(val);
      setExpectedActivities(clone);
    },
    remove: (idx) => {
      const clone = expectedActivities.slice();
      clone.splice(idx, 1);
      setExpectedActivities(clone);
    },
    update: (idx, val) => {
      const clone = expectedActivities.slice();
      clone[idx] = val;
      setExpectedActivities(clone);
    }
  };

  const delUtils: EditableTextInputListUtils = {
    add: (val) => {
      const clone = deliverables.slice();
      clone.push(val);
      setDeliverables(clone);
    },
    remove: (idx) => {
      const clone = deliverables.slice();
      clone.splice(idx, 1);
      setDeliverables(clone);
    },
    update: (idx, val) => {
      const clone = deliverables.slice();
      clone[idx] = val;
      setDeliverables(clone);
    }
  };

  const states = {
    name: setName,
    wbsNum: setWbsNum,
    crId: setCrId,
    startDate: setStartDate,
    duration: setDuration
  };

  const initialValues = {
    name,
    wbsNum: projectWbsNum,
    crId,
    duration
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // exits handleSubmit if form input invalid (should be changed in wire up)
    let wbsNum: WbsNumber;
    try {
      wbsNum = validateWBS(projectWbsNum);

      const { userId } = auth.user!;

      if (!isProject(wbsNum)) {
        alert('Please enter a valid Project WBS Number.');
        return;
      }
      const depWbsNums = dependencies.map((dependency) => {
        const depWbsNum = validateWBS(dependency.trim());
        return {
          carNumber: depWbsNum.carNumber,
          projectNumber: depWbsNum.projectNumber,
          workPackageNumber: depWbsNum.workPackageNumber
        };
      });
      const createdWbsNum = await mutateAsync({
        userId,
        name: name.trim(),
        crId: parseInt(crId),
        projectWbsNum: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber
        },
        startDate,
        duration,
        dependencies: depWbsNums,
        expectedActivities,
        deliverables
      });
      history.push(`${routes.PROJECTS}/${createdWbsNum}`);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        alert(e.message);
      }
    }

    /**
     * need to get
     *  userId,
     *  projectId,
     *  wbsElementIds of dependencies (should be in wbs num format)
     *
     * need to pass down
     *  name
     *  crId
     *  startDate
     *  duration
     *  ea
     *  deliverables
     */
  };

  return (
    <CreateWPFormView
      states={states}
      dependencies={dependencies}
      initialValues={initialValues}
      depUtils={depUtils}
      expectedActivities={expectedActivities}
      eaUtils={eaUtils}
      deliverables={deliverables}
      delUtils={delUtils}
      onSubmit={handleSubmit}
      onCancel={() => history.goBack()}
      allowSubmit={auth.user?.role !== 'GUEST'}
      startDate={startDate}
    />
  );
};

export default CreateWPForm;
