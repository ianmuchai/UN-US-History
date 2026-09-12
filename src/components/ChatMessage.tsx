// src/components/ChatMessage.tsx
'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, Check, Copy, Cpu, Database, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderInlineText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function renderMessageContent(content: string) {
  return content.split('\n').map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={`space-${index}`} className="h-2" />;
    }

    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      return (
        <p key={index} className="mt-4 first:mt-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {trimmedLine.slice(2, -2)}
        </p>
      );
    }

    if (/^\d+\.\s/.test(trimmedLine)) {
      return (
        <p key={index} className="mt-2 text-sm leading-6 text-slate-800">
          {renderInlineText(trimmedLine)}
        </p>
      );
    }

    if (trimmedLine.startsWith('- ')) {
      return (
        <div key={index} className="mt-1.5 flex gap-2 text-sm leading-6 text-slate-800">
          <span className="mt-[0.58rem] h-1.5 w-1.5 flex-none rounded-full bg-teal-600" />
          <p>{renderInlineText(trimmedLine.slice(2))}</p>
        </div>
      );
    }

    return (
      <p key={index} className="mt-2 first:mt-0 text-sm leading-6 text-slate-800">
        {renderInlineText(trimmedLine)}
      </p>
    );
  });
}

function sourceLabel(source: string | undefined) {
  if (source === 'openrouter') {
    return { label: 'OpenRouter', icon: Cpu, className: 'border-teal-200 bg-teal-50 text-teal-800' };
  }

  if (source === 'fallback') {
    return { label: 'Local fallback', icon: Database, className: 'border-amber-200 bg-amber-50 text-amber-800' };
  }

  return null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const source = sourceLabel(message.metadata?.source);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <article className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <User className="h-3.5 w-3.5" />
          Research query
          <span className="font-normal normal-case tracking-normal text-slate-400">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-base leading-7 text-slate-950">{message.content}</p>
      </article>
    );
  }

  return (
    <article className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <BarChart3 className="h-3.5 w-3.5" />
          Analysis brief
          <span className="font-normal normal-case tracking-normal text-slate-400">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {source && (
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${source.className}`}>
              <source.icon className="h-3.5 w-3.5" />
              {source.label}
            </span>
          )}
          {message.content && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied response' : 'Copy response'}
              title={copied ? 'Copied response' : 'Copy response'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {copied ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="max-w-4xl">{renderMessageContent(message.content)}</div>

      {message.metadata?.citations && message.metadata.citations.length > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          <span className="font-semibold">Sources: </span>
          {message.metadata.citations.join(', ')}
        </div>
      )}
    </article>
  );
};
