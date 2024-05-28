import { Car } from 'shared';
import { CreateCarPayload } from '../hooks/cars.hooks';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const getAllCars = async () => {
  return await axios.get<Car[]>(apiUrls.cars());
};

export const createCar = async (payload: CreateCarPayload) => {
  return await axios.post<Car>(apiUrls.carsCreate(), payload);
};
