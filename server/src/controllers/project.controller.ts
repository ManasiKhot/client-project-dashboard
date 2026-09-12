import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getProjectsForUser } from "../services/project.service";

export const getProjects = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const projects = await getProjectsForUser(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch projects",
      },
    });
  }
};