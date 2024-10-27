import { Types } from 'mongoose';
import { ToJSON } from '@/types/utility.types';

export function documentToJson<T>(document: T): ToJSON<T>;
export function documentToJson<T>(document: T[]): ToJSON<T>[];
export function documentToJson<T>(document: T | T[]): ToJSON<T> | ToJSON<T>[] {
  if (Array.isArray(document)) {
    return document.map((doc) => JSON.parse(JSON.stringify(doc)));
  } else {
    return JSON.parse(JSON.stringify(document));
  }
}

export function checkAndReturnObjectId(
  id: Types.ObjectId | string
): Types.ObjectId {
  return typeof id === 'string' ? new Types.ObjectId(id) : id;
}
