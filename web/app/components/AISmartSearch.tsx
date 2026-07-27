'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic, Search, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISearchProps {
  onSearch: (query: string, parsed?: {
    category?: string | null;
    maxPrice?: number | null;
    aiSummary?: string;
  }) => void;
  initialQuery?: string;
}

interface AIParseResult {
  searchQuery: string;
  parsedQuery: {
    category: string | null;
    maxPrice: number | null;
    intent: string;
    brand: string | null;
  };
  aiSummary: string;
  suggestions: string[];
}

const QUICK_SEARCHES = [
  'Cheapest cooking oil',
  'Amul milk under ₹80',
  'Protein bar under ₹150',
  'Sugar-free biscuits',
  'Organic atta 5kg',
  'Best price shampoo',
];

export default function AISmartSearch({ onSearch, initialQuery = '' }: AISearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [aiResult, setAIResult] = useState<AIParseResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Auto-trigger AI parse on voice input
      handleAISearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleAISearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    if (isAIMode) {
      setIsParsing(true);
      setAIResult(null);
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data: AIParseResult = await res.json();
        setAIResult(data);
        onSearch(data.searchQuery, {
          category: data.parsedQuery.category,
          maxPrice: data.parsedQuery.maxPrice,
          aiSummary: data.aiSummary,
        });
      } catch {
        onSearch(searchQuery);
      } finally {
        setIsParsing(false);
      }
    } else {
      onSearch(searchQuery);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAISearch();
  };

  const clearQuery = () => {
    setQuery('');
    setAIResult(null);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          'relative flex items-center w-full rounded-2xl border transition-all duration-300',
          isAIMode
            ? 'border-primary/60 bg-primary/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
            : 'border-border/60 bg-card',
        )}>
          {/* Left icon */}
          <div className="absolute left-4 flex items-center space-x-1">
            {isAIMode ? (
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={isAIMode
              ? '✨ Try: "cheapest protein bar under ₹150"...'
              : 'Search across 50K+ SKUs (Milk, Atta, Earbuds...)'}
            className="w-full bg-transparent pl-12 pr-40 py-4 text-base md:text-lg focus:outline-none"
          />

          {/* Right controls */}
          <div className="absolute right-3 flex items-center space-x-1.5">
            {query && (
              <button type="button" onClick={clearQuery} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={cn(
                'p-2 rounded-xl border transition-all',
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-secondary/60 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground'
              )}
              title="Voice Search (en-IN)"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* AI Toggle */}
            <button
              type="button"
              onClick={() => setIsAIMode(!isAIMode)}
              className={cn(
                'flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                isAIMode
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary/60 text-muted-foreground border-border/50 hover:bg-secondary'
              )}
              title="Toggle AI Natural Language Search"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI</span>
            </button>

            <button
              type="submit"
              disabled={isParsing}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm disabled:opacity-70"
            >
              {isParsing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Quick search suggestions dropdown */}
        {showSuggestions && !query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                ✨ AI-Powered Quick Searches
              </p>
              {QUICK_SEARCHES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={() => {
                    setQuery(suggestion);
                    handleAISearch(suggestion);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-secondary/60 transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* AI Result Banner */}
      {aiResult && isAIMode && (
        <div className="flex flex-wrap items-center gap-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/90">{aiResult.aiSummary}</p>
          </div>
          {aiResult.parsedQuery.maxPrice && (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl font-semibold">
              Max ₹{aiResult.parsedQuery.maxPrice}
            </span>
          )}
          {aiResult.parsedQuery.category && (
            <span className="text-xs bg-secondary/60 text-foreground border border-border/50 px-2.5 py-1.5 rounded-xl">
              📦 {aiResult.parsedQuery.category.split(' ')[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
