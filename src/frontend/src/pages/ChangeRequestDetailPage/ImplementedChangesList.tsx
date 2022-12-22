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
import { useLayoutEffect, useState } from 'react';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  const [bodyWidth, setBodyWidth] = useState<number>(window.document.body.offsetWidth);

  window.document.body.addEventListener('resize', () => {
    setBodyWidth(window.document.body.offsetWidth);
  });

  function useWindowSize() {
    const [innerWidth, setInnerWidth] = useState<number>(0);
    function determinePosition() {
      return window.innerWidth <= bodyWidth ? 'top' : 'right';
    }
    const [position, setPosition] = useState<'top' | 'right'>(determinePosition());
    useLayoutEffect(() => {
      function updateTooltipProps() {
        setInnerWidth(window.innerWidth);
        setPosition(determinePosition());
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
    <PageBlock
      title={'Implemented Changes'}
      headerRight={<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
    >
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <DynamicTooltip
              id="tooltip"
              title={
                <Typography>
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              }
              placement={position}
              arrow
            >
              <Typography>
                [{<Link href={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>{wbsPipe(ic.wbsNum)}</Link>}] {ic.detail}
              </Typography>
            </DynamicTooltip>
          </ListItem>
        ))}
      </List>
    </PageBlock>
  );
};

export default ImplementedChangesList;
