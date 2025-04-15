import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import asyncHandler from 'express-async-handler';

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    // console.log("getAdminStats")
  const [users, stores, ratings] = await Promise.all([
    prisma.user.findMany(),
    prisma.store.count(),
    prisma.rating.count()
  ]);

//   console.log("users stores rating: ",users, stores, ratings)

  res.json({
    status: 'success',
    data: {
      totalUsers: users.length,
      totalStores: stores,
      totalRatings: ratings,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }))
    }
  });
});