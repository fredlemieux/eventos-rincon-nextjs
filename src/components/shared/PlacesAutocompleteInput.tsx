import { InputHTMLAttributes, ReactNode } from 'react';
import { useGooglePlaces } from '@/lib/hooks/useGooglePlaces';
import { Input } from '@/components/ui/input';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  props: InputHTMLAttributes<HTMLInputElement>;
  fallback: ReactNode;
}

export const PlaceAutocompleteInput = ({
  onPlaceSelect,
  props,
  fallback,
}: PlaceAutocompleteProps) => {
  const { isLoaded, inputRef } = useGooglePlaces({ onPlaceSelect });

  if (isLoaded) {
    return (
      <Input
        className='input-field'
        placeholder='Search for a place'
        ref={inputRef}
        {...props}
      />
    );
  }

  return fallback;
};
