import { useEffect, useRef, useState } from 'react';
import { useApiIsLoaded, useMapsLibrary } from '@vis.gl/react-google-maps';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export const useGooglePlaces = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const isLoaded = useApiIsLoaded();
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    console.log('PLACES_INPUT_REF:', places, inputRef);

    if (!places || !inputRef?.current) return;

    const rinconBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng({ lat: 36.705586, lng: -4.33327 }),
      new google.maps.LatLng({ lat: 36.803671, lng: -4.121469 })
    );
    const options: google.maps.places.AutocompleteOptions = {
      bounds: rinconBounds,
      strictBounds: true,
      fields: [
        'geometry',
        'name',
        'formatted_address',
        'url',
        'international_phone_number',
        'photos',
        'place_id',
      ],
      componentRestrictions: {
        country: ['es'],
      },
    };
    console.log('Setting Place autocomplete');
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places, inputRef]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    console.log('_ADDING_LISTENER_:', 'adding listener');

    placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      console.log(place);
      onPlaceSelect(place);
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return { isLoaded, inputRef };
};
