/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SlimCar, SlimProject, SlimTeam, SlimUser, SlimWorkPackage } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const getSlimCars = () => axios.get<SlimCar[]>(apiUrls.carsSlim());

export const getSlimProjects = () => axios.get<SlimProject[]>(apiUrls.projectsSlim());

export const getSlimWorkPackages = () => axios.get<SlimWorkPackage[]>(apiUrls.workPackagesSlim());

export const getSlimUsers = () => axios.get<SlimUser[]>(apiUrls.usersSlim());

export const getSlimTeams = () => axios.get<SlimTeam[]>(apiUrls.teamsSlim());
