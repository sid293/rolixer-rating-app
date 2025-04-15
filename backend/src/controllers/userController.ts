import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import {Prisma} from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
// import { CreateUserInput, LoginInput, userSchema, loginSchema } from '../lib/validations';
import { userSchema, loginSchema } from '../lib/validations';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const generateToken = (userId: number): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const signOptions: jwt.SignOptions = {
        expiresIn: '30d',
    };
    return jwt.sign({ userId }, secret as jwt.Secret, signOptions);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    console.log("register hit");
    try {
        console.log("before validate data")
        const validatedData = userSchema.parse(req.body);
        console.log("validate data: ", validatedData)
        const { password, ...userData } = validatedData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                address: true,
            },
        });

        // If user is a store owner, create a store entry
        if (userData.role === 'STORE_OWNER') {
            await prisma.store.create({
                data: {
                    name: `${userData.name}'s Store`,
                    email: userData.email,
                    address: userData.address,
                    ownerId: user.id,
                },
            });
        }

        const token = generateToken(user.id);

        res.status(201).json({
            status: 'success',
            data: { user, token },
        });

    } catch (error) {
        console.log("error: ", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    const target = error.meta?.target as string[];
                    throw new AppError(409, `A user with this ${target[0]} already exists`);
                case 'P2014':
                    throw new AppError(400, 'Invalid relation data provided');
                case 'P2003':
                    throw new AppError(400, 'Invalid reference data provided');
                default:
                    throw new AppError(400, 'Database operation failed');
            }
        }
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new AppError(400, errorMessage);
        }
        throw new AppError(400, 'Invalid data');
    }
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
    },
  });

  res.json({
    status: 'success',
    data: users,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  await prisma.user.delete({
    where: { id: userId },
  });

  res.json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    console.log("login hit")
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;
    console.log("email password ",email, password )

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken(user.id);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
      token,
    },
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    status: 'success',
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = userSchema.partial().parse(req.body);
  const { password, ...updateData } = validatedData;

  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...updateData,
      ...(hashedPassword && { password: hashedPassword }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
    },
  });

  res.json({
    status: 'success',
    data: { user },
  });
});