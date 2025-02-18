import FilterCategory from '@/components/shared/FilterCategory';
import Collection from '@/components/shared/Collection';
import Search from '@/components/shared/Search';
import { Button } from '@/components/ui/button';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types/parameters.types';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import DatePicker from 'react-datepicker';
import FilterDate from '@/components/shared/FilterDate';

export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const from = searchParams?.from ? String(searchParams?.from) : '';
  const to = searchParams?.to ? String(searchParams?.to) : '';
  const category = (searchParams?.category as string) || '';

  const events = await getAllEvents({
    category,
    from,
    to,
    page,
    limit: 6,
  });

  const t = await getTranslations('Landing');

  return (
    <>
      <section className='bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10'>
        <div className='wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0'>
          <div className='flex flex-col justify-center gap-8'>
            <h1 className='h1-bold'>{t('title')}</h1>
            <p className='p-regular-20 md:p-regular-24'>{t('sub')}</p>
            <Button size='lg' asChild className='button w-full sm:w-fit'>
              <Link href='#events'>{t('explore')}</Link>
            </Button>
          </div>

          <Image
            src='/assets/images/hero_rincon.jpg'
            alt='hero'
            width={1000}
            height={1000}
            className='max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]'
          />
        </div>
      </section>

      <section
        id='events'
        className='wrapper my-8 flex flex-col gap-8 md:gap-12'
      >
        {/*<div className='flex w-full flex-col flex-wrap'>*/}
        <div className='flex flex-row flex-wrap items-center justify-center gap-2 text-lg'>
          Give me
          <FilterCategory className='min-w-[120px] max-w-[200px] shrink-0' />
          events from
          <FilterDate urlParam='from' className='max-w-[150px] text-sm' />
          to
          <FilterDate urlParam='to' className='max-w-[150px] text-sm' />
        </div>
        {/*</div>*/}

        <Collection
          data={events?.data}
          emptyTitle={t('collection-title')}
          emptyStateSubtext={t('collection-sub')}
          collectionType='All_Events'
          limit={6}
          page={page}
          totalPages={events?.totalPages}
        />
      </section>
    </>
  );
}
