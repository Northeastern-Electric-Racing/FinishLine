import GraphController from '../controllers/graph.controllers'
import express from 'express';

const graphsRouter = express.Router();

graphsRouter.get('/statistics/:graphId', GraphController.getSingleGraph);

export default graphsRouter;
