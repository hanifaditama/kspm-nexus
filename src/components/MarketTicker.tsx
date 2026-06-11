import { useCallback, useEffect, useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { getMarketSnapshot, MarketQuote } from "@/services/marketService";

const formatValue = (quote: MarketQuote) =>
  quote.value.toLocaleString(quote.currency === "IDR" ? "id-ID" : "en-US", {
    minimumFractionDigits: quote.currency === "IDR" ? 0 : 2,
    maximumFractionDigits: quote.currency === "IDR" ? 0 : 2,
  });

const QuotePill = ({ quote, emphasized = false }: { quote: MarketQuote; emphasized?: boolean }) => {
  const up = quote.changePercent >= 0;
  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 ${
        emphasized
          ? "border-white/15 bg-[#1b1b1b]"
          : "border-white/10 bg-[#141414]"
      }`}
      title={`${quote.name}: ${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)`}
    >
      <span className="text-[13px] font-bold text-white">{quote.name}</span>
      <span className="font-mono text-[13px] font-semibold text-white/90">{formatValue(quote)}</span>
      <span className={`text-[12px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
        {up ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
      </span>
    </div>
  );
};

const Skeleton = () => <div className="h-10 w-44 shrink-0 animate-pulse rounded-md bg-white/10" />;

const MarketTicker = () => {
  const [indexes, setIndexes] = useState<MarketQuote[]>([]);
  const [gainers, setGainers] = useState<MarketQuote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const snapshot = await getMarketSnapshot();
      setIndexes(snapshot.indexes);
      setGainers(snapshot.gainers);
      setUpdatedAt(snapshot.updatedAt);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load]);

  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="border-y border-white/10 bg-[#090909] text-white" aria-label="Live market update">
      <div className="container flex min-h-14 items-center gap-3 py-2">
        <div className="flex shrink-0 items-center gap-2 border-r border-white/15 pr-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white">Markets</p>
            <p className="text-[10px] text-white/45">{updatedLabel ? `Updated ${updatedLabel} WIB` : "Live update"}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} />)
            : (
              <>
                {indexes.map((quote) => <QuotePill key={quote.symbol} quote={quote} emphasized />)}
                {gainers.length > 0 && (
                  <div className="ml-1 flex h-10 shrink-0 items-center gap-2 px-2 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Top Gainers IDX Liquid</span>
                  </div>
                )}
                {gainers.map((quote) => <QuotePill key={quote.symbol} quote={quote} />)}
                {error && indexes.length === 0 && (
                  <span className="px-3 text-xs text-white/55">Market data sedang tidak tersedia.</span>
                )}
                {!error && !loading && gainers.length === 0 && (
                  <span className="px-3 text-xs text-white/55">Belum ada saham watchlist yang menguat.</span>
                )}
              </>
            )}
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          aria-label="Refresh market data"
          title="Refresh market data"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </section>
  );
};

export default MarketTicker;
