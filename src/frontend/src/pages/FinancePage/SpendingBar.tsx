import { Box, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface SpendingItem {
  name: string;
  value: number;
  color?: string;
}

interface SpendingBarProps {
  items: SpendingItem[];
}

const SpendingBar: React.FC<SpendingBarProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [minItemWidths, setMinItemWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const theme = useTheme();
  const enableDebug = false;

  // This will run after setting `hiddenRef`
  useEffect(() => {
    setMinItemWidths(Array.from(hiddenRef.current!.children).map((child) => child.getBoundingClientRect().width));
  }, [items]);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(containerRef.current!.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const sum = (nums: number[]) => nums.reduce((sum, num) => num + sum, 0);

  // `Hidden` will render spending items using the minimum possible space (while still adding padding)
  // and then our useEffect will measure each spending item's width.
  // This let's us know the minimum space each spending item needs.
  const Hidden = () => {
    return (
      <Box
        ref={hiddenRef}
        display="flex"
        gap={0.35}
        visibility={enableDebug ? 'visible' : 'hidden'}
        position={enableDebug ? 'relative' : 'absolute'}
      >
        {items.map((item) => (
          <Box key={item.name} p={2} bgcolor={theme.palette.grey[600]}>
            {item.name}
          </Box>
        ))}
      </Box>
    );
  };

  const Debug = () => {
    return (
      <Box visibility={enableDebug ? 'visible' : 'hidden'} position={enableDebug ? 'relative' : 'absolute'}>
        minWidth: {sum(minItemWidths).toFixed(2)}
        <br />
        containerWidth: {containerWidth}
        <br />
        minItemWidths: {minItemWidths.map((width) => width.toFixed(2)).join(' | ')}
        <br />
      </Box>
    );
  };

  if (containerRef.current && hiddenRef.current) {
    if (sum(minItemWidths) > containerWidth) {
      return (
        <Box>
          <Hidden />
          <Debug />
          <Box ref={containerRef}>Cannot fit items in spending bar</Box>
        </Box>
      );
    }

    // Allocate remaining space in the container to the element proportional to their values
    const valueSum = sum(items.map((item) => item.value));
    const minWidth = sum(minItemWidths);
    const remainingSpace = containerWidth - minWidth;
    const itemWidths = items.map((item, index) => {
      const minItemWidth = minItemWidths[index];
      const extraWidth = (item.value / valueSum) * remainingSpace;
      return minItemWidth + extraWidth;
    });
    // We want to make sure that the sum of the widths of the items equals the width of the container
    console.assert(
      sum(itemWidths) === containerRef.current?.offsetWidth,
      `sum(itemWidths) [${sum(itemWidths)}] !== containerRef.current.offset [${containerRef.current.offsetWidth}]`
    );

    return (
      <Box>
        <Hidden />
        <Debug />
        <Box ref={containerRef} width="100%" display="flex" gap={0.35}>
          {items.map((item, index) => (
            <Box
              key={item.name}
              bgcolor={item.color ? item.color : item.value === 0 ? theme.palette.grey[600] : theme.palette.grey[800]}
              borderRadius={index === 0 ? '8px 0 0 8px' : index === items.length - 1 ? '0 8px 8px 0' : '0'}
              boxShadow={1}
              justifyContent="center"
              alignContent="center"
              width={itemWidths[index]}
              p={2}
              textAlign="center"
            >
              {item.name}
              <br />${item.value}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // When either `containerRef` or `hiddenRef` is null (i.e. on the first render),
  // return this component so that the necessary fields get set
  return (
    <Box>
      <Hidden />
      <Debug />
      <Box ref={containerRef} width="100%" display="flex" gap={0.35} />
    </Box>
  );
};

export default SpendingBar;
