/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SyntheticEvent, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { DescriptionBullet, Project, WorkPackage, WbsElementStatus } from 'shared';
import { fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import { EditableTextInputListUtils } from '../../CreateWorkPackagePage/CreateWPForm';
import EditableTextInputList from '../../../components/EditableTextInputList';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import ProjectEditDetails from './ProjectEditDetails';
import EditModeOptions from './EditModeOptions';
import ProjectEditSummary from './ProjectEditSummary';
import PageBlock from '../../../layouts/PageBlock';
import ChangesList from '../../../components/ChangesList';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import WorkPackageSummary from '../ProjectViewContainer/WorkPackageSummary';
import { useQuery } from '../../../hooks/utils.hooks';
import { Controller, useForm } from 'react-hook-form';
import { Grid, TextField, Select, MenuItem } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * Helper function to turn DescriptionBullets into a list of { id:number, detail:string }.
 */
const bulletsToObject = (bullets: DescriptionBullet[]) =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { id: bullet.id, detail: bullet.detail };
    });

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

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const auth = useAuth();
  const query = useQuery();
  const allUsers = useAllUsers();
  const { handleSubmit, control } = useForm();
  const { mutateAsync } = useEditSingleProject(project.wbsNum);

  const [crId, setCrId] = useState(query.get('crId') || '');
  const [name, setName] = useState(project.name);
  const [summary, setSummary] = useState(project.summary);
  const [budget, setBudget] = useState(project.budget);
  const [wbsElementStatus, setWbsElementStatus] = useState(project.status);
  const [projectLead, setProjectLead] = useState(project.projectLead?.userId);
  const [projectManager, setProjectManager] = useState(project.projectManager?.userId);

  const [slideDeck, setSlideDeck] = useState(project.slideDeckLink);
  const [taskList, setTaskList] = useState(project.taskListLink);
  const [bom, setBom] = useState(project.bomLink);
  const [gDrive, setGDrive] = useState(project.gDriveLink);

  const updateSlideDeck = (url: string | undefined) => setSlideDeck(url);
  const updateTaskList = (url: string | undefined) => setTaskList(url);
  const updateBom = (url: string | undefined) => setBom(url);
  const updateGDrive = (url: string | undefined) => setGDrive(url);

  const [goals, setGoals] = useState<{ id?: number; detail: string }[]>(bulletsToObject(project.goals));
  const [features, setFeatures] = useState<{ id?: number; detail: string }[]>(bulletsToObject(project.features));
  const [otherConstraints, setOther] = useState<{ id?: number; detail: string }[]>(
    bulletsToObject(project.otherConstraints)
  );
  const [rules, setRules] = useState(project.rules);

  const notEmptyString = (s: string) => s !== '';

  const goalsUtil: EditableTextInputListUtils = {
    add: (val) => {
      const clone = goals.slice();
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString)) clone.push({ detail: val });
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
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString)) clone.push({ detail: val });
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
      if (clone.length === 0 || clone.map((c) => c.detail).every(notEmptyString)) clone.push({ detail: val });
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

  const checkValidity = () => {
    return [slideDeck, taskList, bom, gDrive].every(isValidURL);
  };

  const onSubmit = async (data: any) => {
    if (checkValidity() === false) {
      return;
    }

    const { userId } = auth.user!;

    const payload = {
      projectId: project.id,
      crId: Number(crId),
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

  if (allUsers.isLoading || !allUsers.data) return <LoadingIndicator />;

  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const users = allUsers.data!.filter((u) => u.role !== 'GUEST');

  const old = (
    <Container fluid className="mb-5">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <PageTitle
          title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
          previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
          actionButton={
            <Form.Control
              type="number"
              placeholder="Change Request ID #"
              required
              value={crId}
              min={0}
              onChange={(e) => setCrId(String(e.target.value))}
            />
          }
        />
        <ProjectEditDetails
          project={project}
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
        <ProjectEditSummary project={project} updateSummary={setSummary} />
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
          <EditableTextInputList items={rules} add={rulesUtil.add} remove={rulesUtil.remove} update={rulesUtil.update} />
        </PageBlock>
        <ChangesList changes={project.changes} />
        <PageBlock title={'Work Packages'}>
          {project.workPackages.map((ele: WorkPackage) => (
            <div key={wbsPipe(ele.wbsNum)} className="mt-3">
              <WorkPackageSummary workPackage={ele} />
            </div>
          ))}
        </PageBlock>
        <EditModeOptions exitEditMode={exitEditMode} />
      </Form>
    </Container>
  );

  const statuses = Object.values(WbsElementStatus);
  const statusSelect = (
    <Grid item sx={{ mb: 1 }}>
      <Controller
        name="status"
        control={control}
        rules={{ required: true }}
        defaultValue={project.status}
        render={({ field: { onChange, value } }) => (
          <Select onChange={onChange} value={value}>
            {statuses.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </Grid>
  );

  return (
    <form>
      <PageTitle
        title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        actionButton={
          <ReactHookTextField name="crId" control={control} label="Change Request Id" sx={{}} type="number" size="small" />
        }
      />
      <PageBlock title={'Project Details'}>
        <Grid item xs={12} sm={12}>
          {statusSelect}
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactHookTextField
            name="name"
            control={control}
            defaultValue={project.name}
            sx={{ width: '50%' }}
            label="Project Name"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactHookTextField
            name="budget"
            control={control}
            defaultValue={project.budget}
            sx={{ width: '15%' }}
            type="number"
            label="Budget"
            icon={<AttachMoneyIcon />}
          />
        </Grid>
        <Grid item>
          <Controller
            name="projectLeadId"
            control={control}
            rules={{ required: true }}
            defaultValue={project.projectLead?.userId}
            render={({ field: { onChange, value } }) => (
              <Select onChange={onChange} value={value}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="projectManagerId"
            control={control}
            rules={{ required: true }}
            defaultValue={project.projectManager?.userId}
            render={({ field: { onChange, value } }) => (
              <Select onChange={onChange} value={value}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>
      </PageBlock>
    </form>
  );
};

export default ProjectEditContainer;
