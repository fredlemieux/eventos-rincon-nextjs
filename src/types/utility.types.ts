// Utility type to transform Mongoose document to JSON representation
import { Types } from 'mongoose';

// Utility type for non-populated flat documents
export type ToJSON<T> = T extends object
  ? T extends Types.ObjectId
    ? string
    : T extends (infer U)[]
      ? ToJSON<U>[]
      : {
          [K in keyof T]: ToJSON<T[K]>;
        }
  : T;

export type RecursiveToJSON<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId
    ? string // Directly convert ObjectId to string
    : T[K] extends Date
      ? string // Convert Date to string
      : T[K] extends Array<infer U>
        ? RecursiveToJSON<U>[] // Handle arrays recursively
        : T[K] extends object
          ? RecursiveToJSON<T[K]> // Handle nested objects
          : T[K]; // For other types, retain as-is
};
export type ModelCreateParams<T> = Omit<T, '_id'>;

export type WithMongooseId<T> = T & { _id: Types.ObjectId };
