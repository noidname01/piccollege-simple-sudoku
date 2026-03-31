'use client';

import SudokuBoard from '@/components/SudokuBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SudokuBoard />
    </div>
  );
}