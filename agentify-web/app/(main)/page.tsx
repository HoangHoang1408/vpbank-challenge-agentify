'use client';

import type { FC } from 'react';
import { EventList, TodoList } from './_components';

const Home: FC = () => {
  return (
    <div className="py-6 sm:py-12 md:py-16 px-3 sm:px-4">
      <TodoList />
      <EventList />
    </div>
  );
};

export default Home;
