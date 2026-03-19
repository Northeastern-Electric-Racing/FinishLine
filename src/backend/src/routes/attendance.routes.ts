import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import AttendanceController from '../controllers/attendance.controllers.js';

const attendanceRouter = express.Router();

attendanceRouter.post(
  '/',
  nonEmptyString(body('teamId')),
  nonEmptyString(body('message')),
  validateInputs,
  AttendanceController.takeAttendance
);

attendanceRouter.get('/', AttendanceController.getAllAttendances);

attendanceRouter.get('/ongoing/:teamId', AttendanceController.getOngoingAttendance);
attendanceRouter.post('/close/:teamId', AttendanceController.closeOngoingAttendance);
attendanceRouter.get('/check-channel/:teamId', AttendanceController.checkChannel);

export default attendanceRouter;
