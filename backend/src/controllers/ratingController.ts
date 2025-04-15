import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { ratingSchema } from '../lib/validations';
import asyncHandler from 'express-async-handler';

export const createRating = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const validatedData = ratingSchema.parse(req.body);

  const store = await prisma.store.findUnique({
    where: { id: parseInt(storeId) },
  });

  if (!store) {
    throw new AppError(404, 'Store not found');
  }

  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId: req.user!.id,
        storeId: parseInt(storeId),
      },
    },
  });

  if (existingRating) {
    throw new AppError(400, 'You have already rated this store');
  }

  const rating = await prisma.rating.create({
    data: {
      ...validatedData,
      userId: req.user!.id,
      storeId: parseInt(storeId),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      store: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { rating },
  });
});

export const updateRating = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const validatedData = ratingSchema.parse(req.body);

  const rating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId: req.user!.id,
        storeId: parseInt(storeId),
      },
    },
  });

  if (!rating) {
    throw new AppError(404, 'Rating not found');
  }

  const updatedRating = await prisma.rating.update({
    where: {
      userId_storeId: {
        userId: req.user!.id,
        storeId: parseInt(storeId),
      },
    },
    data: validatedData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      store: true,
    },
  });

  res.json({
    status: 'success',
    data: { rating: updatedRating },
  });
});

export const deleteRating = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  const rating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId: req.user!.id,
        storeId: parseInt(storeId),
      },
    },
  });

  if (!rating) {
    throw new AppError(404, 'Rating not found');
  }

  await prisma.rating.delete({
    where: {
      userId_storeId: {
        userId: req.user!.id,
        storeId: parseInt(storeId),
      },
    },
  });

  res.json({
    status: 'success',
    data: null,
  });
});

export const getAllRatings = asyncHandler(async (req: Request, res: Response) => {
  const ratings = await prisma.rating.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      store: true,
    },
  });

  res.json({
    status: 'success',
    data: ratings,
  });
});

export const getStoreRatings = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  const store = await prisma.store.findUnique({
    where: { id: parseInt(storeId) },
  });

  if (!store) {
    throw new AppError(404, 'Store not found');
  }

  const ratings = await prisma.rating.findMany({
    where: { storeId: parseInt(storeId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    status: 'success',
    data: { ratings },
  });
});