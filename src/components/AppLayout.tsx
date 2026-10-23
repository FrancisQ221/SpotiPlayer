import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PersistentPlayer } from './PersistentPlayer';
import { CreatePlaylistModal } from './modals/CreatePlaylistModal';
import { DonateModal } from './modals/DonateModal';
import { AddToPlaylistModal } from './modals/AddToPlaylistModal';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-[#070B0E] text-[#dde3ec] font-sans flex relative overflow-hidden select-none">
      {/* Ambient Nocturne Audio lighting glows */}
      <div className="fixed top-[-10%] left-[20%] w-[550px] h-[550px] bg-[#00e599]/[0.045] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[#f5a623]/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[25%] w-[450px] h-[450px] bg-[#06b6d4]/[0.03] rounded-full blur-[130px] pointer-events-none" />

      {/* 1. Left Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Stage (offset by sidebar width 256px / w-64) */}
      <div className="ml-64 flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
        {/* Sticky Global Header with Search & Controls */}
        <Header />

        {/* Scrollable Dynamic Content with generous bottom padding to clear floating player */}
        <main className="flex-1 px-8 py-6 pb-48 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Floating Bottom Persistent Player */}
      <PersistentPlayer />

      {/* Modals & Dialogs */}
      <CreatePlaylistModal />
      <DonateModal />
      <AddToPlaylistModal />
    </div>
  );
};
