import { NextFunction, Request, Response } from 'express';
import AttendanceService from '../services/attendance.services.js';

export default class AttendanceController {
  static async takeAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, message } = req.body;
      const attendance = await AttendanceService.takeAttendance(req.currentUser, teamId, message, req.organization);
      res.status(200).json(attendance);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllAttendances(req: Request, res: Response, next: NextFunction) {
    try {
      const attendances = await AttendanceService.getAllAttendances(req.organization);
      res.status(200).json(attendances);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAttendanceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { meetingAttendanceId } = req.params as Record<string, string>;
      const attendance = await AttendanceService.getAttendanceById(meetingAttendanceId, req.organization);
      res.status(200).json(attendance);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getOngoingAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params as Record<string, string>;
      const attendance = await AttendanceService.getOngoingAttendance(teamId, req.organization);
      res.status(200).json(attendance);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async closeOngoingAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params as Record<string, string>;
      await AttendanceService.closeOngoingAttendance(teamId, req.currentUser, req.organization);
      res.status(200).json({ message: 'Attendance closed successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async checkChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params as Record<string, string>;
      const result = await AttendanceService.checkTeamChannel(teamId, req.organization);
      res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
}
