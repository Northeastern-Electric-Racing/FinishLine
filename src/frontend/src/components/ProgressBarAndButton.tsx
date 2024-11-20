import React, { useState } from 'react';
import NERProgressBar from './NERProgressBar';
import { NERButton } from './NERButton';

const ProgressBarWithButton = ({ initialPercent = 0 }) => {
  const [percent, setPercent] = useState(initialPercent);
  const isFinished = 100;

  return (
    <div>
      <NERProgressBar value = {percent} />
      <NERButton disabled = {!(percent == 100)} onClick = {() => /* something */ }/>
    </div>
  );
};

export default ProgressBarWithButton;
