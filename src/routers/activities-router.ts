import { Router } from "express";
import { authenticateToken, verifyTicket } from "@/middlewares";
import { deleteUserActivity, getActivities, insertUserActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("", verifyTicket, insertUserActivity)
  .delete("", verifyTicket, deleteUserActivity);

export { activitiesRouter };
