import React, { useEffect } from 'react';
import { Select, Tag } from 'antd';
import { BranchesOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBranchStore } from '@/store/branch.store';
import { useUIStore } from '@/store/ui.store';
import { branchesApi } from '@/api/branches.api';

export function BranchSelector() {
  const { t } = useTranslation('branches');
  const language = useUIStore((s) => s.language);
  const branches = useBranchStore((s) => s.branches);
  const currentBranchId = useBranchStore((s) => s.currentBranchId);
  const setBranches = useBranchStore((s) => s.setBranches);
  const setCurrentBranch = useBranchStore((s) => s.setCurrentBranch);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res: any = await branchesApi.dropdown();
        const data = Array.isArray(res) ? res : res?.data || [];
        setBranches(data);

        // Auto-select main branch if none selected
        if (!currentBranchId && data.length > 0) {
          const main = data.find((b: any) => b.isMain);
          setCurrentBranch(main ? main.id : data[0].id);
        }
      } catch {
        // Silently fail — branches may not be set up yet
      }
    };
    loadBranches();
  }, []);

  // Only visible when there are multiple branches
  if (branches.length <= 1) return null;

  const currentBranch = branches.find((b) => b.id === currentBranchId);

  return (
    <>
      {currentBranch && (
        <Tag
          icon={<BranchesOutlined style={{ fontSize: 12 }} />}
          color="blue"
          style={{
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 12,
            margin: 0,
            padding: '2px 10px',
          }}
        >
          {currentBranch.code}
        </Tag>
      )}
      <Select
        size="small"
        value={currentBranchId}
        onChange={(value) => setCurrentBranch(value)}
        style={{ width: 160 }}
        popupMatchSelectWidth={false}
        options={branches.map((b) => ({
          value: b.id,
          label: language === 'ar' ? b.nameAr : b.nameEn,
        }))}
      />
    </>
  );
}
