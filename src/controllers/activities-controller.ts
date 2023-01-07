import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import activitiesService from "@/services/activities-service";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const activities = await activitiesService.listActivities(userId);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.statusText === "PaymentRequired") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function insertUserActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;

  if (!userId || !activityId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    await activitiesService.insertUser(+userId, +activityId);
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.statusText === "Conflict") {
      return res.sendStatus(httpStatus.CONFLICT);
    }
    if (error.statusText === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function deleteUserActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;

  if (!userId || !activityId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    await activitiesService.deleteUser(+userId, +activityId);
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.statusText === "NotFound") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
