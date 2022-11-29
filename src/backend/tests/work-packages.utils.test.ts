import { prisma } from "@prisma/client";
import { workPackageTransformer } from "../src/utils/work-packages.utils";
import { createWorkPackagePayload } from "./test-data/work-packages.test-data";
import * as utils from "../src/utils/work-packages.utils";
import express from "express";

const app = express();
app.use(express.json());

describe('Work Package Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('workPackageTransformer', () => {    
    const workPackages1 = [createWorkPackagePayload]
    // workPackages1.map(workPackageTransformer)
    
  
    expect(workPackageTransformer).toBeCalledTimes(1);
      
    });
})