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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let cached: { expiresAt: number; body: string } | null = null;

const nameForSymbol = (symbol: string) => {
  if (symbol === "^JKSE") return "IHSG";
  if (symbol === "^GSPC") return "S&P 500";
  return symbol.replace(".JK", "");
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (cached && cached.expiresAt > Date.now()) {
    return new Response(cached.body, {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=45" },
    });
  }

  const allSymbols = [...INDEX_SYMBOLS, ...IDX_WATCHLIST];
  const batches = Array.from({ length: Math.ceil(allSymbols.length / 20) }, (_, index) =>
    allSymbols.slice(index * 20, index * 20 + 20)
  );
  const responses = await Promise.all(batches.map((batch) =>
    fetch(
      `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(batch.join(","))}&range=1d&interval=5m`,
      { headers: { "User-Agent": "Mozilla/5.0 KSPM-Nexus/1.0" } },
    )
  ));

  if (responses.some((response) => !response.ok)) {
    return new Response(JSON.stringify({ message: "Market data source unavailable." }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payloads = await Promise.all(responses.map((response) => response.json()));
  const quotes = payloads.flatMap((payload) => payload?.spark?.result ?? []).flatMap((entry: any) => {
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

  const body = JSON.stringify({
    indexes: INDEX_SYMBOLS.flatMap((symbol) => quotes.find((quote: any) => quote.symbol === symbol) ?? []),
    gainers: quotes
      .filter((quote: any) => quote.kind === "stock" && quote.changePercent > 0)
      .sort((a: any, b: any) => b.changePercent - a.changePercent)
      .slice(0, 5),
    losers: quotes
      .filter((quote: any) => quote.kind === "stock" && quote.changePercent < 0)
      .sort((a: any, b: any) => a.changePercent - b.changePercent)
      .slice(0, 5),
    updatedAt: new Date().toISOString(),
    source: "Yahoo Finance public market data",
  });

  cached = { expiresAt: Date.now() + 60_000, body };
  return new Response(body, {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=45" },
  });
});
