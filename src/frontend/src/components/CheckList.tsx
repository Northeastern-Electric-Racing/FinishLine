/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { ReactNode, useState } from 'react';
import { useCheckDescriptionBullet } from '../hooks/description-bullets.hooks';
import { useAuth } from '../hooks/auth.hooks';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export type CheckListItem = {
  id: number;
  detail: string;
  resolved: boolean;
};

interface CheckListProps {
  title: string;
  headerRight?: ReactNode;
  items: CheckListItem[];
  isDisabled: boolean;
}

const CheckList: React.FC<CheckListProps> = ({ title, headerRight, items, isDisabled }) => {
  const auth = useAuth();
  const { mutateAsync } = useCheckDescriptionBullet();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [currIdx, setCurrIdx] = useState<number>(-1);

  const handleUncheck = async (idx: number) => {
    await handleCheck(idx);
    setShowConfirm(false);
  };

  const handleCheck = async (idx: number) => {
    await mutateAsync({ userId: auth.user!.userId, descriptionId: items[idx].id });
  };

  items.sort((a: CheckListItem, b: CheckListItem) => {
    if (a.resolved !== b.resolved) {
      return a.resolved ? 1 : -1;
    }

    return a.detail.localeCompare(b.detail);
  });

  return (
    <PageBlock title={title} headerRight={headerRight}>
      <FormControl>
        {items.map((check, idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                checked={check.resolved}
                disabled={isDisabled}
                onChange={() => {
                  if (check.resolved) {
                    setCurrIdx(idx);
                    setShowConfirm(true);
                  } else {
                    handleCheck(idx);
                  }
                }}
              />
            }
            label={
              <Typography
                variant="body1"
                component="p"
                sx={check.resolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }}
              >
                {check.detail}
              </Typography>
            }
          />
        ))}
      </FormControl>
      {showConfirm ? (
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>Are you sure you want to mark this completed task as NOT completed?</DialogTitle>
          <DialogActions className="justify-content-around">
            <Button
              onClick={() => handleUncheck(currIdx)}
              type="submit"
              className="mb-3"
              autoFocus
              variant="contained"
              color="success"
            >
              Yes
            </Button>
            <Button onClick={() => setShowConfirm(false)} className="mb-3" variant="contained" color="error">
              No
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </PageBlock>
  );
};

export default CheckList;
