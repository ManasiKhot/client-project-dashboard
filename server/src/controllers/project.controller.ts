import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createProject,
  getProjectsForUser,
} from "../services/project.service";
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
export const createProjectController = async (
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

    const {
      name,
      description,
      clientId,
      managerId: requestedManagerId,
    } = req.body;

    let managerId: string;

    if (req.user.role === "PROJECT_MANAGER") {
      managerId = req.user.userId;
    } else if (req.user.role === "ADMIN") {
      if (!requestedManagerId) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MANAGER_REQUIRED",
            message: "Manager ID is required for Admin-created projects",
          },
        });
      }

      managerId = requestedManagerId;
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Developers cannot create projects",
        },
      });
    }

    const project = await createProject({
      name,
      description,
      clientId,
      managerId,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error instanceof Error && error.message === "CLIENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "CLIENT_NOT_FOUND",
          message: "Client not found",
        },
      });
    }

    if (error instanceof Error && error.message === "INVALID_MANAGER") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_MANAGER",
          message: "The selected user is not a Project Manager",
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create project",
      },
    });
  }
};