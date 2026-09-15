import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PopUp } from 'shared';
import PopUpCard from './PopUpCard';
import { useHistory } from 'react-router-dom';
import { useCurrentUserPopUps, useRemoveUserPopUp } from '../hooks/pop-ups.hooks';

const PopUpAlert: React.FC = () => {
  const { data: popUps, isLoading: popUpsIsLoading } = useCurrentUserPopUps();
  const { mutateAsync: removePopUp, isLoading: removeIsLoading } = useRemoveUserPopUp();
  const [currentPopUp, setCurrentPopUp] = useState<PopUp>();
  const history = useHistory();

  useEffect(() => {
    if (popUps && popUps.length > 0) {
      setCurrentPopUp(popUps[0]);
    }
  }, [popUps]);

  const removePopUpWrapper = async (popUp: PopUp) => {
    setCurrentPopUp(undefined);
    await removePopUp(popUp);
  };

  const onClick = async (popUp: PopUp) => {
    if (!!popUp.eventLink) {
      await removePopUpWrapper(popUp);
      history.push(popUp.eventLink);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        transform: !!currentPopUp ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.5s ease-out'
      }}
    >
      {!removeIsLoading && !popUpsIsLoading && currentPopUp && (
        <PopUpCard popUp={currentPopUp} removePopUp={removePopUpWrapper} onClick={onClick} />
      )}
    </Box>
  );
};

export default PopUpAlert;
