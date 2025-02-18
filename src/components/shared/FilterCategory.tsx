'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllCategories } from '@/lib/actions/category.actions';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';

import type { ICategory } from '@/lib/database/models/category.model';
import type { ToJSON } from '@/types/utility.types';

interface Props {
  className: string;
}

const FilterCategory = ({ className }: Props) => {
  const [categories, setCategories] = useState<ToJSON<ICategory>[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      if (categoryList) {
        setCategories(categoryList);
      }
    };

    getCategories();
  }, []);

  const onSelectCategory = (category: string) => {
    let newUrl = '';

    if (category && category !== 'All') {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'category',
        value: category,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['category'],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <Select onValueChange={(value: string) => onSelectCategory(value)}>
      <SelectTrigger className={`input-wrapper ${className}`}>
        <SelectValue placeholder='All' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='All' className='select-item p-regular-14'>
          All
        </SelectItem>

        {categories.map((category) => (
          <SelectItem
            value={category.name}
            key={category._id}
            className='select-item p-regular-14'
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterCategory;
