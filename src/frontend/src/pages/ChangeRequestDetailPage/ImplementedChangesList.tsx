/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ImplementedChange } from 'shared';
import { datePipe, emDashPipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { styled } from '@mui/material/styles';
import { Link, ListItem, List, Tooltip, Typography, TooltipProps, tooltipClasses } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useLayoutEffect, useRef, useState } from 'react';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  const tooltipRef = useRef<any>();

  function useWindowSize() {
    const [width, setWidth] = useState<number>(0);
    const [position, setPosition] = useState<'top' | 'right'>('right');
    useLayoutEffect(() => {
      function updateTooltipProps() {
        setWidth(window.innerWidth);
        if ([null, undefined].includes(tooltipRef.current)) {
          return;
        }
        const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
        const tooltipPosition = tooltipRef.current.getBoundingClientRect().right;
        setPosition(window.innerWidth - tooltipPosition - 50 <= tooltipWidth ? 'top' : 'right');
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
    return [width, position];
  }

  let [width, position] = useWindowSize() as [number, 'top' | 'right'];

  // https://mui.com/material-ui/react-tooltip/#VariableWidth.tsx
  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: `${(width as number) / 2}px`,
      overflowWrap: 'break-word'
    }
  });

  return (
    <PageBlock
      title={'Implemented Changes'}
      headerRight={<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
    >
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <CustomWidthTooltip
              id="tooltip"
              title={
                <Typography>
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              }
              placement={position}
            >
              <Typography ref={tooltipRef}>
                [{<Link href={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>{wbsPipe(ic.wbsNum)}</Link>}] {ic.detail}
              </Typography>
            </CustomWidthTooltip>
          </ListItem>
        ))}
      </List>
    </PageBlock>
  );
};

export default ImplementedChangesList;
