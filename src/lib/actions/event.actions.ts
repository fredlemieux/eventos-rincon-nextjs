'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import {
  EventModel,
  IEvent,
  CategoryModel,
  UserModel,
  LocationModel,
  IEventPopulated,
  CreateEventModelParams,
} from '@/lib/database/models';
import { formatDateTime, handleError } from '@/lib/utils';
import {
  checkAndReturnObjectId,
  documentToJSON,
} from '@/lib/utils/mongoose.utils';

import {
  UpdateEventActionParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types/parameters.types';
import { ToJSON, TransformObjectIdKeys } from '@/types/utility.types';
import type { Query, RootFilterQuery } from 'mongoose';
import { getCategoryByName } from '@/lib/actions/category.actions';
import { getSessionUserId } from '@/lib/actions/user.actions';

export type CreateEventActionParams = {
  event: CreateEventParams;
  path: string;
};

export type CreateEventParams = TransformObjectIdKeys<CreateEventModelParams>;
export type UpdateEventParams = TransformObjectIdKeys<IEvent>;

export async function createEvent({
  event,
  path,
}: CreateEventActionParams): Promise<ToJSON<IEvent> | undefined> {
  try {
    await connectToDatabase();

    const createEventModelParams = await getCreateEventModelParams(event);

    const newEvent: IEvent = await EventModel.create(createEventModelParams);

    revalidatePath(path);

    return documentToJSON(newEvent);
  } catch (error) {
    handleError(error);
  }
}

async function getCreateEventModelParams(
  event: CreateEventParams
): Promise<CreateEventModelParams> {
  const { createdById, categoryId, locationId, ...restEvent } = event;

  if (!createdById || !categoryId || !locationId) {
    throw new Error('createdById, categoryId and locationId are required!');
  }

  const createdByObjectId = checkAndReturnObjectId(createdById);
  const categoryObjectId = checkAndReturnObjectId(categoryId);
  const locationObjectId = checkAndReturnObjectId(locationId);

  const createdBy = await UserModel.findById(createdByObjectId);

  if (!createdBy) throw new Error('createdBy not found');

  return {
    ...restEvent,
    category: categoryObjectId,
    createdBy: createdByObjectId,
    location: locationObjectId,
  };
}

// TODO! Fetching new page for related event fetches event data again...
// Separate?
export async function getEventDetailsData(
  eventId: string,
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<{
  event: ToJSON<IEventPopulated>;
  relatedEvents?: {
    data?: ToJSON<IEventPopulated>[];
    totalPages: number;
  };
}> {
  const event = await getEventById(eventId);

  if (!event) throw new Error();

  const relatedEvents = await getRelatedEventsByCategory({
    eventId: event._id,
    categoryId: event.category._id,
    page: searchParams?.page as string,
  });

  return { event, relatedEvents };
}

export async function getEventById(
  eventId: string
): Promise<ToJSON<IEventPopulated> | undefined> {
  try {
    await connectToDatabase();

    const eventObjectId = checkAndReturnObjectId(eventId);

    const query = EventModel.findById(eventObjectId);
    const event = await populateEvents(query);

    if (!event) throw new Error('Event not found');

    return documentToJSON(event);
  } catch (error) {
    handleError(error);
  }
}

export async function updateEvent({
  event,
  path,
}: UpdateEventActionParams): Promise<ToJSON<IEvent> | undefined> {
  await connectToDatabase();

  const eventObjectId = checkAndReturnObjectId(event._id);

  const eventToUpdate = await EventModel.findById(eventObjectId);

  if (!eventToUpdate) {
    throw new Error('Event not found');
  }

  const userId = await getSessionUserId();

  if (eventToUpdate.createdBy.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  const updatedEvent = await EventModel.findByIdAndUpdate(
    eventObjectId,
    {
      ...event,
      category: event.categoryId,
      createdBy: event.createdById,
      location: event.locationId,
    },
    { new: true }
  );

  revalidatePath(path);

  return documentToJSON<IEvent>(updatedEvent);
}

export async function deleteEvent({
  eventId,
  path,
}: DeleteEventParams): Promise<void> {
  try {
    await connectToDatabase();

    const deletedEvent = await EventModel.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

export async function getAllEvents({
  limit = 6,
  page,
  category,
  from,
  to,
}: GetAllEventsParams) {
  try {
    await connectToDatabase();

    const parsedFrom =
      from && from.length > 0 ? from : formatDateTime().dateIso; // Handle empty strings
    const parsedTo = to && to.length > 0 ? to : undefined;

    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;
    const conditions = {
      $and: [
        parsedFrom ? { startDateTime: { $gte: parsedFrom } } : {},
        parsedTo ? { startDateTime: { $lte: parsedFrom } } : {},
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };
    console.log('CONDITIONS:', JSON.stringify(conditions, null, 2));

    const skipAmount = (Number(page) - 1) * limit;
    return await queryAndReturnEvents(conditions, skipAmount, limit);
  } catch (error) {
    handleError(error);
  }
}

export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    const conditions = { createdBy: userId };
    const skipAmount = (page - 1) * limit;

    return await queryAndReturnEvents(conditions, skipAmount, limit);
  } catch (error) {
    handleError(error);
  }
}

export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams): Promise<
  | {
      data?: ToJSON<IEventPopulated>[];
      totalPages: number;
    }
  | undefined
> {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    return await queryAndReturnEvents(conditions, skipAmount, limit);
  } catch (error) {
    handleError(error);
  }
}

async function queryAndReturnEvents(
  conditions: RootFilterQuery<IEvent>,
  skipAmount: number,
  limit: number
): Promise<{ data?: ToJSON<IEventPopulated>[]; totalPages: number }> {
  const eventsQuery = EventModel.find(conditions)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit);

  const events = await populateEvents(eventsQuery);

  const eventsCount = await EventModel.countDocuments(conditions);

  return {
    data: events ? documentToJSON(events) : undefined,
    totalPages: Math.ceil(eventsCount / limit),
  };
}

function populateEvents(
  query: Query<IEvent | null, IEvent>
): Promise<IEventPopulated | null>;
function populateEvents(
  query: Query<IEvent[] | null, IEvent>
): Promise<IEventPopulated[] | null>;
function populateEvents(
  query: Query<IEvent | null, IEvent> | Query<IEvent[] | null, IEvent>
): Promise<IEventPopulated | null | IEventPopulated[]> {
  return query
    .populate({
      path: 'createdBy',
      model: UserModel,
      select: '_id firstName lastName',
    })
    .populate({
      path: 'category',
      model: CategoryModel,
      select: '_id name',
    })
    .populate({ path: 'location', model: LocationModel })
    .lean<IEventPopulated>()
    .exec();
}
