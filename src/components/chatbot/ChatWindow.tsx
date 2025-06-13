
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Sparkles } from 'lucide-react';
import { fertilityChatbot, FertilityChatbotInput } from '@/ai/flows/fertility-chatbot';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initial greeting from Luna
  useEffect(() => {
    setMessages([
      { id: '0', sender: 'luna', text: "Hi there! I'm Luna, your AI fertility assistant. How can I help you today?", timestamp: Date.now() }
    ]);
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatbotInput: FertilityChatbotInput = {
        question: input,
        // Context could be dynamically added here based on user data
        // context: "User is currently trying to conceive and is in their fertile window." 
      };
      const response = await fertilityChatbot(chatbotInput);
      const lunaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'luna',
        text: response.answer,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, lunaMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'luna',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Chat Error",
        description: "Could not get a response from Luna. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-card text-card-foreground rounded-lg shadow-xl border border-border overflow-hidden">
      <header className="p-4 border-b border-border">
        <h2 className="font-headline text-xl font-semibold text-card-foreground flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Chat with Luna
        </h2>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-end gap-2",
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.sender === 'luna' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100/E6E6FA/7F00FF.png?text=L" alt="Luna" data-ai-hint="bot avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground">L</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2 text-sm shadow",
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-accent text-accent-foreground rounded-bl-none'
                )}
              >
                {msg.text.split('\n').map((line, index) => (
                  <span key={index}>{line}<br/></span>
                ))}
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                   {/* Placeholder for user avatar, if available */}
                  <AvatarFallback className="bg-secondary text-secondary-foreground"><User size={18}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100/E6E6FA/7F00FF.png?text=L" alt="Luna" data-ai-hint="bot avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground">L</AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-lg px-4 py-2 text-sm shadow bg-accent text-accent-foreground rounded-bl-none">
                <Skeleton className="h-4 w-8 my-1 animate-pulse bg-muted-foreground/30" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Luna anything about fertility..."
            className="flex-1 bg-input text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" disabled={isLoading || input.trim() === ''} className="bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
