/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from '@mui/material';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ImplementedChange } from 'shared';
import { fullNamePipe, datePipe } from '../utils/pipes';
import { routes } from '../utils/routes';
import BulletList from './BulletList';
import styled from '@emotion/styled';
import { useState, useLayoutEffect } from 'react';

interface ChangesListProps {
  changes: ImplementedChange[];
}

const ChangesList: React.FC<ChangesListProps> = ({ changes }) => {
  const [bodyWidth, setBodyWidth] = useState<number>(window.document.body.offsetWidth);

  document.body.addEventListener('resize', () => {
    setBodyWidth(window.document.body.offsetWidth);
  });

  function useWindowSize() {
    const [innerWidth, setInnerWidth] = useState<number>(0);
    const [position, setPosition] = useState<'top' | 'right'>('right');
    useLayoutEffect(() => {
      function updateTooltipProps() {
        setInnerWidth(window.innerWidth);
        setPosition(window.innerWidth <= bodyWidth ? 'top' : 'right');
      }
      window.addEventListener('resize', () => {
        updateTooltipProps();
      });
      updateTooltipProps();
      return () =>
        window.removeEventListener('resize', () => {
          updateTooltipProps();
        });
    }, []);
    return [innerWidth, position];
  }

  let [innerWidth, position] = useWindowSize() as [number, 'top' | 'right'];

  // https://mui.com/material-ui/react-tooltip/#VariableWidth.tsx
  const DynamicTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: `${(innerWidth as number) / 2}px`,
      overflowWrap: 'break-word'
    }
  });

  return (
    <BulletList
      title={'Changes'}
      list={changes.map((ic) => (
        <>
          [<Link href={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}>#{ic.changeRequestId}</Link>]{' '}
          <DynamicTooltip
            id="tooltip"
            title={
              <>
                <Typography variant="body2">
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              </>
            }
            placement={position}
            arrow
          >
            <Typography component="span">{ic.detail}</Typography>
          </DynamicTooltip>
        </>
      ))}
      readOnly={true}
      defaultClosed
    />
  );
};

export default ChangesList;
