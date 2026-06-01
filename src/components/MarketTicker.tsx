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

async function fetchQuote(symbol: string, name: string): Promise<MarketItem | null> {
  try {
    const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) return null;
    const value = Number(meta.regularMarketPrice);
    const prev = Number(meta.chartPreviousClose ?? meta.previousClose);
    const change = value - prev;
    const changePercent = prev ? (change / prev) * 100 : 0;
    return { name, value, change, changePercent };
  } catch {
    return null;
  }
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
      const results = await Promise.all(SYMBOLS.map((s) => fetchQuote(s.symbol, s.name)));
      if (!active) return;
      const clean = results.filter((r): r is MarketItem => r !== null);
      if (clean.length) setItems(clean);
      else if (!items) setItems([]);
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
