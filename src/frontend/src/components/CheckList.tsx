/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useCheckDescriptionBullet } from '../hooks/description-bullets.hooks';
import { useAuth } from '../hooks/auth.hooks';
import { Tooltip } from '@mui/material';
import { User } from 'shared';
import NERModal from './NERModal';

export type CheckListItem = {
  id: number;
  detail: string;
  resolved: boolean;
  user?: User;
  dateAdded?: Date;
};

interface CheckListProps {
  title: string;
  items: CheckListItem[];
  isDisabled: boolean;
}

const CheckList: React.FC<CheckListProps> = ({ title, items, isDisabled }) => {
  const auth = useAuth();
  const { isLoading, mutateAsync } = useCheckDescriptionBullet();
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
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <FormControl>
        {items.map((check, idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                checked={check.resolved}
                disabled={isDisabled || isLoading}
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
              <Tooltip
                id={`check-item-${idx}`}
                title={
                  check.resolved
                    ? `${check.user?.firstName} ${check.user?.lastName} on ${check.dateAdded?.toLocaleDateString()}`
                    : ''
                }
                placement="right"
                arrow
              >
                <Typography
                  variant="body1"
                  component="p"
                  sx={check.resolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }}
                >
                  {check.detail}
                </Typography>
              </Tooltip>
            }
          />
        ))}
      </FormControl>
      <NERModal
        open={showConfirm}
        onHide={() => setShowConfirm(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={() => handleUncheck(currIdx)}
      >
        <Typography>Are you sure you want to mark this completed task as NOT completed?</Typography>
      </NERModal>
    </>
  );
};

export default CheckList;
