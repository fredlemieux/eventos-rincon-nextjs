import { Schema, model, models, Model, InferSchemaType, Types } from 'mongoose';

const locationSchema = new Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: false },
  lng: { type: Number, required: false },
  url: { type: String, required: true },
  phone: { type: String, required: false },
  photos: { type: [String], required: false },
});

locationSchema.index({ googlePlaceId: 1 });

export type CreateLocationMongoParams = InferSchemaType<typeof locationSchema>;

export type ILocation = CreateLocationMongoParams & {
  _id: Types.ObjectId;
};

export const LocationModel: Model<ILocation> =
  models.Location || model<ILocation>('Location', locationSchema);
