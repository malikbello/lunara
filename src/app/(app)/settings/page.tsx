
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SettingsPanel from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account, cycle data, integrations, and privacy preferences."
      />
      <SettingsPanel />
    </div>
  );
}
