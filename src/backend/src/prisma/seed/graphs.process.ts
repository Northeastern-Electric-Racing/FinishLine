/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Graph, Graph_Collection } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { CarOutput } from '../context.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { CarProcess } from './car.process.js';
import {
  GraphActor,
  GraphCarRef,
  carSpan,
  graphCollectionCountForOrg,
  graphCollectionCreateInput,
  graphCreateInput,
  planGraphCollections,
  planGraphs,
  standaloneGraphCountForOrg
} from '../factories/graphs.factory.js';

type GraphInput = OrganizationOutput & UsersOutput & CarOutput;

export type GraphOutput = {
  graphs: Graph[];
  graphCollections: Graph_Collection[];
};

export class GraphProcess extends SeedProcess<GraphInput, GraphOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, CarProcess];
  }

  async run({ organization, leadership, heads, admins, appAdmins, cars }: GraphInput): Promise<GraphOutput> {
    const { organizationId } = organization;

    const creators: GraphActor[] = [...leadership, ...heads, ...admins, ...appAdmins];

    if (creators.length === 0) throw new Error('GraphProcess requires leadership-or-above users to author graphs.');
    if (cars.length === 0) throw new Error('GraphProcess requires at least one car to scope graph dates.');

    const carRefs: GraphCarRef[] = cars.map(({ car, dateRange }) => ({ carId: car.carId, dateRange }));
    const span = carSpan(carRefs);

    const collectionCount = graphCollectionCountForOrg(this.faker);
    const collectionPlans = planGraphCollections(this.faker, collectionCount, creators, span);
    const standaloneCount = standaloneGraphCountForOrg(this.faker);
    const graphPlans = planGraphs(this.faker, collectionCount, standaloneCount, creators, carRefs, span);

    const graphCollections = await Promise.all(
      collectionPlans.map((plan) =>
        this.prisma.graph_Collection.create({ data: graphCollectionCreateInput(organizationId, plan) })
      )
    );

    const graphs = await Promise.all(
      graphPlans.map((plan) => {
        const collectionId = plan.collectionIndex !== undefined ? graphCollections[plan.collectionIndex].id : undefined;
        return this.prisma.graph.create({ data: graphCreateInput(organizationId, plan, collectionId) });
      })
    );

    return { graphs, graphCollections };
  }
}
