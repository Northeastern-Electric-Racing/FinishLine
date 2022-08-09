/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isProject, validateWBS, WbsNumber } from 'shared';
import { useAuth } from '../../services/auth.hooks';
import { useCreateSingleWorkPackage } from '../../services/work-packages.hooks';
import { routes } from '../../routes';
import LoadingIndicator from '../../components/loading-indicator/loading-indicator';
import CreateWPFormView from './create-wp-form/create-wp-form';

export interface EditableTextInputListUtils {
  add: (val: any) => void;
  remove: (idx: number) => void;
  update: (idx: number, val: any) => void;
}

export interface FormStates {
  name: Dispatch<SetStateAction<string>>;
  wbsNum: Dispatch<SetStateAction<string>>;
  crId: Dispatch<SetStateAction<number>>;
  startDate: Dispatch<SetStateAction<string>>;
  duration: Dispatch<SetStateAction<number>>;
}

const CreateWPForm: React.FC = () => {
  const history = useHistory();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [projectWbsNum, setWbsNum] = useState('');
  const [crId, setCrId] = useState(-1);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(-1);
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // exits handleSubmit if form input invalid (should be changed in wire up)
    let wbsNum: WbsNumber;
    try {
      wbsNum = validateWBS(projectWbsNum);

      const { userId } = auth.user!;

      if (!isProject(wbsNum!)) {
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
      await mutateAsync({
        userId,
        name: name.trim(),
        crId,
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
      history.push(routes.CHANGE_REQUESTS);
    } catch (e) {
      console.log(e);
      alert('something went wrong');
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
      depUtils={depUtils}
      expectedActivities={expectedActivities}
      eaUtils={eaUtils}
      deliverables={deliverables}
      delUtils={delUtils}
      onSubmit={handleSubmit}
      onCancel={() => history.goBack()}
      allowSubmit={auth.user?.role !== 'GUEST'}
    />
  );
};

export default CreateWPForm;
