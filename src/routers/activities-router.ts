import { Router } from "express";
import { authenticateToken, verifyTicket } from "@/middlewares";
import { deleteUserActivity, getActivities, getUserActivities, insertUserActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("", verifyTicket, insertUserActivity)
  .delete("", verifyTicket, deleteUserActivity)
  .get("/user", verifyTicket, getUserActivities);

export { activitiesRouter };
