import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ICategory } from '@/lib/database/models/category.model';
import { startTransition, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import {
  createCategory,
  getAllCategories,
} from '@/lib/actions/category.actions';

type DropdownProps = {
  value?: string;
  onChangeHandler?: () => void;
};

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = () =>
    startTransition(() => {
      createCategory({
        categoryName: newCategory.trim(),
      }).then((category) => {
        if (category) {
          setCategories((prevState) => [...prevState, category]);
        }
        setIsDialogOpen(false);
      });
    });

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      if (categoryList) {
        setCategories(categoryList);
      }
    };

    getCategories();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (isDialogOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [isDialogOpen]);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className='select-field'>
        <SelectValue placeholder='Category' />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 &&
          categories.map((category) => (
            <SelectItem
              key={category._id}
              value={category._id}
              className='select-item p-regular-14'
            >
              {category.name}
            </SelectItem>
          ))}

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger className='p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500'>
            Add new category
          </AlertDialogTrigger>

          <AlertDialogContent className='bg-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>New Category</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  ref={inputRef}
                  type='text'
                  placeholder='Category name'
                  className='input-field mt-3'
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' ? handleAddCategory() : undefined
                  }
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAddCategory()}>
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
