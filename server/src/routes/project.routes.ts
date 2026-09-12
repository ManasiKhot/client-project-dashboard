import { Router } from "express";
import {
  createProjectController,
  getProjects,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { createProjectSchema } from "../validators/project.validator";

const router = Router();
const validateCreateProject = (
  req: Parameters<Parameters<typeof router.post>[1]>[0],
  res: Parameters<Parameters<typeof router.post>[1]>[1],
  next: Parameters<Parameters<typeof router.post>[1]>[2]
) => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid project data",
        details: result.error.flatten().fieldErrors,
      },
    });
  }

  req.body = result.data;
  next();
};

router.get("/", authenticate, getProjects);
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  validateCreateProject,
  createProjectController
);

export default router;