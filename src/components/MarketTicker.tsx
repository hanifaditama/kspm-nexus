import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MarketItem {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

const INDONESIA: MarketItem[] = [
  { name: "IHSG", value: 7423.45, change: 32.1, changePercent: 0.43 },
  { name: "BBCA", value: 10250, change: -75, changePercent: -0.73 },
  { name: "BBRI", value: 4890, change: 40, changePercent: 0.82 },
  { name: "TLKM", value: 3120, change: -20, changePercent: -0.64 },
];

const GLOBAL: MarketItem[] = [
  { name: "S&P 500", value: 6775.38, change: 158.9, changePercent: 2.4 },
  { name: "Nasdaq", value: 22604.66, change: 590.3, changePercent: 2.68 },
  { name: "Gold", value: 2341.5, change: 19.1, changePercent: 0.82 },
  { name: "Bitcoin", value: 71250, change: -1240, changePercent: -1.71 },
];

async function fetchMarkets(): Promise<{ indonesia: MarketItem[]; global: MarketItem[] }> {
  // TODO: replace with real API integration
  await new Promise((r) => setTimeout(r, 400));
  return { indonesia: INDONESIA, global: GLOBAL };
}

const formatValue = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatPercent = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const TickerCard = ({ item }: { item: MarketItem }) => {
  const up = item.changePercent >= 0;
  return (
    <div className="flex shrink-0 flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 min-w-[140px]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
        {item.name}
      </span>
      <span className="font-mono text-sm font-semibold text-white">
        {formatValue(item.value)}
      </span>
      <span
        className={`flex items-center gap-1 text-xs font-medium ${
          up ? "text-green-400" : "text-red-400"
        }`}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {formatPercent(item.changePercent)}
      </span>
    </div>
  );
};

const Skeleton = () => (
  <div className="flex shrink-0 flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 min-w-[140px]">
    <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
    <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
    <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
  </div>
);

const MarketTicker = () => {
  const [data, setData] = useState<{ indonesia: MarketItem[]; global: MarketItem[] } | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetchMarkets().then((d) => {
        if (active) setData(d);
      });
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const renderRow = (label: string, items: MarketItem[] | undefined) => (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-white/60">
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {items
          ? items.map((it) => <TickerCard key={it.name} item={it} />)
          : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a1428] border-y border-white/10">
      <div className="container flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-6">
        {renderRow("Indonesia", data?.indonesia)}
        {renderRow("Global", data?.global)}
      </div>
    </div>
  );
};

export default MarketTicker;
