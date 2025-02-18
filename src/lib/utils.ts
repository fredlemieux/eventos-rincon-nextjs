import { type ClassValue, clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';
import qs from 'query-string';

import {
  CreateLocationParams,
  RemoveUrlQueryParams,
  UrlQueryParams,
} from '@/types/parameters.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date | string = new Date()) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: false, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: 'Europe/Madrid',
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: false, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: 'Europe/Madrid',
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-GB',
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-GB',
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-GB',
    timeOptions
  );

  const [extractIsoDate] = new Date(dateString).toISOString().split('T');

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
    dateIso: extractIsoDate,
  };
};

export const areDatesTheSame = (start: string | Date, end: string | Date) => {
  return (
    formatDateTime(new Date(start)).dateOnly ===
    formatDateTime(new Date(end)).dateOnly
  );
};

export function formatEventDateTime(startStr: string, endStr: string) {
  const startDateTime = new Date(startStr);
  const endDateTime = new Date(endStr);
  if (endDateTime.getTime() - startDateTime.getTime() < 24 * 60 * 60 * 1000) {
    return `${formatDateTime(startDateTime).dateOnly} - \
    ${formatDateTime(startDateTime).timeOnly} to \
    ${formatDateTime(endDateTime).dateOnly} - \
    ${formatDateTime(endDateTime).timeOnly}`;
  }
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export const handleError = (error: unknown): never => {
  // console.error(error);
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
};

export async function getLocationParamsFromPlace({
  place_id,
  name,
  formatted_address,
  geometry,
  international_phone_number,
  photos,
  url,
}: google.maps.places.PlaceResult): Promise<CreateLocationParams> {
  if (
    !place_id ||
    !name ||
    !formatted_address ||
    !geometry ||
    !geometry.location?.lat() ||
    !geometry.location?.lng() ||
    !international_phone_number ||
    !photos ||
    !url
  ) {
    throw new Error('Missing Params!!');
  }

  return {
    name,
    address: formatted_address,
    lat: geometry?.location?.lat(),
    lng: geometry?.location?.lng(),
    googlePlaceId: place_id,
    phone: international_phone_number,
    photos: photos.map((photo) => photo.getUrl()),
    url,
  };
}
