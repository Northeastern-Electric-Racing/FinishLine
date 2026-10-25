import AttendanceService from '../services/attendance.services.js';

// open attendance for meetings of event types that take attendance, checked once a minute
const ATTENDANCE_JOB_INTERVAL_MS = 60 * 1000;
let attendanceJobRunning = false;

const runScheduledAttendanceJob = async () => {
  // skip if the previous run is still going so we never send duplicate attendance messages
  if (attendanceJobRunning) return;
  attendanceJobRunning = true;
  try {
    await AttendanceService.openScheduledAttendances();
  } catch (error: unknown) {
    console.error('Error running scheduled attendance job:', error);
  } finally {
    attendanceJobRunning = false;
  }
};

/**
 * Starts the background attendance jobs. Should be called once when the server starts.
 * Recovers attendance sessions left open by a restart, then checks every minute for meetings that have started.
 */
export const startAttendanceJobs = () => {
  AttendanceService.resumeScheduledAttendances().catch((error: unknown) =>
    console.error('Error resuming scheduled attendances:', error)
  );
  setInterval(runScheduledAttendanceJob, ATTENDANCE_JOB_INTERVAL_MS);
};
