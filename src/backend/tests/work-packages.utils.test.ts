import { prisma } from "@prisma/client";
import { workPackageTransformer } from "../src/utils/work-packages.utils";
import { createWorkPackage, createWorkPackagePayload } from "./test-data/work-packages.test-data";
import * as utils from "../src/utils/work-packages.utils";
import express from "express";
import { whipWorkPackage } from "./test-data/change-requests.test-data";

const app = express();
app.use(express.json());

describe('Work Package Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('workPackageTransformer', () => {    
    //jest.spyOn(utils, 'workPackageTransformer').mockResolvedValue(createWorkPackage);
    //const workPackages1 = [utils.wpQueryArgs(createWorkPackage)]
    //workPackages1.map(workPackageTransformer)
    
  
    expect(workPackageTransformer).toBeCalledTimes(1);
      
    });
})