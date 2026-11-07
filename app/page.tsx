"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Bell, ChevronDown, Clock3, Crosshair, History, LayoutDashboard, Search, Settings2, ShieldCheck, Star, TrendingUp, Wallet, Wifi } from "lucide-react";

type Asset = { symbol: string; name: string; price: number; change: number; payout: number; decimals: number; };
type Trade = { id: number; symbol: string; direction: "UP" | "DOWN"; amount: number; entry: number; expiryAt: number; duration: number; result?: "WIN" | "LOSS" | "TIE"; close?: number; profit?: number; };

const initialAssets: Asset[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.08432, change: 0.12, payout: 85, decimals: 5 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", price: 1.27184, change: -0.08, payout: 82, decimals: 5 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", price: 149.382, change: 0.21, payout: 80, decimals: 3 },
  { symbol: "XAU/USD", name: "Gold / US Dollar", price: 2674.82, change: 0.34, payout: 88, decimals: 2 },
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", price: 67842.5, change: 1.26, payout: 90, decimals: 1 },
  { symbol: "ETH/USD", name: "Ethereum / US Dollar", price: 3521.74, change: -0.42, payout: 88, decimals: 2 }
];

const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const priceText = (n: number, decimals: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function Home() {
  const [assets, setAssets] = useState(initialAssets);
  const [selected, setSelected] = useState("EUR/USD");
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60);
  const [balance, setBalance] = useState(10000);
  const [locked, setLocked] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tab, setTab] = useState<"open" | "history">("open");
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState("1m");
  const [chartMode, setChartMode] = useState("Candles");
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState("Welcome to Funded Demo. All balances and prices are simulated.");
  const [favorites, setFavorites] = useState<string[]>(["BTC/USD", "EUR/USD"]);
  const [points, setPoints] = useState<number[]>(Array.from({ length: 12 }, (_, i) => 48 + Math.sin(i / 2) * 8 + Math.cos(i / 3) * 5));

  const asset = assets.find(a => a.symbol === selected) ?? assets[0];
  const visibleAssets = assets.filter(a => (a.symbol + a.name).toLowerCase().includes(search.toLowerCase()));
  const openTrades = trades.filter(t => !t.result);
  const history = trades.filter(t => !!t.result).slice().reverse();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
      setAssets(old => old.map(a => ({ ...a, price: a.price * (1 + (Math.random() - 0.49) * (a.symbol.includes("JPY") ? 0.00012 : 0.00008)) })));
      setPoints(old => [...old.slice(1), Math.max(12, Math.min(88, old[old.length - 1] + (Math.random() - 0.49) * 8))]);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const due = trades.filter(t => !t.result && t.expiryAt <= now);
    if (!due.length) return;
    setTrades(old => old.map(t => {
      if (t.result || t.expiryAt > now) return t;
      const close = assets.find(a => a.symbol === t.symbol)?.price ?? t.entry;
      const won = t.direction === "UP" ? close > t.entry : close < t.entry;
      const tie = close === t.entry;
      const profit = tie ? 0 : won ? t.amount * 0.85 : -t.amount;
      return { ...t, close, result: tie ? "TIE" : won ? "WIN" : "LOSS", profit };
    }));
    const amountReleased = due.reduce((sum, t) => sum + t.amount, 0);
    const totalProfit = due.reduce((sum, t) => {
      const close = assets.find(a => a.symbol === t.symbol)?.price ?? t.entry;
      const won = t.direction === "UP" ? close > t.entry : close < t.entry;
      const tie = close === t.entry;
      return sum + (tie ? t.amount : won ? t.amount * 1.85 : 0);
    }, 0);
    setLocked(v => Math.max(0, v - amountReleased));
    setBalance(v => v + totalProfit);
    setNotice("Demo trade settled. Review the result in Trade history.");
  }, [now, trades, assets]);

  const potentialReturn = amount * (1 + asset.payout / 100);
  const linePoints = useMemo(() => points.map((p, i) => `${(i / (points.length - 1)) * 100},${100 - p}`).join(" "), [points]);

  function placeTrade(direction: "UP" | "DOWN") {
    if (!Number.isFinite(amount) || amount < 1 || amount > 500) return setNotice("Investment must be between $1 and $500.");
    if (amount > balance) return setNotice("Not enough demo balance for this practice trade.");
    if (openTrades.length >= 10) return setNotice("Demo open-trade limit reached (10).");
    const entry = asset.price;
    const trade: Trade = { id: Date.now(), symbol: asset.symbol, direction, amount, entry, expiryAt: Date.now() + duration * 1000, duration };
    setBalance(v => v - amount);
    setLocked(v => v + amount);
    setTrades(old => [...old, trade]);
    setNotice(`${direction} practice position opened for ${asset.symbol}. No real funds are involved.`);
    setTab("open");
  }

  function resetDemo() {
    if (openTrades.length) return setNotice("Wait for all open practice trades to settle before resetting.");
    setBalance(10000); setLocked(0); setTrades([]);
    setNotice("Demo balance reset to $10,000.");
  }

  const chartColor = points[points.length - 1] >= points[0] ? "#21c78a" : "#f05b72";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Activity size={19}/></div><span>funded<span className="brand-dot">.</span></span><span className="demo-pill">DEMO</span></div>
        <nav className="top-nav"><button className="nav-active"><LayoutDashboard size={16}/> Terminal</button><button onClick={() => setTab("history")}><History size={16}/> History</button></nav>
        <div className="top-actions"><span className="feed-status"><span className="pulse"/> PRACTICE ACCOUNT</span><button className="icon-btn" aria-label="Notifications"><Bell size={18}/></button><div className="profile"><div className="avatar">D</div><span>Demo account</span><ChevronDown size={14}/></div></div>
      </header>

      <div className="safety-banner"><ShieldCheck size={15}/> Educational practice simulator · Virtual funds only · No deposits or withdrawals · Prices are randomly simulated, not live market quotes</div>

      <section className="workspace">
        <aside className="asset-sidebar panel">
          <div className="panel-heading"><div><span className="eyebrow">MARKETS</span><h2>Watchlist</h2></div><button className="icon-btn subtle"><Settings2 size={16}/></button></div>
          <div className="search-box"><Search size={15}/><input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}/></div>
          <div className="asset-list">{visibleAssets.map(a => <button key={a.symbol} className={selected === a.symbol ? "asset-row selected" : "asset-row"} onClick={() => setSelected(a.symbol)}>
            <span className="asset-icon">{a.symbol.split("/")[0].slice(0,1)}</span><span className="asset-meta"><strong>{a.symbol}</strong><small>{a.name}</small></span><span className="asset-quote"><strong>{priceText(a.price, a.decimals)}</strong><small className={a.change >= 0 ? "positive" : "negative"}>{a.change >= 0 ? "+" : ""}{a.change.toFixed(2)}%</small></span><button className="star-btn" aria-label="Toggle favorite" onClick={e => { e.stopPropagation(); setFavorites(v => v.includes(a.symbol) ? v.filter(x => x !== a.symbol) : [...v, a.symbol]); }}><Star size={13} fill={favorites.includes(a.symbol) ? "#e8b85c" : "none"} color={favorites.includes(a.symbol) ? "#e8b85c" : "#687487"}/></button>
          </button>)}</div>
          <div className="sidebar-foot"><span className="live-dot"/> 6 practice assets available</div>
        </aside>

        <section className="center-column">
          <div className="market-summary panel">
            <div><span className="eyebrow">SELECTED ASSET</span><div className="selected-name"><h1>{asset.symbol}</h1><span className="market-tag">Practice market</span></div><p>{asset.name}</p></div>
            <div className="market-price"><strong>{priceText(asset.price, asset.decimals)}</strong><span className={asset.change >= 0 ? "positive" : "negative"}>{asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}% today</span></div>
          </div>
          <div className="chart-panel panel">
            <div className="chart-toolbar"><div className="chart-title"><span className="eyebrow">PRICE MOVEMENT</span><strong>{asset.symbol}</strong></div><div className="chart-controls">{["5s","15s","1m","5m"].map(t => <button key={t} className={timeframe === t ? "time-active" : ""} onClick={() => setTimeframe(t)}>{t}</button>)}<span className="toolbar-divider"/><button className={chartMode === "Candles" ? "time-active" : ""} onClick={() => setChartMode("Candles")}>Candles</button><button className={chartMode === "Line" ? "time-active" : ""} onClick={() => setChartMode("Line")}>Line</button></div></div>
            <div className="chart-legend"><span><i className="legend-dot" style={{background: chartColor}}/> Simulated price</span><span>Indicative only</span></div>
            <div className="chart-wrap"><div className="chart-grid"><span>1.0860</span><span>1.0855</span><span>1.0850</span><span>1.0845</span><span>1.0840</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="price-chart" role="img" aria-label="Illustrative simulated price chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={chartColor} stopOpacity=".22"/><stop offset="100%" stopColor={chartColor} stopOpacity="0"/></linearGradient></defs>{points.map((p,i)=>{const prev=i===0?p:points[i-1];const up=p>=prev;const x=2+i*8.05;const top=100-Math.max(p,prev);const bottom=100-Math.min(p,prev);const wickTop=Math.max(2,top-5);const wickBottom=Math.min(98,bottom+5);return <g key={i}><line x1={x+0.5} x2={x+0.5} y1={wickTop} y2={wickBottom} stroke={up?"#21c78a":"#f05b72"} strokeWidth=".55"/><rect x={x} y={top} width="5.2" height={Math.max(1.4,bottom-top)} fill={up?"#21c78a":"#f05b72"}/></g>})}<line x1="0" x2="100" y1={100-points[points.length-1]} y2={100-points[points.length-1]} stroke={chartColor} strokeDasharray="2 2" strokeWidth=".5"/></svg><div className="chart-times"><span>Earlier</span><span>{timeframe} interval</span><span>Now</span></div></div>
            <div className="indicator-row"><span><Crosshair size={13}/> Crosshair</span><span>SMA</span><span>EMA</span><span>Bollinger Bands</span><span>Volume</span><span className="indicator-note">Visual indicators planned</span></div>
          </div>
          <div className="trade-table panel">
            <div className="table-head"><div className="tab-switch"><button className={tab === "open" ? "tab-active" : ""} onClick={() => setTab("open")}>Open trades <span>{openTrades.length}</span></button><button className={tab === "history" ? "tab-active" : ""} onClick={() => setTab("history")}>Trade history <span>{history.length}</span></button></div><span className="table-caption">Demo activity only</span></div>
            {tab === "open" ? <div className="table-scroll"><table><thead><tr><th>ASSET</th><th>DIRECTION</th><th>INVESTMENT</th><th>ENTRY</th><th>TIME LEFT</th><th>STATUS</th></tr></thead><tbody>{openTrades.length ? openTrades.map(t => <tr key={t.id}><td>{t.symbol}</td><td><span className={t.direction === "UP" ? "direction-up" : "direction-down"}>{t.direction}</span></td><td>{money(t.amount)}</td><td>{t.entry.toFixed(5)}</td><td className="countdown">{Math.max(0, Math.ceil((t.expiryAt-now)/1000))}s</td><td><span className="status-open">● Active</span></td></tr>) : <tr><td colSpan={6} className="empty-state">No open practice trades yet. Choose an asset and try a virtual position.</td></tr>}</tbody></table></div> : <div className="table-scroll"><table><thead><tr><th>ASSET</th><th>DIRECTION</th><th>INVESTMENT</th><th>ENTRY</th><th>EXIT</th><th>RESULT</th><th>P/L</th></tr></thead><tbody>{history.length ? history.map(t => <tr key={t.id}><td>{t.symbol}</td><td>{t.direction}</td><td>{money(t.amount)}</td><td>{t.entry.toFixed(5)}</td><td>{(t.close ?? 0).toFixed(5)}</td><td><span className={t.result === "WIN" ? "positive" : t.result === "LOSS" ? "negative" : ""}>{t.result}</span></td><td className={t.profit && t.profit > 0 ? "positive" : "negative"}>{money(t.profit ?? 0)}</td></tr>) : <tr><td colSpan={7} className="empty-state">Settled practice trades will appear here.</td></tr>}</tbody></table></div>}
          </div>
        </section>

        <aside className="trade-sidebar panel">
          <div className="panel-heading"><div><span className="eyebrow">PRACTICE ACCOUNT</span><h2>Trade panel</h2></div><span className="demo-pill">DEMO</span></div>
          <div className="balance-card"><div className="balance-label"><Wallet size={15}/> Available balance</div><strong>{money(balance)}</strong><div className="balance-bottom"><span>Locked: {money(locked)}</span><button onClick={resetDemo}>Reset demo</button></div></div>
          <div className="field-block"><div className="field-label"><label htmlFor="amount">Investment amount</label><span>Min $1 · Max $500</span></div><div className="amount-input"><button onClick={() => setAmount(v => Math.max(1, v-1))}>−</button><span>$</span><input id="amount" type="number" min="1" max="500" value={amount} onChange={e => setAmount(Number(e.target.value))}/><button onClick={() => setAmount(v => Math.min(500, v+1))}>+</button></div><div className="quick-amounts">{[1,5,10,50,100].map(v => <button key={v} className={amount === v ? "quick-active" : ""} onClick={() => setAmount(v)}>${v}</button>)}</div></div>
          <div className="field-block"><div className="field-label"><label>Expiry duration</label><span><Clock3 size={12}/> Fixed timer</span></div><div className="duration-options">{[{v:60,l:"1 min"},{v:120,l:"2 min"},{v:300,l:"5 min"}].map(o => <button key={o.v} className={duration === o.v ? "duration-active" : ""} onClick={() => setDuration(o.v)}>{o.l}</button>)}</div></div>
          <div className="payout-card"><div><span>PRACTICE PAYOUT</span><strong>{asset.payout}%</strong></div><div className="payout-return"><span>Potential return</span><strong>{money(potentialReturn)}</strong></div><small>Illustrative calculation · not a forecast</small></div>
          <button className="trade-button up-button" onClick={() => placeTrade("UP")}><TrendingUp size={18}/><span><strong>BUY</strong><small>Virtual price increase</small></span><kbd>↑</kbd></button>
          <button className="trade-button down-button" onClick={() => placeTrade("DOWN")}><TrendingUp size={18}/><span><strong>SELL</strong><small>Virtual price decrease</small></span><kbd>↓</kbd></button>
          <div className="notice"><Wifi size={14}/><span>{notice}</span></div>
          <div className="panel-disclaimer">This is a local educational simulator. Prices, payouts and outcomes are fictional. It is not a broker or investment service.</div>
        </aside>
      </section>
      <footer className="footer"><span>© 2026 Funded Demo</span><span><span className="live-dot"/> Simulator running locally in this browser</span><span>Built for learning · No real funds</span></footer>
    </main>
  );
}