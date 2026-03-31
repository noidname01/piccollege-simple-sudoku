'use client';

import SudokuBoard from '@/components/SudokuBoard';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SudokuBoard />
    </div>
  );
}