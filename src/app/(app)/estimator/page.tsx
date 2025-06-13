
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import OvulationEstimationForm from '@/components/estimator/OvulationEstimationForm';

export default function EstimatorPage() {
  return (
    <div>
      <PageHeader
        title="Ovulation Estimator"
        description="Get an AI-powered estimation of your upcoming ovulation based on your cycle data."
      />
      <OvulationEstimationForm />
    </div>
  );
}
