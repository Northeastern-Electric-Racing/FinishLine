import { prisma } from "@prisma/client";
import { workPackageTransformer } from "../src/utils/work-packages.utils";
import { createWorkPackagePayload } from "./test-data/work-packages.test-data";
import * as utils from "../src/utils/work-packages.utils";

// test('workPackageTransformer', () => {
//     // const transformer = workPackageTransformer(createWorkPackagePayload);
//     jest.spyOn(utils, 'workPackageTransformer').mockResolvedValue(createWorkPackagePayload);
    
//   });