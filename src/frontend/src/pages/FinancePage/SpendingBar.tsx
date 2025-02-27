import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEffect, useRef, useState } from 'react';

interface HoverableComponentProps {
  defaultComponent: JSX.Element;
  onHoverComponent: JSX.Element;
}

const HoverableComponent: React.FC<HoverableComponentProps> = ({ defaultComponent, onHoverComponent }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const boxElement = boxRef.current;
    if (boxElement) {
      boxElement.addEventListener('mouseenter', handleMouseEnter);
      boxElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (boxElement) {
        boxElement.removeEventListener('mouseenter', handleMouseEnter);
        boxElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <Box ref={boxRef} height="100%" justifyContent="center" alignContent="center">
      {isHovered ? onHoverComponent : defaultComponent}
    </Box>
  );
};

interface SpendingItem {
  name: string;
  value: number;
  color?: string;
  onHoverComponent?: JSX.Element;
}

interface SpendingBarProps {
  items: SpendingItem[];
  enableDebug?: boolean;
}

interface SpendingItemComponentProps {
  item: SpendingItem;
}

/**
 * A component to display a spending item in a spending bar.
 */
const SpendingItemTextComponent: React.FC<SpendingItemComponentProps> = ({ item }) => {
  return (
    <Box p={0.5} justifyContent="center" alignContent="center" textAlign="center" height="100%">
      {item.name} <br /> ${item.value}
    </Box>
  );
};

/**
 * A component to display a spending item in a spending bar.
 * When this component is hovered and the spending item has an onHoverComponent property,
 * this component is rendered as the spending item's onHoverComponent property.
 * Otherwise, this component is rendered as a spending item text component.
 */
const SpendingItemHoverableComponent: React.FC<SpendingItemComponentProps> = ({ item }) => {
  return (
    <HoverableComponent
      onHoverComponent={item.onHoverComponent!}
      defaultComponent={<SpendingItemTextComponent item={item} />}
    />
  );
};

/**
 * A component to display spending items
 */
const SpendingBar: React.FC<SpendingBarProps> = ({ items, enableDebug = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [minItemWidths, setMinItemWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
        visibility={enableDebug ? 'visible' : 'hidden'}
        position={enableDebug ? 'relative' : 'absolute'}
        flexWrap="wrap"
        gap={0.2}
      >
        {items.map((item) => (
          <SpendingItemTextComponent item={item} key={item.name} />
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

  // When either `containerRef` or `hiddenRef` is null (i.e. on the first render),
  // return this component so that the necessary fields get set
  if (!containerRef.current || !hiddenRef.current) {
    return (
      <Box>
        <Hidden />
        <Debug />
        <Box ref={containerRef} width="100%" display="flex" />
      </Box>
    );
  }

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
    <Box height="100%">
      <Hidden />
      <Debug />
      <Box ref={containerRef} width="100%" display="flex" gap={0.2} alignItems="stretch" height="100%">
        {items.map((item, index) => (
          <Box
            key={item.name}
            bgcolor={item.color ? item.color : item.value === 0 ? grey[600] : grey[800]}
            borderRadius={index === 0 ? '8px 0 0 8px' : index === items.length - 1 ? '0 8px 8px 0' : '0'}
            justifyContent="center"
            alignContent="center"
            textAlign="center"
            width={itemWidths[index]}
            alignSelf="stretch"
          >
            {item.onHoverComponent ? (
              <SpendingItemHoverableComponent item={item} />
            ) : (
              <SpendingItemTextComponent item={item} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SpendingBar;
