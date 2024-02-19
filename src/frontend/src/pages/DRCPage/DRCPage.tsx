/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PageLayout from '../../components/PageLayout';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { isGuest } from 'shared';
import MonthSelector from './MonthSelector';

const DRCPage = () => {
  const user = useCurrentUser();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const unconfirmedDRSDropdown = (
    <>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="unconfirmed-drs-dropdown"
        onClick={handleClick}
      >
        My Unconfirmed DRS
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem onClick={() => history.push(routes.NEW_REIMBURSEMENT_REQUEST)} disabled={isGuest(user.role)}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          Mock Data
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <PageLayout title="Design Review Calendar" headerRight={unconfirmedDRSDropdown}>
      <MonthSelector
        displayMonth={displayMonth}
        setDisplayMonth={(date) => {
          console.log(date);
          setDisplayMonth(date);
        }}
      ></MonthSelector>
      <Typography>{displayMonth.toString()}</Typography>
    </PageLayout>
  );
};

export default DRCPage;
