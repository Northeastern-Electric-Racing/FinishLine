import { Box, IconButton, Typography } from '@mui/material';
import { Graph, GraphDisplayType } from 'shared';
import GraphBarChartView from './GraphBarChartView';
import GraphPieChartView from './GraphPieChartView';
import { Delete, Edit } from '@mui/icons-material';
import { useHistory, useParams } from 'react-router-dom';
import { datePipe } from '../../../utils/pipes';
import { useGetCarsByIds } from '../../../hooks/cars.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useRemoveGraphFromCollection } from '../../../hooks/statistics.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface GraphViewProps {
  graph: Graph;
  height: number;
  width: number;
}

const GraphView = ({ graph, height = 500, width = 1000 }: GraphViewProps) => {
  const history = useHistory();
  const { graphCollectionId } = useParams<{ graphCollectionId: string }>();
  const { isLoading, data: cars, error, isError } = useGetCarsByIds(new Set(graph.carIds));
  const { isLoading: removeGraphIsLoading, mutateAsync: removeGraph } = useRemoveGraphFromCollection(
    graphCollectionId,
    graph.graphId
  );
  const toast = useToast();

  const [dimensions, setDimensions] = useState({ width, height });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // resize logic:
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setDimensions((prev) => ({
        width: Math.max(300, prev.width + deltaX),
        height: Math.max(200, prev.height + deltaY)
      }));

      setResizeStart({ x: e.clientX, y: e.clientY });
    },
    [isResizing, resizeStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return () => {};
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (isLoading || !cars || removeGraphIsLoading) {
    return <LoadingIndicator />;
  }

  const onRemovePressed = async () => {
    try {
      await removeGraph();
      toast.success('Successfully removed graph');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to remove graph: ' + error.message);
      }
    }
  };

  const Graph = () => {
    switch (graph.graphDisplayType) {
      case GraphDisplayType.BAR:
        return <GraphBarChartView graph={graph} height={dimensions.height - 80} cars={cars} width={dimensions.width - 80} />;
      case GraphDisplayType.PIE:
        return <GraphPieChartView graph={graph} height={dimensions.height - 80} cars={cars} width={dimensions.width - 80} />;
      default:
        return <Typography>Unsupported graph display type: {graph.graphDisplayType}</Typography>;
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
        minWidth: 300,
        minHeight: 200,
        cursor: isResizing ? 'nw-resize' : 'default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flex: 1, position: 'relative', display: 'flex' }}>
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Graph />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexShrink: 0, zIndex: 1 }}>
          <IconButton
            sx={{ height: 40 }}
            onClick={() =>
              history.push('/statistics/graph-collections/' + graphCollectionId + '/graph/' + graph.graphId + '/edit')
            }
          >
            <Edit />
          </IconButton>
          <IconButton sx={{ height: 40 }} onClick={onRemovePressed}>
            <Delete />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography textAlign={'center'} fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
          {!graph.startDate && !graph.endDate
            ? 'All time'
            : (graph.startDate ? datePipe(graph.startDate) : 'No start date') +
              ' to ' +
              (graph.endDate ? datePipe(graph.endDate) : 'no end date')}
        </Typography>
      </Box>

      {/* Resize handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: 'nwse-resize',
          background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 50%, transparent 50%)',
          '&:hover': {
            background: 'linear-gradient(-45deg, transparent 30%, #999 30%, #999 50%, transparent 50%)'
          }
        }}
      />
    </Box>
  );
};

export default GraphView;
