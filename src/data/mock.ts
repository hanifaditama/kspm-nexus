import type { Article, Event, TeamMember, Program } from "@/types/content";

export const programs: Program[] = [
  {
    _id: "1",
    title: "Market Analysis Workshop",
    description: "Learn fundamental and technical analysis techniques used by professional analysts in capital markets.",
    icon: "BarChart3",
    features: ["Technical Analysis", "Fundamental Analysis", "Risk Assessment", "Portfolio Management"],
  },
  {
    _id: "2",
    title: "Investment Simulation",
    description: "Practice real-world investment strategies using simulated trading platforms with real market data.",
    icon: "TrendingUp",
    features: ["Stock Trading", "Bond Markets", "Derivatives", "Performance Tracking"],
  },
  {
    _id: "3",
    title: "Financial Literacy",
    description: "Build a strong foundation in personal finance and investment principles for long-term wealth building.",
    icon: "BookOpen",
    features: ["Personal Finance", "Investment Basics", "Financial Planning", "Economic Indicators"],
  },
  {
    _id: "4",
    title: "Research & Publication",
    description: "Conduct in-depth research on capital market topics and publish findings in academic journals.",
    icon: "FileText",
    features: ["Market Research", "Data Analysis", "Academic Writing", "Peer Review"],
  },
];

export const articles: Article[] = [
  {
    _id: "1",
    title: "Understanding Bull and Bear Markets: A Comprehensive Guide",
    slug: "understanding-bull-bear-markets",
    excerpt: "An in-depth look at market cycles and how to position your portfolio during different market conditions.",
    publishedAt: "2024-03-15",
    category: "Market Analysis",
    author: { name: "Sarah Chen" },
    content: `The terms "bull market" and "bear market" are among the most commonly used phrases in investing, yet their implications for portfolio strategy are often misunderstood by retail investors.

A bull market is generally defined as a period in which stock prices rise by 20% or more from recent lows, often accompanied by widespread investor optimism and strong economic fundamentals. The S&P 500's rally from March 2020 through early 2022 exemplified this pattern, driven by unprecedented fiscal stimulus and a rapid economic recovery.

Conversely, a bear market occurs when prices decline 20% or more from recent highs. These periods test investor conviction and often separate disciplined long-term investors from those driven by emotion.

## Key Characteristics of Bull Markets

During bull markets, several indicators tend to align. Corporate earnings growth accelerates, unemployment falls, and consumer confidence reaches elevated levels. The Federal Reserve typically maintains accommodative monetary policy in the early stages, providing liquidity that supports asset prices.

However, the later stages of a bull market often present the greatest risk. Valuations stretch beyond historical norms, speculative activity increases, and investors begin to assume that rising prices are a permanent condition. The dot-com bubble of 1999-2000 serves as a cautionary tale of what happens when exuberance overtakes fundamentals.

## Navigating Bear Markets

Bear markets, while painful, create opportunities for investors with a long-term horizon. Historical data shows that the average bear market lasts approximately 9.6 months, compared to an average bull market duration of 2.7 years. This asymmetry suggests that patience is rewarded.

Dollar-cost averaging—investing fixed amounts at regular intervals regardless of price—has proven to be one of the most effective strategies during bear markets. Investors who maintained their contributions to retirement accounts during the 2008-2009 financial crisis saw significant gains in subsequent years.

## Portfolio Positioning

The transition between market regimes requires careful attention to asset allocation. Defensive sectors such as utilities, healthcare, and consumer staples tend to outperform during bear markets, while cyclical sectors like technology and consumer discretionary lead during recoveries.

Diversification across asset classes—including bonds, commodities, and international equities—remains the most reliable approach to managing risk across market cycles. No single strategy guarantees protection against losses, but a well-constructed portfolio can significantly reduce volatility while preserving long-term growth potential.`,
  },
  {
    _id: "2",
    title: "The Impact of Interest Rates on Stock Valuations",
    slug: "interest-rates-stock-valuations",
    excerpt: "Exploring the relationship between central bank policies and equity market performance.",
    publishedAt: "2024-03-10",
    category: "Economics",
    author: { name: "Michael Rahman" },
    content: `Interest rates are among the most powerful forces in financial markets, influencing everything from corporate borrowing costs to the present value of future cash flows. Understanding this relationship is essential for any serious investor.

When central banks raise interest rates, the cost of capital increases across the economy. Companies face higher borrowing costs, which can reduce profit margins and slow expansion plans. For growth stocks—companies whose valuations depend heavily on expected future earnings—the impact is particularly pronounced.

## The Discount Rate Mechanism

At its core, the relationship between interest rates and stock valuations operates through the discount rate. In discounted cash flow models, future earnings are divided by a rate that reflects the time value of money and risk. When interest rates rise, this discount rate increases, mathematically reducing the present value of future cash flows.

This explains why the technology sector, dominated by high-growth companies with earnings weighted toward the future, tends to be more sensitive to interest rate changes than value-oriented sectors like financials or energy.

## Historical Patterns

The Federal Reserve's aggressive rate hiking cycle of 2022-2023 provides a clear case study. As the federal funds rate rose from near zero to over 5%, the Nasdaq Composite—heavily weighted toward growth stocks—experienced a significant correction. Meanwhile, the energy sector, benefiting from strong current cash flows and commodity price inflation, outperformed.

However, the relationship is not always straightforward. Moderate rate increases during periods of strong economic growth can actually support equity markets, as the positive effects of a healthy economy outweigh the negative impact of higher borrowing costs.

## Implications for Investors

Investors should monitor not just the level of interest rates but also the pace and direction of change. Rapid, unexpected rate increases tend to cause the most market disruption, while gradual, well-communicated adjustments are more easily absorbed.

Fixed-income allocations become increasingly attractive as rates rise, offering higher yields with lower risk than equities. A balanced portfolio approach, adjusted for the interest rate environment, remains the most prudent strategy for most investors.`,
  },
  {
    _id: "3",
    title: "ESG Investing: Trends and Opportunities in 2024",
    slug: "esg-investing-trends-2024",
    excerpt: "How environmental, social, and governance factors are reshaping investment strategies globally.",
    publishedAt: "2024-03-05",
    category: "Sustainable Finance",
    author: { name: "Aisha Putri" },
    content: `Environmental, Social, and Governance (ESG) investing has evolved from a niche strategy into a mainstream approach that now influences trillions of dollars in global assets. The integration of ESG factors into investment analysis reflects a growing recognition that sustainability issues can materially impact financial performance.

## The Current Landscape

Global ESG assets are projected to exceed $50 trillion by 2025, representing more than a third of total assets under management worldwide. This growth has been driven by institutional investors—pension funds, sovereign wealth funds, and endowments—that increasingly view ESG integration as consistent with their fiduciary responsibilities.

In Southeast Asia, ESG adoption is accelerating rapidly. Indonesian regulators have introduced sustainability reporting requirements for listed companies, while the ASEAN Taxonomy Board has developed a classification system to guide sustainable investment across the region.

## Environmental Factors

Climate risk has emerged as the dominant environmental consideration for investors. Companies face both physical risks—such as extreme weather events disrupting supply chains—and transition risks associated with the shift toward a low-carbon economy.

The energy transition presents significant investment opportunities. Renewable energy capacity additions have consistently exceeded expectations, while battery technology costs have fallen by approximately 90% over the past decade. Companies positioned to benefit from this transition, including those in solar manufacturing, electric vehicles, and grid infrastructure, have attracted substantial capital flows.

## Social and Governance Considerations

Social factors, including labor practices, diversity, and community impact, have gained prominence following the COVID-19 pandemic. Companies with strong employee welfare programs and diverse leadership teams have demonstrated greater resilience during periods of economic stress.

Governance quality remains fundamental to investment analysis. Board independence, executive compensation alignment, and transparent financial reporting serve as indicators of management quality that directly influence long-term shareholder value.

## Challenges and Outlook

Despite its growth, ESG investing faces legitimate challenges. Greenwashing—the practice of overstating environmental credentials—remains a concern, and the lack of standardized reporting frameworks makes comparison across companies and regions difficult.

However, the direction of travel is clear. As data quality improves and regulatory frameworks mature, ESG integration will become an increasingly standard component of professional investment analysis.`,
  },
  {
    _id: "4",
    title: "Commodity Markets: Oil, Gold, and Agricultural Futures",
    slug: "commodity-markets-outlook",
    excerpt: "A deep dive into commodity price dynamics and their implications for global portfolios.",
    publishedAt: "2024-02-28",
    category: "Commodities",
    author: { name: "Reza Pratama" },
    content: `Commodity markets serve as a barometer for global economic health, reflecting supply and demand dynamics that span continents and industries. For investors, understanding commodity price drivers is essential to building diversified portfolios.

## Oil Markets

Crude oil remains the most actively traded commodity globally, with prices influenced by OPEC+ production decisions, geopolitical tensions, and shifts in global demand. The transition to renewable energy introduces long-term structural uncertainty, but near-term demand continues to grow, particularly in developing economies.

Brent crude prices have stabilized in the $75-85 per barrel range, reflecting a balance between disciplined OPEC+ supply management and moderate demand growth. However, geopolitical risks in the Middle East and potential supply disruptions maintain an elevated risk premium.

## Gold and Precious Metals

Gold has historically served as a store of value during periods of economic uncertainty and currency debasement. Central bank purchases—particularly by China, India, and other emerging market central banks—have provided a strong floor for prices.

The relationship between gold and real interest rates remains a key driver. When inflation-adjusted yields on government bonds decline, gold becomes more attractive as an alternative store of value. This dynamic explains much of gold's price appreciation during periods of aggressive monetary easing.

## Agricultural Commodities

Agricultural futures markets have experienced increased volatility due to climate change impacts on crop yields, shifting trade policies, and evolving dietary patterns in developing economies. Wheat, corn, and soybean prices remain sensitive to weather conditions in major producing regions.

For portfolio construction, a modest allocation to commodities can provide diversification benefits and inflation protection, as commodity prices tend to rise during inflationary periods when traditional financial assets may underperform.`,
  },
  {
    _id: "5",
    title: "Technical Analysis: Chart Patterns Every Trader Should Know",
    slug: "technical-analysis-chart-patterns",
    excerpt: "Master the most reliable chart patterns and technical indicators for informed trading decisions.",
    publishedAt: "2024-02-20",
    category: "Stocks",
    author: { name: "Fajar Nugroho" },
    content: `Technical analysis—the study of price action and volume to forecast future market movements—remains one of the most widely used approaches among active traders. While fundamental analysis examines what a security is worth, technical analysis focuses on what the market is willing to pay.

## Foundation: Price Action

The core premise of technical analysis is that market prices reflect all available information, and that price movements tend to follow identifiable patterns. These patterns emerge from the collective psychology of market participants—fear, greed, and uncertainty create recurring formations that can be identified and traded.

## Key Chart Patterns

Head and shoulders patterns are among the most reliable reversal signals in technical analysis. The formation consists of three peaks, with the middle peak (head) higher than the two surrounding peaks (shoulders). A break below the neckline—the support level connecting the troughs—typically signals a trend reversal.

Double tops and bottoms represent another important reversal pattern. A double top occurs when price reaches a resistance level twice and fails to break through, suggesting that buying pressure is exhausted. Conversely, a double bottom at a support level suggests that selling pressure has been absorbed.

## Moving Averages

Moving averages smooth price data to reveal underlying trends. The 50-day and 200-day simple moving averages are the most widely followed, with their crossover—known as a "golden cross" (bullish) or "death cross" (bearish)—generating significant trading signals.

Exponential moving averages (EMAs) give greater weight to recent prices and respond more quickly to price changes, making them preferred by shorter-term traders.

## Risk Management

No technical pattern works 100% of the time. Successful technical traders manage risk through position sizing, stop-loss orders, and a disciplined approach to trade selection. The goal is not to predict the future with certainty, but to identify situations where the probability of a favorable outcome justifies the risk.`,
  },
  {
    _id: "6",
    title: "Indonesian Capital Market: Regulatory Landscape and Outlook",
    slug: "indonesian-capital-market-outlook",
    excerpt: "An overview of Indonesia's evolving capital market regulations and growth opportunities.",
    publishedAt: "2024-02-15",
    category: "Market Analysis",
    author: { name: "Dina Maharani" },
    content: `Indonesia's capital market has undergone remarkable transformation over the past decade, driven by regulatory modernization, increasing retail participation, and the country's strong economic fundamentals. As Southeast Asia's largest economy, Indonesia presents compelling opportunities for both domestic and international investors.

## Regulatory Framework

The Financial Services Authority (OJK) oversees Indonesia's capital markets, implementing reforms designed to enhance transparency, protect investors, and attract foreign capital. Recent initiatives include simplified listing requirements for small and medium enterprises, the introduction of a securities crowdfunding framework, and enhanced environmental disclosure requirements.

The Indonesia Stock Exchange (IDX) has pursued aggressive modernization, including the adoption of new trading systems, the introduction of ESG-focused indices, and expanded market hours to increase liquidity and accessibility.

## Retail Investor Growth

Perhaps the most significant development in Indonesia's capital market is the explosive growth of retail investor participation. The number of capital market investor accounts exceeded 12 million in 2024, a dramatic increase from fewer than 2 million just five years earlier. This growth has been driven by digital brokerage platforms, financial literacy campaigns, and a young, tech-savvy population.

## Outlook

Indonesia's capital market benefits from several structural tailwinds: a growing middle class, demographic dividend, natural resource wealth, and increasing integration into global supply chains. The government's infrastructure development program and the planned capital relocation to Nusantara provide additional catalysts for investment.

Challenges remain, including the need for deeper corporate bond markets, improved corporate governance standards, and greater product diversity. However, the trajectory is firmly positive, positioning Indonesia as one of the most promising emerging market investment destinations in the coming decade.`,
  },
];

export const events: Event[] = [
  {
    _id: "1",
    title: "Capital Market Summit 2024",
    slug: "capital-market-summit-2024",
    description: "Annual summit featuring industry leaders discussing the future of capital markets in Southeast Asia.",
    date: "2024-04-20",
    time: "09:00 - 17:00",
    location: "Auditorium Building A",
    type: "seminar",
  },
  {
    _id: "2",
    title: "Stock Trading Competition",
    slug: "stock-trading-competition",
    description: "Inter-university trading competition with real-time market simulation and expert judges.",
    date: "2024-05-10",
    time: "08:00 - 16:00",
    location: "Online Platform",
    type: "competition",
  },
  {
    _id: "3",
    title: "Technical Analysis Masterclass",
    slug: "technical-analysis-masterclass",
    description: "Hands-on workshop on advanced charting techniques and indicator-based trading strategies.",
    date: "2024-05-25",
    time: "13:00 - 17:00",
    location: "Room 301, Business Faculty",
    type: "workshop",
  },
];

export const team: TeamMember[] = [
  { _id: "1", name: "Ahmad Rizky", role: "President", division: "Executive Board", linkedin: "#" },
  { _id: "2", name: "Dina Maharani", role: "Vice President", division: "Executive Board", linkedin: "#" },
  { _id: "3", name: "Fajar Nugroho", role: "Head of Education", division: "Education", linkedin: "#" },
  { _id: "4", name: "Siti Aisyah", role: "Head of Research", division: "Research", linkedin: "#" },
  { _id: "5", name: "Budi Santoso", role: "Head of Events", division: "Events", linkedin: "#" },
  { _id: "6", name: "Lina Kartika", role: "Head of PR", division: "Public Relations", linkedin: "#" },
  { _id: "7", name: "Reza Pratama", role: "Research Analyst", division: "Research", linkedin: "#" },
  { _id: "8", name: "Maya Indah", role: "Content Writer", division: "Public Relations", linkedin: "#" },
];
