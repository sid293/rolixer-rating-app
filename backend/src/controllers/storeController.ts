import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
// import { CreateStoreInput, storeSchema } from '../lib/validations';
import { storeSchema } from '../lib/validations';
import asyncHandler from 'express-async-handler';

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = storeSchema.parse(req.body);

  const store = await prisma.store.create({
    data: {
      ...validatedData,
      ownerId: req.user!.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: { store },
  });
});

export const getStores = asyncHandler(async (req: Request, res: Response) => {
  console.log("getting stores")
  const stores = await prisma.store.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.json({
    status: 'success',
    data: stores,
  });
});

export const getStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("get store for : ",id);
  console.log("get store for type : ",typeof id);

  const store = await prisma.store.findFirst({
    where: { 
      owner: {
        email: id
      }
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  console.log("sending store back:",store)
  if (!store) {
    throw new AppError(404, 'Store not found');
  }

  res.json({
    status: 'success',
    data: { store },
  });
});

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = storeSchema.partial().parse(req.body);

  const store = await prisma.store.findUnique({
    where: { id: parseInt(id) },
  });

  if (!store) {
    throw new AppError(404, 'Store not found');
  }

  if (store.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Not authorized to update this store');
  }

  const updatedStore = await prisma.store.update({
    where: { id: parseInt(id) },
    data: validatedData,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.json({
    status: 'success',
    data: { store: updatedStore },
  });
});

export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const store = await prisma.store.findUnique({
    where: { id: parseInt(id) },
  });

  if (!store) {
    throw new AppError(404, 'Store not found');
  }

  if (store.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Not authorized to delete this store');
  }

  await prisma.store.delete({
    where: { id: parseInt(id) },
  });

  res.json({
    status: 'success',
    data: null,
  });
});