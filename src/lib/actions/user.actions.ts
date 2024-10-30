'use server';

import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '@/lib/database';
import { UserModel, EventModel, IUser } from '@/lib/database/models';
import { handleError } from '@/lib/utils';

import { CreateUserParams, UpdateUserParams } from '@/types/parameters.types';
import { auth } from '@clerk/nextjs/server';
import { JwtPayload } from '@clerk/types';
import { ToJSON } from '@/types/utility.types';
import { documentToJson } from '@/lib/utils/mongoose.utils';

export async function createUser(
  user: CreateUserParams
): Promise<ToJSON<IUser> | undefined> {
  try {
    await connectToDatabase();

    const newUser = await UserModel.create(user);
    return documentToJson(newUser);
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(
  userId: string
): Promise<ToJSON<IUser> | undefined> {
  try {
    await connectToDatabase();

    const user = await UserModel.findById(userId);

    if (!user) throw new Error('User not found');

    return documentToJson(user);
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(
  clerkId: string,
  user: UpdateUserParams
): Promise<ToJSON<IUser> | undefined> {
  try {
    await connectToDatabase();

    const updatedUser = await UserModel.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error('User update failed');

    return documentToJson(updatedUser);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(
  clerkId: string
): Promise<ToJSON<IUser> | undefined> {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await UserModel.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      EventModel.updateMany(
        { organizer: { $in: userToDelete._id } },
        { $pull: { organizer: userToDelete._id } }
      ),
    ]);

    // Delete user
    const deletedUser = await UserModel.findByIdAndDelete(userToDelete._id);

    if (!deletedUser) throw new Error('Problem deleting user');

    revalidatePath('/');

    return documentToJson<IUser>(deletedUser);
  } catch (error) {
    handleError(error);
  }
}

// This is one of the main arguments to move away from Clerk, new users don't always have the
// userId in the sessions claims as it requires the webhook to complete before getting userId
export async function getSessionUserId(): Promise<string | null> {
  const { sessionClaims } = await auth();
  if (!sessionClaims) return null;

  return await getUserIdFromSessionClaims(sessionClaims);
}

export async function getUserIdFromSessionClaims(
  sessionClaims: JwtPayload
): Promise<string | null> {
  if (sessionClaims?.userId) {
    return sessionClaims.userId;
  }

  if (!sessionClaims?.sub) return null;

  const clerkId = sessionClaims.sub;
  const user = await UserModel.findOne({ clerkId });

  if (!user) return null;

  return user._id.toString();
}
