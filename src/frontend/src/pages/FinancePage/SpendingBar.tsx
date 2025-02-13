import { Box, Color, useTheme } from '@mui/material';
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
  console.log('Rendering');

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [minWidth, setMinWidth] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Runs on mount and when `items` changes
  useEffect(() => {
    setMinWidth(hiddenRef.current!.offsetWidth);
  }, [items]);

  // Runs only when the component mounts
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(containerRef.current!.offsetWidth);
    };

    updateWidth(); // Initial measurement
    window.addEventListener('resize', updateWidth); // Handle resizes

    // Cleanup function runs before unmounting
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const sum = (nums: number[]) => nums.reduce((sum, num) => num + sum, 0);
  const normalize = (nums: number[]) => nums.map((num) => num / sum(nums));

  // Normalizes `nums`, but ensures every element is at least `minPercentages`
  const normalizeWithMin = (nums: number[], minPercentage: number) => {
    const percentages = normalize(nums);
    const adjustedPercentages = percentages.map((percentage) => (percentage < minPercentage ? minPercentage : percentage));
    const excess = sum(adjustedPercentages) - 1;
    if (excess > 0) {
      const indicesToRescale = percentages
        .map((percentage, index) => (percentage >= minPercentage ? index : -1))
        .filter((index) => index !== -1);

      const rescaleTotal = sum(indicesToRescale.map((index) => percentages[index]));
      if (rescaleTotal > 0) {
        indicesToRescale.forEach((i) => {
          adjustedPercentages[i] -= (percentages[i] / rescaleTotal) * excess;
        });
      }
    }
    console.assert(sum(adjustedPercentages) === 1, sum(adjustedPercentages));
    return adjustedPercentages;
  };

  // Set up variables to compute `minItemWidthPercentages`
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = '16px Arial'; // Font and size can be arbitrary since we normalize

  const minItemWidthPercentages = normalize(
    items.map((item) => {
      const textParts = [...item.name.split(' '), `$${item.value}`];
      const maxWidth = Math.max(...textParts.map((textPart) => context.measureText(textPart).width));
      return maxWidth;
    })
  );

  const itemWidths = items.map((item, index) => {
    const minItemWidthPercentage = minItemWidthPercentages[index];
    const minItemWidth = minItemWidthPercentage * minWidth;

    const valueSum = sum(items.map((item) => item.value));
    const remainingSpace = containerWidth - minWidth;
    const extraWidth = (item.value / valueSum) * remainingSpace;

    return minItemWidth + extraWidth;
  });
  // Text is sometimes illegible when components take up less than 10% of the horizontal space
  // This is because
  const minItemWidthPercentage = 0.1;
  const itemWidthPercentages = normalizeWithMin(itemWidths, minItemWidthPercentage);

  const HiddenDiv = () => {
    return (
      <Box ref={hiddenRef} style={{ position: 'absolute', visibility: 'hidden' }}>
        {items.map((item) => (
          <Box key={item.name} display="inline-block" p={2}>
            {item.name}
          </Box>
        ))}
      </Box>
    );
  };

  const DebugDiv = () => {
    return (
      <div>
        minWidth: {minWidth}
        <br />
        containerWidth: {containerWidth}
        <br />
        minItemWidthPercentages: {minItemWidthPercentages.map((x) => x.toFixed(2)).join(' | ')}
        <br />
        itemWidthPercentages: {itemWidthPercentages.map((itemWidth) => itemWidth.toFixed(2)).join(' | ')}
      </div>
    );
  };

  const theme = useTheme();

  return (
    <Box>
      <HiddenDiv />
      {/* <DebugDiv /> */}
      <Box ref={containerRef} width="100%" display="flex" gap={0.35}>
        {items.map((item, index) => (
          <Box
            key={item.name}
            id={`spending-item-${item.name}`}
            sx={{
              bgcolor: item.color ? item.color : item.value === 0 ? theme.palette.grey[600] : theme.palette.grey[800],
              boxShadow: 1,
              borderRadius: index === 0 ? '8px 0 0 8px' : index === items.length - 1 ? '0 8px 8px 0' : '0'
            }}
            justifyContent="center"
            alignContent="center"
            width={itemWidthPercentages[index]}
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
};

export default SpendingBar;
