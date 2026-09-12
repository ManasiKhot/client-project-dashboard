import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
const saveRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  const tokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });
};

export const loginUser = async (
  email: string,
  password: string
) => {
  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // 2. User doesn't exist
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 3. Check password
  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  // 4. Password is incorrect
  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  // 5. Create JWT payload
  const payload = {
    userId: user.id,
    role: user.role,
  };

  // 6. Generate tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 7. Store hashed refresh token in database
  await saveRefreshToken(user.id, refreshToken);

  // 8. Return authentication result
  return {
    user,
    accessToken,
    refreshToken,
  };
};
export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const refreshTokens = await prisma.refreshToken.findMany({
    where: {
      userId: user.id,
      revokedAt: null,
    },
  });

  let validToken = false;

  for (const storedToken of refreshTokens) {
    if (await bcrypt.compare(refreshToken, storedToken.tokenHash)) {
      validToken = true;
      break;
    }
  }

  if (!validToken) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return accessToken;
};
export const logoutUser = async (refreshToken: string) => {
  const refreshTokens = await prisma.refreshToken.findMany({
    where: {
      revokedAt: null,
    },
  });

  for (const storedToken of refreshTokens) {
    if (await bcrypt.compare(refreshToken, storedToken.tokenHash)) {
      await prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      break;
    }
  }
};