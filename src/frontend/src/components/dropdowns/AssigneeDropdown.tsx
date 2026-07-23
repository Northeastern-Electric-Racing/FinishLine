/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { useSlimUsers } from '../../hooks/dropdowns.hooks';
import DropdownSelect from './DropdownSelect';

interface AssigneeDropdownProps {
  /** selected user ids */
  value: string[];
  onChange: (userIds: string[]) => void;
  sx?: SxProps<Theme>;
}

/** Reusable multi-select of org members (FilterTaskArgs.memberIds). */
const AssigneeDropdown: React.FC<AssigneeDropdownProps> = ({ value, onChange, sx }) => {
  const { data: users, isLoading } = useSlimUsers();

  const options = (users ?? []).map((user) => ({ key: user.userId, label: `${user.firstName} ${user.lastName}` }));

  return (
    <DropdownSelect
      label="Assignee"
      placeholder="Filter by assignee"
      options={options}
      selectedKeys={value}
      onChange={onChange}
      loading={isLoading}
      sx={sx}
    />
  );
};

export default AssigneeDropdown;
