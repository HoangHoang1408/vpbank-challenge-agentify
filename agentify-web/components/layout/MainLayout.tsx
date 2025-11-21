'use client';

import { cn } from '@/lib/utils';
import { Layout, Splitter } from 'antd';
import { FC, ReactNode, useEffect, useState } from 'react';
import { LuSparkles } from 'react-icons/lu';
import { AgentChat } from '../agent';
import Header from './Header';

interface Props {
  children: ReactNode;
}

const MainLayout: FC<Props> = ({ children }) => {
  const [currentPanelSize, setcurrentPanelSize] = useState<
    Array<string | number>
  >(['100%', '0%']);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  const handleOpenAiPanel = () => {
    if (windowWidth < 400) {
      setcurrentPanelSize([0, windowWidth]);
    } else {
      setcurrentPanelSize([windowWidth - 400, 400]);
    }
  };

  useEffect(() => {
    if (windowWidth < 400) {
      setcurrentPanelSize([0, windowWidth]);
    } else {
      setcurrentPanelSize([windowWidth - 400, 400]);
    }
  }, [windowWidth]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = (size: number[]) => {
    setcurrentPanelSize(size);
  };

  const handleCloseAiPanel = () => {
    setcurrentPanelSize(['100%', '0%']);
  };

  return (
    <>
      <Splitter className="h-dvh! overflow-hidden" onResize={handleResize}>
        <Splitter.Panel size={currentPanelSize[0]} min={400}>
          <Layout>
            <Header />
            <Layout.Content className="bg-linear-to-br from-background via-background to-primary/5 flex-1! overflow-y-auto">
              {children}
            </Layout.Content>
          </Layout>
        </Splitter.Panel>

        <Splitter.Panel
          size={currentPanelSize[1]}
          min={300}
          resizable={windowWidth > 400}
        >
          <AgentChat onClose={handleCloseAiPanel} />
        </Splitter.Panel>
      </Splitter>

      <button
        className={cn(
          'fixed top-1/2 right-4 -translate-y-1/2',
          'h-24 sm:h-32 w-10 sm:w-12 hover:w-12 sm:hover:w-14 px-4 py-2',
          '[&_svg]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
          'flex flex-col items-center justify-center gap-2',
          'bg-primary bg-linear-to-b from-primary to-accent hover:bg-primary/90',
          'rounded-md rounded-l-2xl shadow-lg ',
          'text-sm font-medium',
          'disabled:pointer-events-none disabled:opacity-50',
          'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'transition-all duration-200',
          'whitespace-nowrap focus-visible:outline-none z-10 cursor-pointer',
          currentPanelSize[1] === 0 || currentPanelSize[1] === '0%'
            ? 'opacity-100 visible'
            : 'opacity-0 invisible',
        )}
        onClick={handleOpenAiPanel}
      >
        <LuSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
        <span className="text-xs text-white font-semibold [writing-mode:vertical-rl] rotate-180">
          AI Agent
        </span>
      </button>
    </>
  );
};

export default MainLayout;
