// src/components/ChatContainer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import {
  ArrowUp,
  BarChart3,
  Cpu,
  FileSearch,
  Globe2,
  Landmark,
  Leaf,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const MAX_INPUT_LENGTH = 1_000;

const suggestedQuestions = [
  {
    icon: Globe2,
    label: 'International commitments',
    question: 'What is the US position on international climate commitments?',
  },
  {
    icon: Zap,
    label: 'Recent shifts',
    question: 'How has US climate policy shifted over the last 13 months?',
  },
  {
    icon: Search,
    label: 'Policy ambiguity',
    question: 'What are the key areas of ambiguity in US energy policy?',
  },
  {
    icon: Landmark,
    label: 'Climate finance',
    question: 'Explain the US approach to climate finance.',
  },
];

const topicChips = [
  'Paris Agreement',
  'Clean energy',
  'Climate finance',
  'Methane',
  'China competition',
  'Just transition',
  'Adaptation',
];

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, addMessage, setLoading, updateMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userMessages = messages.filter((message) => message.role === 'user').length;
  const assistantMessages = messages.filter((message) => message.role === 'assistant');
  const latestSource = [...assistantMessages].reverse().find((message) => message.metadata?.source)?.metadata?.source;
  const isOverLimit = input.length > MAX_INPUT_LENGTH;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [input]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isOverLimit) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    let assistantId = '';
    let assistantTimestamp = '';
    let assistantSource: string | undefined;
    let fullContent = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantMessageAdded = false;
      let bufferedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          bufferedText += decoder.decode();
          break;
        }

        bufferedText += decoder.decode(value, { stream: true });
        const lines = bufferedText.split('\n');
        bufferedText = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.type === 'init') {
              assistantId = data.id;
              assistantTimestamp = data.timestamp;
              assistantSource = data.source;
              if (!assistantMessageAdded) {
                addMessage({
                  id: assistantId,
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(assistantTimestamp),
                  metadata: { source: assistantSource },
                });
                assistantMessageAdded = true;
              }
            } else if (data.type === 'chunk') {
              fullContent += data.content;
              updateMessage(assistantId, fullContent, { source: assistantSource });
            }
          } catch {
            // Ignore malformed stream lines without interrupting the conversation.
          }
        }
      }

      if (bufferedText.trim()) {
        try {
          const data = JSON.parse(bufferedText);
          if (data.type === 'chunk') {
            fullContent += data.content;
            updateMessage(assistantId, fullContent, { source: assistantSource });
          }
        } catch {
          // Ignore a trailing malformed line from an interrupted stream.
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleStarterClick = (question: string) => {
    setInput(question);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const modelLabel = latestSource === 'siliconflow' ? 'SiliconFlow' : latestSource === 'fallback' ? 'Local fallback' : 'Ready';

  return (
    <div className="min-h-dvh bg-[#f6f7f4] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">
                US Climate & Energy Policy Briefing Console
              </h1>
              <p className="text-sm text-slate-600">
                Statement analysis, policy shifts, and ambiguity review for June 2025 to June 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
              <Cpu className="h-4 w-4" />
              {modelLabel}
            </div>
            <button
              type="button"
              onClick={clearMessages}
              disabled={messages.length === 0 || isLoading}
              title="Clear briefing session"
              aria-label="Clear briefing session"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0 space-y-4">
          <form onSubmit={handleSendMessage} className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <FileSearch className="h-4 w-4 text-teal-700" />
                  Research query
                </div>
                <p className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-slate-500'}`}>
                  {input.length}/{MAX_INPUT_LENGTH}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for a policy read, comparison, quotation scan, or ambiguity assessment..."
                disabled={isLoading}
                rows={2}
                className="max-h-36 min-h-[4.5rem] flex-1 resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isOverLimit}
                aria-label={isLoading ? 'Running analysis' : 'Run analysis'}
                title={isLoading ? 'Running analysis' : 'Run analysis'}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4 rotate-45" />}
                Run
              </button>
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {topicChips.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleStarterClick(`Summarize the US position on ${topic}.`)}
                className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
              >
                {topic}
              </button>
            ))}
          </div>

          <section className="min-h-[30rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <BarChart3 className="h-4 w-4 text-teal-700" />
                Analysis feed
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{userMessages} queries</span>
                <span>8 themes</span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="p-4 sm:p-5">
                <div className="mb-5 max-w-2xl">
                  <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                    Start with a policy question or choose a briefing lane.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Use this console to compare shifts, surface ambiguity, and pull representative statements across international commitments, domestic transition, finance, methane, technology, equity, and adaptation.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestedQuestions.map(({ icon: Icon, label, question }) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleStarterClick(question)}
                      className="group min-h-[7rem] rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-700 group-hover:text-teal-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <ArrowUp className="h-4 w-4 rotate-45 text-slate-400 transition group-hover:text-teal-700" />
                      </div>
                      <p className="text-sm font-semibold text-slate-950">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-5">
                    <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
                      Running policy analysis
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-4">
          <section className="border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              Session snapshot
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-2xl font-semibold text-slate-950">{userMessages}</p>
                <p className="text-xs text-slate-500">Queries</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-2xl font-semibold text-slate-950">8</p>
                <p className="text-xs text-slate-500">Themes</p>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Briefing lanes
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map(({ icon: Icon, label, question }) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleStarterClick(question)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
                >
                  <Icon className="h-4 w-4 flex-none" />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};
