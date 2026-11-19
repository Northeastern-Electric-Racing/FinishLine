import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import AttendanceController from '../controllers/attendance.controllers.js';
import { createRouter } from '../utils/api-key.utils.js';

const attendanceRouter = createRouter();

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
attendanceRouter.get('/:meetingAttendanceId', AttendanceController.getAttendanceById);

export default attendanceRouter;
