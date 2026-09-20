// src/components/ChatContainer.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import { buildBriefingPrompt, BriefingPromptMode } from '@/lib/briefingPrompts';
import { getAllStatements, usClimatePolicies } from '@/lib/policyData';
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Cpu,
  FileSearch,
  Globe2,
  Landmark,
  Leaf,
  Loader2,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const MAX_INPUT_LENGTH = 1_000;

const briefingModes: Array<{
  mode: BriefingPromptMode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  accent: string;
}> = [
  {
    mode: 'summary',
    icon: ClipboardList,
    label: 'Brief me',
    description: 'Current stance, shifts, evidence, risks',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    mode: 'compare',
    icon: Scale,
    label: 'Compare',
    description: 'Domestic, global, and finance tensions',
    accent: 'from-sky-500 to-cyan-600',
  },
  {
    mode: 'timeline',
    icon: CalendarDays,
    label: 'Timeline',
    description: 'Dates, actors, rationale, change',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    mode: 'ambiguity',
    icon: Search,
    label: 'Find ambiguity',
    description: 'Clear signals and unresolved questions',
    accent: 'from-fuchsia-500 to-rose-500',
  },
  {
    mode: 'evidence',
    icon: FileSearch,
    label: 'Evidence scan',
    description: 'Statements, contradictions, confidence',
    accent: 'from-indigo-500 to-blue-600',
  },
];

const suggestedQuestions = [
  {
    icon: Globe2,
    label: 'International commitments',
    topic: 'international climate commitments',
    question: 'What is the US position on international climate commitments?',
  },
  {
    icon: Zap,
    label: 'Recent shifts',
    topic: 'climate policy over the last 13 months',
    question: 'How has US climate policy shifted over the last 13 months?',
  },
  {
    icon: Search,
    label: 'Policy ambiguity',
    topic: 'US energy policy ambiguity',
    question: 'What are the key areas of ambiguity in US energy policy?',
  },
  {
    icon: Landmark,
    label: 'Climate finance',
    topic: 'climate finance',
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
  'Technology transfer',
];

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, addMessage, setLoading, updateMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [activeTopic, setActiveTopic] = useState('Climate finance');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allStatements = useMemo(() => getAllStatements(), []);
  const userMessages = messages.filter((message) => message.role === 'user').length;
  const assistantMessages = messages.filter((message) => message.role === 'assistant');
  const latestSource = [...assistantMessages].reverse().find((message) => message.metadata?.source)?.metadata?.source;
  const isOverLimit = input.length > MAX_INPUT_LENGTH;
  const completionLevel = messages.length === 0 ? 'Ready' : isLoading ? 'Working' : 'Updated';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 156)}px`;
  }, [input]);

  const focusComposer = () => requestAnimationFrame(() => textareaRef.current?.focus());

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
      focusComposer();
    }
  };

  const setDraft = (question: string, topic?: string) => {
    if (topic) setActiveTopic(topic);
    setInput(question);
    focusComposer();
  };

  const applyBriefingMode = (mode: BriefingPromptMode, topic = activeTopic) => {
    setDraft(buildBriefingPrompt(mode, topic), topic);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const modelLabel = latestSource === 'openrouter-error' ? 'OpenRouter needs attention' : 'OpenRouter ready';

  return (
    <div className="min-h-dvh bg-transparent text-slate-950">
      <header className="sticky top-0 z-20 border-b border-white/80 bg-white/85 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-amber-300 text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.35)]">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">Policy intelligence workspace</p>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">
                US Climate & Energy Policy Briefing Console
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm">
              <Cpu className="h-4 w-4" />
              {modelLabel}
            </div>
            <button
              type="button"
              onClick={clearMessages}
              disabled={messages.length === 0 || isLoading}
              title="Clear briefing session"
              aria-label="Clear briefing session"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="bg-[linear-gradient(135deg,#7c3aed_0%,#0891b2_34%,#10b981_66%,#f59e0b_100%)] px-4 py-6 text-white sm:px-6">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] shadow-sm ring-1 ring-white/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  Friendly research flow
                </div>
                <h2 className="text-3xl font-semibold tracking-normal drop-shadow-sm sm:text-5xl">Ask sharper questions. Get brilliant briefings.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/95">
                  Choose a briefing mode, pick a topic, or write your own question. The workspace turns your intent into a focused policy analysis request.
                </p>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-5">
              {briefingModes.map(({ mode, icon: Icon, label, description, accent }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => applyBriefingMode(mode)}
                  className="group min-h-[8rem] rounded-xl border border-white/80 bg-white p-3 text-left shadow-[0_12px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-[0_18px_45px_rgba(8,145,178,0.18)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                  <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="block text-sm font-semibold text-slate-950">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={handleSendMessage} className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <FileSearch className="h-4 w-4 text-teal-700" />
                Research composer
              </div>
              <p className={`text-xs font-medium ${isOverLimit ? 'text-rose-600' : 'text-slate-500'}`}>
                {input.length}/{MAX_INPUT_LENGTH}
              </p>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for a policy read, comparison, timeline, evidence scan, or ambiguity assessment..."
                disabled={isLoading}
                rows={2}
                className="max-h-40 min-h-[5rem] flex-1 resize-none rounded-xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/70 px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-500 focus:bg-white focus:ring-4 focus:ring-fuchsia-100 disabled:cursor-not-allowed disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isOverLimit}
                aria-label={isLoading ? 'Running analysis' : 'Run analysis'}
                title={isLoading ? 'Running analysis' : 'Run analysis'}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-cyan-600 to-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(217,70,239,0.26)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4 rotate-45" />}
                Run analysis
              </button>
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {topicChips.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => applyBriefingMode('summary', topic)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  activeTopic === topic
                    ? 'border-cyan-300 bg-gradient-to-r from-cyan-600 to-emerald-500 text-white shadow-[0_10px_24px_rgba(20,184,166,0.25)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          <section className="min-h-[30rem] overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-amber-50 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <BarChart3 className="h-4 w-4 text-teal-700" />
                Analysis feed
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{userMessages} queries</span>
                <span>{completionLevel}</span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="p-4 sm:p-5">
                <div className="mb-5 max-w-2xl">
                  <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                    Start with a guided lane or ask directly.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    These buttons fill the composer with focused prompts that help the model produce clearer briefings, stronger evidence, and better next-step judgment.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestedQuestions.map(({ icon: Icon, label, question, topic }) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setDraft(question, topic)}
                      className="group min-h-[7rem] rounded-xl border border-white/80 bg-gradient-to-br from-white via-cyan-50/50 to-amber-50/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-white hover:shadow-[0_14px_35px_rgba(8,145,178,0.14)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm group-hover:text-teal-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
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
                  <div className="border-b border-slate-200 bg-[#fffdf7] px-4 py-5 sm:px-5">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
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
          <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.09)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              Session snapshot
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-lime-50 p-3 shadow-sm">
                <p className="text-2xl font-semibold text-emerald-900">{userMessages}</p>
                <p className="text-xs text-emerald-700">Queries</p>
              </div>
              <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-100 to-cyan-50 p-3 shadow-sm">
                <p className="text-2xl font-semibold text-sky-900">{usClimatePolicies.length}</p>
                <p className="text-xs text-sky-700">Themes</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-100 to-orange-50 p-3 shadow-sm">
                <p className="text-2xl font-semibold text-amber-900">{allStatements.length}</p>
                <p className="text-xs text-amber-700">Statements</p>
              </div>
              <div className="rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-100 to-pink-50 p-3 shadow-sm">
                <p className="text-2xl font-semibold text-fuchsia-900">5</p>
                <p className="text-xs text-fuchsia-700">Modes</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.09)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-teal-700" />
              Best next actions
            </div>
            <div className="space-y-2">
              {briefingModes.slice(1).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => applyBriefingMode(mode)}
                  className="flex w-full items-center gap-2 rounded-xl border border-cyan-100 bg-gradient-to-r from-white to-cyan-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-white hover:text-fuchsia-800 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                  <Icon className="h-4 w-4 flex-none" />
                  {label} {activeTopic}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.09)] backdrop-blur">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Briefing lanes
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map(({ icon: Icon, label, question, topic }) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setDraft(question, topic)}
                  className="flex w-full items-center gap-2 rounded-xl border border-amber-100 bg-gradient-to-r from-white to-amber-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:text-cyan-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
