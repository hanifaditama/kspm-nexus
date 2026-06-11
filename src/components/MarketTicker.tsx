import { useEffect, useState } from "react";

export interface MarketItem {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

const SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: "^JKSE", name: "IHSG" },
  { symbol: "BBCA.JK", name: "BBCA" },
  { symbol: "BBRI.JK", name: "BBRI" },
  { symbol: "TLKM.JK", name: "TLKM" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "GC=F", name: "Gold" },
  { symbol: "BTC-USD", name: "Bitcoin" },
];

async function fetchQuotes(): Promise<MarketItem[]> {
  const symbols = SYMBOLS.map((item) => item.symbol).join(",");
  const target = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("Market data request failed.");
  const json = await response.json();
  const quotes = json?.quoteResponse?.result ?? [];
  return quotes.flatMap((quote: any) => {
    const configured = SYMBOLS.find((item) => item.symbol === quote.symbol);
    const value = Number(quote.regularMarketPrice);
    const change = Number(quote.regularMarketChange);
    const changePercent = Number(quote.regularMarketChangePercent);
    if (!configured || !Number.isFinite(value)) return [];
    return [{ name: configured.name, value, change, changePercent }];
  });
}

const formatValue = (n: number) => {
  if (n >= 1000)
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Arrow = ({ up }: { up: boolean }) => (
  <span className={`inline-block text-[10px] leading-none ${up ? "text-green-400" : "text-red-400"}`}>
    {up ? "▲" : "▼"}
  </span>
);

const Pill = ({ item }: { item: MarketItem }) => {
  const up = item.changePercent >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full bg-black px-4 py-2 ring-1 ring-white/10">
      <span className="text-[13px] font-bold tracking-tight text-white">{item.name}</span>
      <span className="font-mono text-[13px] text-white/90">{formatValue(item.value)}</span>
      <span className={`flex items-center gap-1 text-[12px] font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
        <Arrow up={up} />
        {up ? "+" : ""}
        {item.changePercent.toFixed(2)}%
      </span>
    </div>
  );
};

const Skeleton = () => (
  <div className="h-9 w-44 shrink-0 animate-pulse rounded-full bg-white/5 ring-1 ring-white/10" />
);

const MarketTicker = () => {
  const [items, setItems] = useState<MarketItem[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const results = await fetchQuotes();
        if (active && results.length) setItems(results);
        else if (active) setItems((current) => current ?? []);
      } catch {
        if (active) setItems((current) => current ?? []);
      }
    };
    load();
    const id = setInterval(load, 20_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="bg-[#0a1428] border-y border-white/10">
      <div className="container py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {items === null
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            : items.length === 0
            ? <span className="text-xs text-white/60">Market data unavailable</span>
            : items.map((it) => <Pill key={it.name} item={it} />)}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
