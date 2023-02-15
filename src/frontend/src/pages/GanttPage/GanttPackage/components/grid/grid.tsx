import React from 'react';
import { GridBody, GridBodyProps } from './grid-body';

export type GridProps = GridBodyProps;
export const Grid = (props: GridProps) => {
  return (
    <g className="grid">
      <GridBody {...props} />
    </g>
  );
};
