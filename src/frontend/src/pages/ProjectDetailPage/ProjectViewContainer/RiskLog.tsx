/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Risk } from 'shared';
import { FormEvent, useState } from 'react';
import PageBlock from '../../../layouts/PageBlock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogContent,
  TextField,
  DialogTitle,
  DialogActions,
  Tooltip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import styles from '../../../stylesheets/components/check-list.module.css';
import {
  useCreateSingleRisk,
  useEditSingleRisk,
  useDeleteSingleRisk,
  useGetRisksForProject
} from '../../../hooks/risks.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { routes } from '../../../utils/Routes';
import { wbsPipe } from '../../../utils/Pipes';
import { useHistory } from 'react-router';
import { WbsNumber, User } from 'shared';
interface RiskLogProps {
  projectId: number;
  wbsNum: WbsNumber;
  projLead?: User;
  projManager?: User;
}

const sortRisksByDate = (a: Risk, b: Risk) => {
  return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
};

const RiskLog: React.FC<RiskLogProps> = ({ projectId, wbsNum, projLead, projManager }) => {
  const history = useHistory();
  const auth = useAuth();
  const { mutateAsync: createMutateAsync } = useCreateSingleRisk();
  const { mutateAsync: editMutateAsync } = useEditSingleRisk();
  const { mutateAsync: deleteMutateAsync } = useDeleteSingleRisk();
  const [newDetail, setNewDetail] = useState('');
  const [show, setShow] = useState(false);
  const risksQuery = useGetRisksForProject(projectId);

  if (risksQuery.isLoading || !auth.user) return <LoadingIndicator />;

  const { userId, role } = auth.user;

  const hasPermissions =
    role === 'ADMIN' ||
    role === 'APP_ADMIN' ||
    role === 'LEADERSHIP' ||
    projLead?.userId === userId ||
    projManager?.userId === userId;

  const risks = [
    ...risksQuery.data!.filter((r) => !r.dateDeleted && !r.isResolved).sort(sortRisksByDate),
    ...risksQuery.data!.filter((r) => !r.dateDeleted && r.isResolved).sort(sortRisksByDate)
  ];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = async (risk: Risk) => {
    const payload = {
      userId: userId,
      id: risk.id,
      detail: risk.detail,
      resolved: !risk.isResolved
    };
    try {
      await editMutateAsync(payload);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
        alert(e.message);
      }
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      projectId: projectId,
      createdById: userId,
      detail: newDetail
    };

    try {
      await createMutateAsync(payload);
      handleClose();
      setNewDetail('');
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const payload = {
      riskId: id,
      deletedByUserId: userId
    };

    try {
      await deleteMutateAsync(payload);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const ConvertToCRButton = (risk: Risk) => {
    return (
      role !== 'GUEST' && (
        <Tooltip title="Convert to CR" placement="top">
          <Button
            variant="contained"
            color="success"
            data-testId="convertButton"
            onClick={() => {
              history.push(
                routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(wbsNum) + '&riskDetails=' + encodeURIComponent(risk.detail)
              );
            }}
          >
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Button>
        </Tooltip>
      )
    );
  };

  const DeleteRiskButton = (risk: Risk) => {
    return (
      <Tooltip title="Delete Risk" placement="top">
        <Button
          variant="contained"
          color="error"
          data-testId={`deleteButton-${risk.id}`}
          disabled={!hasPermissions && risk.createdBy.userId !== userId}
          onClick={() => handleDelete(risk.id)}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
        </Button>
      </Tooltip>
    );
  };

  return (
    <PageBlock title={'Risk Log'}>
      <div className={styles.parentContainer}>
        {risks.map((risk, idx) => (
          <div key={idx} className={styles.container}>
            {hasPermissions ? (
              <FormControlLabel
                label={
                  <p style={risk.isResolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }}>
                    {risk.detail}
                  </p>
                }
                control={
                  <Checkbox
                    checked={risk.isResolved}
                    data-testId={`testCheckbox${idx}`}
                    onChange={() => handleCheck(risk)}
                  />
                }
              />
            ) : (
              <li style={risk.isResolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }} className="mb-3">
                {risk.detail}
              </li>
            )}
            {risk.isResolved ? DeleteRiskButton(risk) : ConvertToCRButton(risk)}
          </div>
        ))}
        {role !== 'GUEST' && (
          <Button color="success" variant="outlined" onClick={handleShow} data-testId="createButton">
            Add New Risk
          </Button>
        )}
      </div>
      <Dialog open={show} onClose={handleClose} fullWidth>
        <form onSubmit={handleCreate}>
          <DialogTitle>Add New Risk</DialogTitle>
          <DialogContent>
            <TextField
              required
              autoFocus
              margin="dense"
              id="newRisk"
              label="Add New Risk"
              type="text"
              maxRows={5}
              multiline
              fullWidth
              onChange={(e) => setNewDetail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button type="submit">Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageBlock>
  );
};

export default RiskLog;
