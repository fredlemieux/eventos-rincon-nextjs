'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Libraries, useLoadScript } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { eventDefaultValues } from '@/constants';
import Dropdown from './Dropdown';
import { eventFormSchema } from '@/lib/validator';
import { useUploadThing } from '@/lib/uploadthing';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { FileUploader } from './FileUploader';
import { createEvent, updateEvent } from '@/lib/actions/event.actions';
import { IEvent } from '@/lib/database/models/event.model';
import { createLocationIfNotExists } from '@/lib/actions/location.actions';
import { getLocationParamsFromPlace } from '@/lib/utils';

type EventFormProps = {
  userId: string;
  type: 'Create' | 'Update';
  event?: IEvent;
  eventId?: string;
};

const libraries: Libraries = ['places'];

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [place, setPlace] = useState<
    google.maps.places.PlaceResult | undefined
  >();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);

  const initialValues =
    event && type === 'Update'
      ? {
          ...event,
          location: event.location
            ? `${event.location.name}, ${event.location.address}`
            : '',
          startDateTime: new Date(event.startDateTime),
          endDateTime: new Date(event.endDateTime),
        }
      : eventDefaultValues;
  const router = useRouter();

  const { startUpload } = useUploadThing('imageUploader', {
    headers: { userId },
  });

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });
  const { watch, setValue } = form;

  const price = watch('price');
  const isFree = watch('isFree');
  const startDateTime = watch('startDateTime');
  const endDateTime = watch('endDateTime');

  useEffect(() => {
    if (!isLoaded || loadError || !inputRef.current) return;
    const rinconBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng({ lat: 36.705586, lng: -4.33327 }),
      new google.maps.LatLng({ lat: 36.803671, lng: -4.121469 })
    );

    const options = {
      bounds: rinconBounds,
      strictBounds: true,
      componentRestrictions: { country: 'es' },
      fields: [
        'geometry',
        'name',
        'formatted_address',
        'url',
        'international_phone_number',
        'photos',
        'place_id',
      ],
    };

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );
    autocomplete.addListener('place_changed', () => {
      const placeResult = autocomplete.getPlace();
      console.log('PLACE:', placeResult);

      if (placeResult.formatted_address) {
        setPlace(placeResult);
        setValue(
          'location',
          `${placeResult.name}, ${placeResult.formatted_address}`
        );
      }
    });

    // return () => autocomplete.removeListener("place_changed", handlePlaceChanged);
  }, [isLoaded, loadError]);

  useEffect(() => {
    // Check if the "free ticket" checkbox should be updated based on the price
    if (!price) {
      setValue('isFree', true); // Check "free ticket" if price is blank
    } else {
      setValue('isFree', false); // Uncheck "free ticket" if there's a price
    }
  }, [price, setValue]);

  useEffect(() => {
    // Clear the price if "free ticket" is checked
    if (isFree) {
      setValue('price', ''); // Clear the price when "free ticket" is selected
    }
  }, [isFree, setValue]);

  useEffect(() => {
    if (startDateTime > endDateTime) {
      setValue(
        'endDateTime',
        new Date(startDateTime.getTime() + 60 * 60 * 1000)
      );
    }
  }, [setValue, startDateTime, endDateTime]);

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    let uploadedImageUrl = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (!uploadedImages) {
        return;
      }

      uploadedImageUrl = uploadedImages[0].url;
    }

    if (type === 'Create') {
      try {
        if (!place) throw new Error('No location selected!!');
        const locationParams = await getLocationParamsFromPlace(place);
        const location = await createLocationIfNotExists(locationParams);
        if (!location) throw new Error('No location could be created');

        const newEvent = await createEvent({
          event: {
            ...values,
            location: location._id,
            imageUrl: uploadedImageUrl,
          },
          userId,
          path: '/profile',
        });

        if (newEvent) {
          router.push(`/events/${newEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === 'Update') {
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: {
            ...values,
            imageUrl: uploadedImageUrl,
            _id: eventId,
          },
          path: `/events/${eventId}`,
        });

        if (updatedEvent) {
          router.push(`/events/${updatedEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-5'
      >
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    placeholder='Event title'
                    {...field}
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Dropdown
                    onChangeHandler={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl className='h-72'>
                  <Textarea
                    placeholder='Description'
                    {...field}
                    className='textarea rounded-md'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='imageUrl'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl className='h-72'>
                  <FileUploader
                    onFieldChange={field.onChange}
                    imageUrl={field.value}
                    setFiles={setFiles}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='location'
            render={({
              field: { onBlur, onChange, disabled, name, value },
            }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex-center h-[54px] w-full overflow-hidden rounded-md bg-grey-50 px-4 py-2'>
                    <Image
                      src='/assets/icons/location-grey.svg'
                      alt='calendar'
                      width={24}
                      height={24}
                    />

                    <Input
                      ref={inputRef}
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      disabled={disabled}
                      placeholder='Event location or Online'
                      className='input-field'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='startDateTime'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex-center h-[54px] w-full overflow-hidden rounded-md bg-grey-50 px-4 py-2'>
                    <Image
                      src='/assets/icons/calendar.svg'
                      alt='calendar'
                      width={24}
                      height={24}
                      className='filter-grey'
                    />
                    <p className='ml-3 whitespace-nowrap text-grey-600'>
                      Start Date:
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel='Time:'
                      dateFormat='dd/MM/yyyy h:mm aa'
                      wrapperClassName='datePicker'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endDateTime'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex-center h-[54px] w-full overflow-hidden rounded-md bg-grey-50 px-4 py-2'>
                    <Image
                      src='/assets/icons/calendar.svg'
                      alt='calendar'
                      width={24}
                      height={24}
                      className='filter-grey'
                    />
                    <p className='ml-3 whitespace-nowrap text-grey-600'>
                      End Date:
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel='Time:'
                      dateFormat='dd/MM/yyyy h:mm aa'
                      wrapperClassName='datePicker'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex-center h-[54px] w-full overflow-hidden rounded-md bg-grey-50 px-4 py-2'>
                    <Image
                      src='/assets/icons/euro.svg'
                      alt='dollar'
                      width={24}
                      height={24}
                      className='filter-grey'
                    />
                    <Input
                      type='number'
                      placeholder='Price'
                      {...field}
                      className='p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    <FormField
                      control={form.control}
                      name='isFree'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className='flex items-center'>
                              <label
                                htmlFor='isFree'
                                className='whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                              >
                                Free Ticket
                              </label>
                              <Checkbox
                                onCheckedChange={field.onChange}
                                checked={field.value}
                                id='isFree'
                                className='mr-2 h-5 w-5 border-2 border-primary-500'
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex-center h-[54px] w-full overflow-hidden rounded-md bg-grey-50 px-4 py-2'>
                    <Image
                      src='/assets/icons/link.svg'
                      alt='link'
                      width={24}
                      height={24}
                    />

                    <Input
                      placeholder='URL'
                      {...field}
                      className='input-field'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
          className='button col-span-2 w-full'
        >
          {form.formState.isSubmitting ? 'Submitting...' : `${type} Event `}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
