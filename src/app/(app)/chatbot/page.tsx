
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ChatWindow from '@/components/chatbot/ChatWindow';

export default function ChatbotPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Luna AI Chatbot"
        description="Ask Luna any questions you have about fertility, cycle tracking, and wellness."
      />
      <div className="flex-grow">
        <ChatWindow />
      </div>
    </div>
  );
}
