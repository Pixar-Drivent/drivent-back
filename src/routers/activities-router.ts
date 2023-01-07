import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { deleteUserActivity, getActivities, insertUserActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("", insertUserActivity)
  .delete("", deleteUserActivity);

export { activitiesRouter };
