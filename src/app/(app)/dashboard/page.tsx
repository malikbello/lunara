
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DailyOverview from '@/components/dashboard/DailyOverview';
import MenstrualCalendar from '@/components/dashboard/MenstrualCalendar';
import PersonalizedInsightCard from '@/components/dashboard/PersonalizedInsightCard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome Back!"
        description="Here's your fertility overview for today."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
           <DailyOverview />
        </div>

        <div className="lg:col-span-3">
          <MenstrualCalendar />
        </div>

        <div className="lg:col-span-3">
          <PersonalizedInsightCard />
        </div>
      </div>

      {/* Placeholder for future sections like symptom trends or educational content */}
      {/* 
      <section>
        <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Symptom Trends</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Symptom tracking and charts will appear here.</p>
          </CardContent>
        </Card>
      </section> 
      */}
    </div>
  );
}
