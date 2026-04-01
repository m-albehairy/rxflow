import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BranchInfo {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  isMain: boolean;
}

interface BranchState {
  currentBranchId: string | null;
  branches: BranchInfo[];
  setCurrentBranch: (id: string) => void;
  setBranches: (branches: BranchInfo[]) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      currentBranchId: null,
      branches: [],
      setCurrentBranch: (id) => set({ currentBranchId: id }),
      setBranches: (branches) => set({ branches }),
    }),
    { name: 'pharmapos-branch' },
  ),
);
