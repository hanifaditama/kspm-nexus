import { supabase } from "@/integrations/supabase/client";

export interface MarketQuote {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  marketTime: number;
  kind: "index" | "stock";
}

export interface MarketSnapshot {
  indexes: MarketQuote[];
  gainers: MarketQuote[];
  losers: MarketQuote[];
  updatedAt: string;
  source: string;
}

const INDEX_SYMBOLS = ["^JKSE", "^GSPC"];
const IDX_WATCHLIST = [
  "ACES.JK", "ADRO.JK", "AKRA.JK", "AMMN.JK", "ANTM.JK", "ARTO.JK", "ASII.JK",
  "BBCA.JK", "BBNI.JK", "BBRI.JK", "BBTN.JK", "BMRI.JK", "BRIS.JK", "BRPT.JK",
  "BUKA.JK", "CPIN.JK", "ESSA.JK", "EXCL.JK", "GOTO.JK", "HRUM.JK", "ICBP.JK",
  "INCO.JK", "INDF.JK", "INKP.JK", "INTP.JK", "ITMG.JK", "JPFA.JK", "JSMR.JK",
  "KLBF.JK", "MDKA.JK", "MEDC.JK", "MIKA.JK", "PGAS.JK", "PTBA.JK", "SCMA.JK",
  "SIDO.JK", "SMGR.JK", "SRTG.JK", "TBIG.JK", "TINS.JK", "TLKM.JK", "TOWR.JK",
  "UNTR.JK", "UNVR.JK",
];

const nameForSymbol = (symbol: string) => {
  if (symbol === "^JKSE") return "IHSG";
  if (symbol === "^GSPC") return "S&P 500";
  return symbol.replace(".JK", "");
};

const parseSparkResponse = (payload: any): MarketSnapshot => {
  const quotes: MarketQuote[] = (payload?.spark?.result ?? []).flatMap((entry: any) => {
    const meta = entry?.response?.[0]?.meta;
    const value = Number(meta?.regularMarketPrice);
    const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose);
    if (!meta || !Number.isFinite(value) || !Number.isFinite(previous) || previous === 0) return [];
    const change = value - previous;
    const isIndex = INDEX_SYMBOLS.includes(entry.symbol);
    return [{
      symbol: entry.symbol,
      name: nameForSymbol(entry.symbol),
      value,
      change,
      changePercent: (change / previous) * 100,
      currency: meta.currency ?? (isIndex ? "" : "IDR"),
      marketTime: Number(meta.regularMarketTime ?? 0),
      kind: isIndex ? "index" : "stock",
    }];
  });

  return {
    indexes: INDEX_SYMBOLS.flatMap((symbol) => quotes.find((quote) => quote.symbol === symbol) ?? []),
    gainers: quotes
      .filter((quote) => quote.kind === "stock" && quote.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5),
    losers: quotes
      .filter((quote) => quote.kind === "stock" && quote.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5),
    updatedAt: new Date().toISOString(),
    source: "Yahoo Finance public market data",
  };
};

const loadFallback = async () => {
  const allSymbols = [...INDEX_SYMBOLS, ...IDX_WATCHLIST];
  const batches = Array.from({ length: Math.ceil(allSymbols.length / 20) }, (_, index) =>
    allSymbols.slice(index * 20, index * 20 + 20)
  );
  const results = await Promise.all(batches.map(async (batch) => {
    const target = `http://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(batch.join(","))}&range=1d&interval=5m`;
    const response = await fetch(`https://r.jina.ai/${target}`, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error("Free market data source is unavailable.");
    const text = await response.text();
    const marker = "Markdown Content:";
    const markerIndex = text.indexOf(marker);
    if (markerIndex < 0) throw new Error("Unexpected market data response.");
    return JSON.parse(text.slice(markerIndex + marker.length).trim())?.spark?.result ?? [];
  }));

  return parseSparkResponse({ spark: { result: results.flat() } });
};

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const { data, error } = await supabase.functions.invoke<MarketSnapshot>("market-data");
  if (!error && data?.indexes?.length) return data;
  return loadFallback();
}
