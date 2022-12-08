/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useCheckDescriptionBullet } from '../hooks/description-bullets.hooks';
import { useAuth } from '../hooks/auth.hooks';
import { Tooltip } from '@mui/material';
import { User } from 'shared';

export type CheckListItem = {
  id: number;
  detail: string;
  resolved: boolean;
  user?: User;
  dateAdded?: Date;
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
            <FormControlLabel
              key={idx}
              control={<Checkbox checked={check.resolved} disabled={isDisabled} onChange={() => handleCheck(idx)} />}
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
          </Tooltip>
        ))}
      </FormControl>
    </PageBlock>
  );
};

export default CheckList;
