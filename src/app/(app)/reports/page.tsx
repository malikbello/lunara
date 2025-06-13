
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ReportView from '@/components/reports/ReportView';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Your Reports"
        description="Review your historical cycle data, mood logs, and other tracked information. Export your data at any time."
      />
      <ReportView />
    </div>
  );
}
