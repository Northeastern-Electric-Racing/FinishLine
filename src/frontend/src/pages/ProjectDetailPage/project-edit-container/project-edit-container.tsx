/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SyntheticEvent, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { DescriptionBullet, Project, WorkPackage } from 'shared';
import { wbsPipe } from '../../../pipes';
import { routes } from '../../../routes';
import { useEditSingleProject } from '../../../services/projects.hooks';
import { useAllUsers } from '../../../services/users.hooks';
import { useAuth } from '../../../services/auth.hooks';
import { EditableTextInputListUtils } from '../../CreateWorkPackagePage/create-wp-form';
import EditableTextInputList from '../../../components/editable-text-input-list/editable-text-input-list';
import PageTitle from '../../../layouts/page-title/page-title';
import ProjectEditDetails from './project-edit-details/project-edit-details';
import EditModeOptions from './edit-mode-options/edit-mode-options';
import ProjectEditSummary from './project-edit-summary/project-edit-summary';
import PageBlock from '../../../layouts/page-block/page-block';
import ChangesList from '../../../components/changes-list/changes-list';
import ErrorPage from '../../../pages/ErrorPage/error-page';
import LoadingIndicator from '../../../components/loading-indicator/loading-indicator';
import WorkPackageSummary from '../project-view-container/work-package-summary/work-package-summary';

/**
 * Helper function to turn DescriptionBullets into a list of { id:number, detail:string }.
 */
const bulletsToObject = (bullets: DescriptionBullet[]) =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { id: bullet.id, detail: bullet.detail };
    });

interface ProjectEditContainerProps {
  proj: Project;
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ proj, exitEditMode }) => {
  const auth = useAuth();
  const allUsers = useAllUsers();
  const { mutateAsync } = useEditSingleProject(proj.wbsNum);

  const [crId, setCrId] = useState(-1);
  const [name, setName] = useState(proj.name);
  const [summary, setSummary] = useState(proj.summary);
  const [budget, setBudget] = useState(proj.budget);
  const [wbsElementStatus, setWbsElementStatus] = useState(proj.status);
  const [projectLead, setProjectLead] = useState(proj.projectLead?.userId);
  const [projectManager, setProjectManager] = useState(proj.projectManager?.userId);

  const [slideDeck, setSlideDeck] = useState(proj.slideDeckLink);
  const [taskList, setTaskList] = useState(proj.taskListLink);
  const [bom, setBom] = useState(proj.bomLink);
  const [gDrive, setGDrive] = useState(proj.gDriveLink);

  const updateSlideDeck = (url: string | undefined) => setSlideDeck(url);
  const updateTaskList = (url: string | undefined) => setTaskList(url);
  const updateBom = (url: string | undefined) => setBom(url);
  const updateGDrive = (url: string | undefined) => setGDrive(url);

  const [goals, setGoals] = useState<{ id?: number; detail: string }[]>(
    bulletsToObject(proj.goals)
  );
  const [features, setFeatures] = useState<{ id?: number; detail: string }[]>(
    bulletsToObject(proj.features)
  );
  const [otherConstraints, setOther] = useState<{ id?: number; detail: string }[]>(
    bulletsToObject(proj.otherConstraints)
  );
  const [rules, setRules] = useState(proj.rules);

  const notEmptyString = (s: string) => s !== '';

  const goalsUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = goals.slice();
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString))
        clone.push({ detail: val });
      setGoals(clone);
    },
    remove: (idx) => {
      const clone = goals.slice();
      clone.splice(idx, 1);
      setGoals(clone);
    },
    update: (idx, val) => {
      const clone = goals.slice();
      clone[idx].detail = val;
      setGoals(clone);
    }
  };

  const featUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = features.slice();
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString))
        clone.push({ detail: val });
      setFeatures(clone);
    },
    remove: (idx) => {
      const clone = features.slice();
      clone.splice(idx, 1);
      setFeatures(clone);
    },
    update: (idx, val) => {
      const clone = features.slice();
      clone[idx].detail = val;
      setFeatures(clone);
    }
  };

  const ocUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = otherConstraints.slice();
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString))
        clone.push({ detail: val });
      setOther(clone);
    },
    remove: (idx) => {
      const clone = otherConstraints.slice();
      clone.splice(idx, 1);
      setOther(clone);
    },
    update: (idx, val) => {
      const clone = otherConstraints.slice();
      clone[idx].detail = val;
      setOther(clone);
    }
  };

  const rulesUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = rules.slice();
      if (clone.length === 0 || clone.every(notEmptyString)) clone.push(val);
      setRules(clone);
    },
    remove: (idx) => {
      const clone = rules.slice();
      clone.splice(idx, 1);
      setRules(clone);
    },
    update: (idx, val) => {
      const clone = rules.slice();
      clone[idx] = val;
      setRules(clone);
    }
  };

  const isValidURL = (url: string | undefined) => {
    if (url !== undefined) {
      try {
        new URL(url);
        return true;
      } catch (_) {
        alert('Invalid URL provided.');
      }
    } else {
      alert('URL not provided.');
    }
    return false;
  };

  const checkValidity = () => {
    return [slideDeck, taskList, bom, gDrive].every(isValidURL);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    const { userId } = auth.user!;

    const payload = {
      projectId: proj.id,
      crId,
      name,
      userId,
      budget,
      summary,
      rules,
      goals,
      features,
      otherConstraints,
      wbsElementStatus,
      googleDriveFolderLink: gDrive,
      slideDeckLink: slideDeck,
      bomLink: bom,
      taskListLink: taskList,
      projectLead: projectLead === -1 ? undefined : projectLead,
      projectManager: projectManager === -1 ? undefined : projectManager
    };

    try {
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  if (allUsers.isLoading) return <LoadingIndicator />;

  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  return (
    <Container fluid className="mb-5">
      <Form onSubmit={handleSubmit}>
        <PageTitle
          title={`${wbsPipe(proj.wbsNum)} - ${proj.name}`}
          previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
          actionButton={
            <Form.Control
              type="number"
              placeholder="Change Request ID #"
              required
              min={0}
              onChange={(e) => setCrId(Number(e.target.value))}
            />
          }
        />
        <ProjectEditDetails
          project={proj}
          users={allUsers.data!.filter((u) => u.role !== 'GUEST')}
          updateSlideDeck={updateSlideDeck}
          updateTaskList={updateTaskList}
          updateBom={updateBom}
          updateGDrive={updateGDrive}
          updateName={setName}
          updateBudget={(val: string) => setBudget(Number(val))}
          updateStatus={setWbsElementStatus}
          updateProjectLead={setProjectLead}
          updateProjectManager={setProjectManager}
        />
        <ProjectEditSummary project={proj} updateSummary={setSummary} />
        <PageBlock title={'Goals'}>
          <EditableTextInputList
            items={goals.map((goal) => goal.detail)}
            add={goalsUtil.add}
            remove={goalsUtil.remove}
            update={goalsUtil.update}
          />
        </PageBlock>
        <PageBlock title={'Features'}>
          <EditableTextInputList
            items={features.map((feature) => feature.detail)}
            add={featUtil.add}
            remove={featUtil.remove}
            update={featUtil.update}
          />
        </PageBlock>
        <PageBlock title={'Other Constraints'}>
          <EditableTextInputList
            items={otherConstraints.map((other) => other.detail)}
            add={ocUtil.add}
            remove={ocUtil.remove}
            update={ocUtil.update}
          />
        </PageBlock>
        <PageBlock title={'Rules'}>
          <EditableTextInputList
            items={rules}
            add={rulesUtil.add}
            remove={rulesUtil.remove}
            update={rulesUtil.update}
          />
        </PageBlock>
        <ChangesList changes={proj.changes} />
        <PageBlock title={'Work Packages'}>
          {proj.workPackages.map((ele: WorkPackage) => (
            <div key={wbsPipe(ele.wbsNum)} className="mt-3">
              <WorkPackageSummary workPackage={ele} />
            </div>
          ))}
        </PageBlock>
        <EditModeOptions exitEditMode={exitEditMode} />
      </Form>
    </Container>
  );
};

export default ProjectEditContainer;
