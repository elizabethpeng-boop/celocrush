import { useState, useEffect } from "react";
import { useWallet }      from "./hooks/useWallet.js";
import { useCeloCrush }   from "./hooks/useCeloCrush.js";
import { useSelfZkID }    from "./hooks/useSelfZkID.js";

const MOCK_CRUSHES = [
  { id: "1", message: "You always make the room brighter when you walk in. 🌸", tip: "0.50", claimed: false, timestamp: "2h ago" },
  { id: "2", message: "Your laugh is honestly contagious. The world needs more of it. ✨", tip: "0.25", claimed: true, timestamp: "Yesterday" },
  { id: "3", message: "I see how hard you work and it genuinely inspires me. 💪", tip: "0", claimed: false, timestamp: "3d ago" },
];

const USDT_PRESETS = ["0.25", "0.50", "1.00", "2.00"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --rose:#E8527A; --rose-deep:#C73B61; --rose-soft:#FDEEF3; --rose-mid:#F7C5D4;
    --gold-soft:#FDF6E3; --ink:#1A1016; --muted:#7A5F6A; --surface:#FFFBFC;
    --border:rgba(232,82,122,0.15); --radius:16px;
    --green:#1A7A52; --green-soft:#E8F8F0; --green-border:#9FE1CB;
    --red-soft:#FEF2F2; --red:#DC2626;
  }
  body { background:#FDF5F7; }
  .app { font-family:'DM Sans',sans-serif; max-width:390px; min-height:100dvh; margin:0 auto; background:var(--surface); display:flex; flex-direction:column; }
  .screen { flex:1; display:flex; flex-direction:column; overflow-y:auto; animation:fadeIn 0.28s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes floatUp { 0%{opacity:0;transform:translateY(0) scale(0.6)} 40%{opacity:1} 100%{opacity:0;transform:translateY(-55px) scale(1)} }
  @keyframes scanDown { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes popIn { 0%{transform:scale(0);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }

  .nav { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 12px; border-bottom:0.5px solid var(--border); background:var(--surface); position:sticky; top:0; z-index:10; }
  .nav-logo { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:var(--rose); display:flex; align-items:center; gap:7px; }
  .nav-back { width:36px; height:36px; border-radius:50%; background:var(--rose-soft); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; color:var(--rose-deep); }
  .nav-action { font-size:13px; font-weight:500; color:var(--rose); background:none; border:none; cursor:pointer; padding:4px 8px; }
  .btn-primary { width:100%; background:var(--rose); color:white; border:none; border-radius:var(--radius); padding:16px 20px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:500; cursor:pointer; box-shadow:0 4px 20px rgba(232,82,122,0.3); transition:background 0.15s,transform 0.1s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:active { transform:scale(0.98); background:var(--rose-deep); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .btn-ghost { background:none; border:1.5px solid var(--border); border-radius:var(--radius); padding:13px 20px; font-family:'DM Sans',sans-serif; font-size:14px; color:var(--muted); cursor:pointer; width:100%; }
  .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.35); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
  .error-bar { background:var(--red-soft); border:0.5px solid #FECACA; border-radius:12px; padding:10px 14px; font-size:12px; color:var(--red); }
  .network-warn { background:#FEF3CD; border:0.5px solid #F0D085; border-radius:12px; padding:10px 14px; font-size:12px; color:#92700A; display:flex; align-items:center; justify-content:space-between; }
  .network-warn button { background:#D4A853; color:white; border:none; border-radius:8px; padding:4px 10px; font-size:11px; cursor:pointer; }
  .wallet-bar { background:var(--rose-soft); border:0.5px solid var(--rose-mid); border-radius:12px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; font-size:12px; }
  .wallet-badge { background:var(--green-soft); color:var(--green); border:0.5px solid var(--green-border); border-radius:99px; padding:2px 8px; font-size:11px; font-weight:500; }
  .verified-chip { display:inline-flex; align-items:center; gap:4px; background:var(--green-soft); color:var(--green); border:0.5px solid var(--green-border); border-radius:99px; padding:2px 8px; font-size:11px; font-weight:500; }

  .onboard-hero { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 28px 32px; text-align:center; }
  .hero-hearts { position:relative; width:120px; height:120px; margin-bottom:28px; }
  .heart-big { font-size:72px; line-height:1; animation:heartbeat 2.4s ease-in-out infinite; }
  .heart-float { position:absolute; font-size:24px; animation:floatUp 3s ease-in-out infinite; }
  .hero-title { font-family:'Playfair Display',serif; font-size:34px; font-weight:700; color:var(--ink); line-height:1.15; margin-bottom:12px; }
  .hero-title em { color:var(--rose); font-style:italic; }
  .hero-sub { font-size:15px; color:var(--muted); line-height:1.6; margin-bottom:32px; max-width:280px; }

  .verify-wrap { padding:28px 24px; flex:1; display:flex; flex-direction:column; gap:16px; overflow-y:auto; }
  .verify-card { background:var(--rose-soft); border:1px solid var(--rose-mid); border-radius:20px; padding:24px; text-align:center; }
  .verify-icon { font-size:48px; margin-bottom:12px; }
  .verify-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--ink); margin-bottom:8px; }
  .verify-desc { font-size:14px; color:var(--muted); line-height:1.6; }
  .zk-badge { display:flex; align-items:center; gap:12px; background:white; border:0.5px solid var(--border); border-radius:12px; padding:12px 14px; }
  .zk-badge-icon { font-size:20px; flex-shrink:0; }
  .zk-badge-text { font-size:13px; color:var(--muted); line-height:1.4; }
  .zk-badge-text strong { color:var(--ink); font-weight:500; display:block; }

  .scan-wrap { padding:20px 24px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; }
  .scan-box { width:220px; height:220px; border-radius:20px; border:2px solid var(--rose); position:relative; overflow:hidden; background:var(--rose-soft); display:flex; align-items:center; justify-content:center; }
  .scan-line { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--rose),transparent); animation:scanDown 1.8s ease-in-out infinite; }
  .scan-corner { position:absolute; width:20px; height:20px; border-color:var(--rose-deep); border-style:solid; border-width:0; }
  .scan-corner.tl{top:8px;left:8px;border-top-width:3px;border-left-width:3px;border-radius:4px 0 0 0}
  .scan-corner.tr{top:8px;right:8px;border-top-width:3px;border-right-width:3px;border-radius:0 4px 0 0}
  .scan-corner.bl{bottom:8px;left:8px;border-bottom-width:3px;border-left-width:3px;border-radius:0 0 0 4px}
  .scan-corner.br{bottom:8px;right:8px;border-bottom-width:3px;border-right-width:3px;border-radius:0 0 4px 0}
  .scan-id-icon { font-size:64px; opacity:0.35; }
  .scan-progress { width:100%; height:4px; background:var(--rose-soft); border-radius:99px; overflow:hidden; }
  .scan-progress-fill { height:100%; background:var(--rose); border-radius:99px; transition:width 0.3s ease; }

  .home-hero { background:linear-gradient(160deg,#FDEEF3 0%,#FDF5F7 100%); padding:20px 24px 24px; border-bottom:0.5px solid var(--border); }
  .home-greeting { font-size:13px; color:var(--muted); margin-bottom:2px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .home-crush-count { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--ink); margin:6px 0 2px; }
  .home-crush-count span { color:var(--rose); }
  .home-sub { font-size:13px; color:var(--muted); }
  .balance-pill { display:inline-flex; align-items:center; gap:5px; background:#FDF6E3; color:#9A6E1A; border:0.5px solid #F0D085; border-radius:99px; padding:3px 10px; font-size:12px; margin-top:6px; }
  .send-crush-btn { margin:16px 0 0; background:var(--rose); color:white; border:none; border-radius:var(--radius); padding:14px 20px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 16px rgba(232,82,122,0.28); transition:background 0.15s,transform 0.1s; }
  .send-crush-btn:active { transform:scale(0.98); background:var(--rose-deep); }
  .inbox-label { font-size:12px; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; padding:16px 24px 8px; }
  .crush-list { flex:1; padding:0 16px 24px; display:flex; flex-direction:column; gap:10px; }
  .crush-item { background:white; border:0.5px solid var(--border); border-radius:18px; padding:16px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.15s; }
  .crush-item:active { transform:scale(0.99); }
  .crush-item.unclaimed::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--rose),var(--rose-deep)); border-radius:18px 18px 0 0; }
  .crush-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .anon-badge { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); font-weight:500; }
  .anon-avatar { width:28px; height:28px; border-radius:50%; background:var(--rose-soft); border:1px solid var(--rose-mid); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .crush-message { font-size:14px; color:var(--ink); line-height:1.55; margin-bottom:10px; }
  .crush-footer { display:flex; align-items:center; justify-content:space-between; }
  .tip-badge { display:inline-flex; align-items:center; gap:5px; background:#FDF6E3; color:#9A6E1A; border:0.5px solid #F0D085; border-radius:99px; padding:4px 10px; font-size:12px; font-weight:500; }
  .claim-badge { background:var(--rose-soft); color:var(--rose-deep); border:1px dashed var(--rose-mid); border-radius:99px; padding:4px 12px; font-size:12px; font-weight:500; cursor:pointer; }

  .send-wrap { padding:20px 20px 32px; flex:1; display:flex; flex-direction:column; gap:18px; overflow-y:auto; }
  .field-label { font-size:13px; font-weight:500; color:var(--muted); margin-bottom:8px; }
  .text-input { width:100%; padding:14px 16px; background:#FDF5F7; border:1px solid var(--border); border-radius:14px; font-family:'DM Sans',sans-serif; font-size:15px; color:var(--ink); outline:none; transition:border-color 0.15s; }
  .text-input:focus { border-color:var(--rose); background:white; }
  .text-input::placeholder { color:#C0A0AB; }
  .tip-presets { display:flex; gap:8px; }
  .tip-preset-btn { flex:1; padding:10px 6px; border:1px solid var(--border); border-radius:12px; background:white; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; color:var(--muted); cursor:pointer; transition:all 0.15s; }
  .tip-preset-btn.selected { border-color:var(--rose); background:var(--rose-soft); color:var(--rose-deep); }

  .success-wrap { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 28px; text-align:center; }
  .success-lottie { font-size:80px; margin-bottom:24px; animation:popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
  .success-title { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--ink); margin-bottom:10px; }
  .tx-pill { background:var(--rose-soft); border:0.5px solid var(--rose-mid); border-radius:99px; padding:8px 16px; font-size:12px; color:var(--muted); margin-bottom:32px; display:flex; align-items:center; gap:6px; word-break:break-all; cursor:pointer; }

  .modal-overlay { position:fixed; inset:0; z-index:100; background:rgba(26,16,22,0.55); display:flex; align-items:flex-end; justify-content:center; }
  .modal-sheet { background:var(--surface); border-radius:28px 28px 0 0; padding:8px 24px 40px; width:100%; max-width:390px; animation:slideUp 0.28s ease; }
  .modal-handle { width:40px; height:4px; background:var(--border); border-radius:99px; margin:12px auto 20px; }
  .modal-icon { font-size:48px; text-align:center; margin-bottom:12px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:var(--ink); text-align:center; margin-bottom:8px; }
  .modal-message { font-size:15px; text-align:center; line-height:1.6; margin-bottom:20px; background:var(--rose-soft); border-radius:14px; padding:14px 16px; font-style:italic; color:var(--ink); }
  .modal-tip-amount { font-size:24px; font-weight:500; font-family:'Playfair Display',serif; color:var(--ink); }
  .empty-state { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; text-align:center; }
  .loading-state { display:flex; align-items:center; justify-content:center; gap:10px; padding:40px; font-size:14px; color:var(--muted); }
`;

function WalletSection({ wallet }) {
  if (!wallet.address) return null;
  const short = `${wallet.address.slice(0,6)}…${wallet.address.slice(-4)}`;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div className="wallet-bar">
        <span style={{ fontSize:12, color:"var(--muted)", fontFamily:"monospace" }}>{short}</span>
        <span className="wallet-badge">✓ Connected</span>
      </div>
      {!wallet.isCorrectChain && (
        <div className="network-warn">
          <span>⚠️ Switch to Celo Sepolia</span>
          <button onClick={wallet.switchNetwork}>Switch</button>
        </div>
      )}
    </div>
  );
}

function OnboardingScreen({ wallet, onStart }) {
  return (
    <div className="screen">
      <div className="onboard-hero">
        <div className="hero-hearts">
          <div className="heart-big">💌</div>
          <span className="heart-float" style={{top:0,right:8,animationDelay:"0s"}}>💛</span>
          <span className="heart-float" style={{top:20,left:0,animationDelay:"0.9s"}}>🌸</span>
          <span className="heart-float" style={{bottom:0,right:0,animationDelay:"1.6s"}}>✨</span>
        </div>
        <h1 className="hero-title">Say it.<br/><em>Anonymously.</em></h1>
        <p className="hero-sub">Send a real compliment + USDT tip to someone you admire. Every crush is verified by zero-knowledge proof. No bots. Just real humans.</p>
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
          {wallet.address ? (
            <button className="btn-primary" onClick={onStart}>Open my inbox 💌</button>
          ) : (
            <button className="btn-primary" onClick={wallet.connect} disabled={wallet.connecting}>
              {wallet.connecting ? <><span className="spinner"/>Connecting…</> : "Connect wallet to start 💌"}
            </button>
          )}
          {wallet.error && <div className="error-bar">{wallet.error}</div>}
          <div style={{fontSize:12,color:"var(--muted)",textAlign:"center",marginTop:4}}>
            Powered by Self zkID · Built on Celo Sepolia
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyScreen({ wallet, onDone, onSkip }) {
  const [progress, setProgress] = useState(0);
  const { status, startVerification, error: zkError } = useSelfZkID({ onVerified: onDone });

  const handleScan = () => {
    startVerification(wallet.address);
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 10 + 3;
      if (p >= 95) { clearInterval(t); p = 95; }
      setProgress(Math.min(p, 95));
    }, 150);
  };

  useEffect(() => { if (status === "verified") setProgress(100); }, [status]);

  if (status === "verified") return (
    <div className="screen">
      <div className="success-wrap">
        <div className="success-lottie">✅</div>
        <h2 className="success-title">You're verified!</h2>
        <p style={{fontSize:15,color:"var(--muted)",lineHeight:1.6,marginBottom:32,textAlign:"center"}}>
          Your zkProof is ready. Your identity stays private — only your uniqueness is confirmed on-chain.
        </p>
        <button className="btn-primary" onClick={() => onDone({})}>Open my CeloCrush inbox 💌</button>
      </div>
    </div>
  );

  if (status === "scanning") return (
    <div className="screen">
      <div className="nav"><div className="nav-logo">💌 CeloCrush</div></div>
      <div className="scan-wrap">
        <div className="scan-box">
          <div className="scan-corner tl"/><div className="scan-corner tr"/>
          <div className="scan-corner bl"/><div className="scan-corner br"/>
          <div className="scan-line"/>
          <div className="scan-id-icon">🪪</div>
        </div>
        <div style={{fontSize:14,color:"var(--muted)",textAlign:"center",lineHeight:1.6}}>
          Scanning with Self zkID…<br/>Your data never leaves your device.
        </div>
        <div className="scan-progress" style={{width:"100%",maxWidth:240}}>
          <div className="scan-progress-fill" style={{width:`${Math.floor(progress)}%`}}/>
        </div>
        <div style={{fontSize:13,color:"var(--muted)"}}>{Math.floor(progress)}%</div>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="nav">
        <div className="nav-logo">💌 CeloCrush</div>
        <button className="nav-action" onClick={onSkip}>Skip</button>
      </div>
      <div className="verify-wrap">
        <WalletSection wallet={wallet}/>
        <div className="verify-card">
          <div className="verify-icon">🔒</div>
          <h2 className="verify-title">Verify once, crush forever</h2>
          <p className="verify-desc">CeloCrush uses Self zkID to prove you're a real, unique human — no personal data stored on-chain.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["🤖","No bots","Every crush is from a unique human."],["👁️","Anonymous","Recipients never see who you are."],["🛡️","Zero data","No name, birthday, or passport stored."]].map(([icon,title,desc]) => (
            <div key={title} className="zk-badge">
              <div className="zk-badge-icon">{icon}</div>
              <div className="zk-badge-text"><strong>{title}</strong>{desc}</div>
            </div>
          ))}
        </div>
        {zkError && <div className="error-bar">{zkError}</div>}
        <button className="btn-primary" onClick={handleScan}>Scan my ID with Self zkID 🪪</button>
        <button className="btn-ghost" onClick={onSkip}>Continue in demo mode</button>
      </div>
    </div>
  );
}

function HomeScreen({ crushes, loading, wallet, balance, onSend, onOpenCrush }) {
  const unclaimed = crushes.filter(c => !c.claimed && parseFloat(c.tip) > 0).length;
  const newCount  = crushes.filter(c => !c.claimed).length;
  return (
    <div className="screen">
      <div className="nav">
        <div className="nav-logo">💌 CeloCrush</div>
        <div className="verified-chip">✓ Verified</div>
      </div>
      <div className="home-hero">
        <div className="home-greeting">
          {wallet.address ? `${wallet.address.slice(0,6)}…${wallet.address.slice(-4)}` : "Your inbox"}
          {newCount > 0 && <span style={{background:"var(--rose)",color:"white",borderRadius:99,fontSize:11,padding:"1px 7px",fontWeight:500}}>{newCount} new</span>}
        </div>
        <div className="home-crush-count"><span>{crushes.length}</span> crushes received 💌</div>
        {unclaimed > 0 && <div className="home-sub">{unclaimed} USDT tip{unclaimed>1?"s":""} waiting 💛</div>}
        {balance && <div className="balance-pill">💛 {parseFloat(balance).toFixed(2)} USDT in wallet</div>}
        <button className="send-crush-btn" onClick={onSend}><span>💌</span> Send an anonymous crush</button>
      </div>
      {loading ? (
        <div className="loading-state"><span className="spinner" style={{borderColor:"var(--rose-mid)",borderTopColor:"var(--rose)"}}/>Loading crushes…</div>
      ) : crushes.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:48,marginBottom:12,opacity:0.5}}>💌</div>
          <div style={{fontSize:16,fontWeight:500,color:"var(--ink)",marginBottom:6}}>No crushes yet</div>
          <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.5}}>When someone sends you a crush, it'll appear here.</div>
        </div>
      ) : (
        <>
          <div className="inbox-label">Received</div>
          <div className="crush-list">
            {crushes.map(crush => (
              <div key={crush.id} className={`crush-item ${!crush.claimed && parseFloat(crush.tip)>0?"unclaimed":""}`} onClick={() => onOpenCrush(crush)}>
                <div className="crush-header-row">
                  <div className="anon-badge">
                    <div className="anon-avatar">💜</div>
                    <span>Anonymous human ✓</span>
                  </div>
                  <span style={{fontSize:11,color:"var(--muted)"}}>{crush.timestamp}</span>
                </div>
                <p className="crush-message">{crush.message}</p>
                <div className="crush-footer">
                  {parseFloat(crush.tip)>0 ? (
                    <div className="tip-badge">💛 {crush.tip} USDT {crush.claimed?"received":"waiting"}</div>
                  ) : (
                    <div style={{fontSize:12,color:"var(--muted)"}}>No tip</div>
                  )}
                  {!crush.claimed && parseFloat(crush.tip)>0 ? (
                    <button className="claim-badge" onClick={e=>{e.stopPropagation();onOpenCrush(crush);}}>Claim ↗</button>
                  ) : crush.claimed ? (
                    <span style={{fontSize:12,color:"var(--muted)"}}>✓ Claimed</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SendScreen({ onBack, onSent, contract, wallet }) {
  const [recipient, setRecipient] = useState("");
  const [message,   setMessage]   = useState("");
  const [tip,       setTip]       = useState("0.25");
  const [sending,   setSending]   = useState(false);
  const [txError,   setTxError]   = useState(null);
  const maxChars = 200;

  const handleSend = async () => {
    if (!message.trim() || !recipient.trim()) return;
    setSending(true); setTxError(null);
    try {
      if (contract.contractDeployed && wallet.isCorrectChain) {
        const result = await contract.sendCrush({ recipientAddress: recipient.trim(), message: message.trim(), tipUSDT: tip });
        onSent({ tip, txHash: result.txHash });
      } else {
        await new Promise(r => setTimeout(r, 1800));
        onSent({ tip, txHash: null });
      }
    } catch (e) {
      setTxError(e?.reason || e?.shortMessage || e?.message || "Transaction failed");
      setSending(false);
    }
  };

  return (
    <div className="screen">
      <div className="nav">
        <button className="nav-back" onClick={onBack}>←</button>
        <div className="nav-logo">Send a crush 💌</div>
        <div style={{width:36}}/>
      </div>
      <div className="send-wrap">
        <WalletSection wallet={wallet}/>
        <div>
          <div className="field-label">To (wallet address)</div>
          <input className="text-input" placeholder="0x…" value={recipient} onChange={e=>setRecipient(e.target.value)}/>
        </div>
        <div>
          <div className="field-label">Your message</div>
          <textarea className="text-input" style={{minHeight:120,resize:"none",lineHeight:1.6}} placeholder="Say something kind, specific, and real… ✨" value={message} maxLength={maxChars} onChange={e=>setMessage(e.target.value)}/>
          <div style={{fontSize:11,color:"var(--muted)",textAlign:"right",marginTop:4}}>{message.length}/{maxChars}</div>
        </div>
        <div>
          <div className="field-label">Add a USDT tip (optional)</div>
          <div className="tip-presets">
            <button className={`tip-preset-btn ${tip==="0"?"selected":""}`} onClick={()=>setTip("0")}>No tip</button>
            {USDT_PRESETS.map(t=>(
              <button key={t} className={`tip-preset-btn ${tip===t?"selected":""}`} onClick={()=>setTip(t)}>${t}</button>
            ))}
          </div>
          {tip!=="0" && <div style={{fontSize:12,color:"var(--muted)",textAlign:"center",marginTop:8}}>💛 ${tip} USDT escrowed until they claim it</div>}
        </div>
        {txError && <div className="error-bar">{txError}</div>}
        <button className="btn-primary" onClick={handleSend} disabled={!message.trim()||!recipient.trim()||sending} style={{opacity:(!message.trim()||!recipient.trim())?0.5:1}}>
          {sending ? <><span className="spinner"/>Sending on Celo…</> : `Send anonymously${tip!=="0"?` + $${tip} USDT`:""} 💌`}
        </button>
        <div style={{fontSize:12,color:"var(--muted)",textAlign:"center"}}>🔒 Protected by Self zkID zero-knowledge proof</div>
      </div>
    </div>
  );
}

function SuccessScreen({ tip, txHash, onBack }) {
  const explorerUrl = txHash ? `https://alfajores.celoscan.io/tx/${txHash}` : null;
  return (
    <div className="screen">
      <div className="success-wrap">
        <div className="success-lottie">💌</div>
        <h2 className="success-title">Crush sent!</h2>
        <p style={{fontSize:15,color:"var(--muted)",lineHeight:1.6,marginBottom:24,textAlign:"center"}}>
          Your anonymous message is flying.{tip!=="0"?` $${tip} USDT is safely held in escrow on Celo.`:""} They'll never know it was you. 💜
        </p>
        {explorerUrl && (
          <div className="tx-pill" onClick={()=>window.open(explorerUrl,"_blank")}>
            <span>⛓️</span><span style={{color:"var(--rose)"}}>View on Celoscan ↗</span>
          </div>
        )}
        <button className="btn-primary" onClick={onBack}>Back to inbox</button>
        <button className="btn-ghost" style={{marginTop:10}} onClick={onBack}>Send another crush 💌</button>
      </div>
    </div>
  );
}

function ClaimModal({ crush, onClaim, onClose, contract, wallet }) {
  const [claiming, setClaiming] = useState(false);
  const [claimed,  setClaimed]  = useState(false);
  const [txError,  setTxError]  = useState(null);

  const handleClaim = async () => {
    setClaiming(true); setTxError(null);
    try {
      if (contract.contractDeployed && wallet.isCorrectChain) {
        await contract.claimTip(crush.id);
      } else {
        await new Promise(r => setTimeout(r, 1800));
      }
      setClaimed(true);
      setTimeout(() => onClaim(crush), 1200);
    } catch (e) {
      setTxError(e?.reason || e?.shortMessage || e?.message || "Claim failed");
      setClaiming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        {claimed ? (
          <>
            <div className="modal-icon">🎉</div>
            <div className="modal-title">USDT claimed!</div>
            <p style={{fontSize:14,color:"var(--muted)",textAlign:"center",marginBottom:24}}>${crush.tip} USDT transferred to your MiniPay wallet.</p>
          </>
        ) : (
          <>
            <div className="modal-icon">💌</div>
            <div className="modal-title">Someone has a crush on you</div>
            <div className="modal-message">{crush.message}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24}}>
              <span className="modal-tip-amount">${crush.tip} USDT</span>
              <span style={{fontSize:14,color:"var(--muted)"}}>waiting for you</span>
            </div>
            {txError && <div className="error-bar" style={{marginBottom:12}}>{txError}</div>}
            <button className="btn-primary" onClick={handleClaim} disabled={claiming}>
              {claiming ? <><span className="spinner"/>Claiming on Celo…</> : `Claim $${crush.tip} USDT 💛`}
            </button>
            <button className="btn-ghost" style={{marginTop:10}} onClick={onClose}>Maybe later</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CeloCrush() {
  const [screen,     setScreen]     = useState("onboarding");
  const [crushes,    setCrushes]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [claimModal, setClaimModal] = useState(null);
  const [lastTx,     setLastTx]     = useState({ tip:"0", txHash:null });
  const [balance,    setBalance]    = useState(null);

  const wallet   = useWallet();
  const contract = useCeloCrush({ signer:wallet.signer, provider:wallet.provider, address:wallet.address });

  useEffect(() => {
    if (screen !== "home") return;
    (async () => {
      setLoading(true);
      if (false) {
        const inbox = await contract.loadInbox();
        setCrushes(inbox.length > 0 ? inbox : MOCK_CRUSHES);
        const bal = await contract.getUSDTBalance();
        setBalance(bal);
      } else {
        setCrushes(MOCK_CRUSHES);
      }
      setLoading(false);
    })();
  }, [screen, wallet.address, contract.contractDeployed]);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {screen==="onboarding" && <OnboardingScreen wallet={wallet} onStart={()=>setScreen("verify")}/>}
        {screen==="verify"     && <VerifyScreen wallet={wallet} onDone={()=>setScreen("home")} onSkip={()=>setScreen("home")}/>}
        {screen==="home"       && <HomeScreen crushes={crushes} loading={loading} wallet={wallet} balance={balance} onSend={()=>setScreen("send")} onOpenCrush={c=>setClaimModal(c)}/>}
        {screen==="send"       && <SendScreen onBack={()=>setScreen("home")} onSent={({tip,txHash})=>{setLastTx({tip,txHash});setScreen("success");}} contract={contract} wallet={wallet}/>}
        {screen==="success"    && <SuccessScreen tip={lastTx.tip} txHash={lastTx.txHash} onBack={()=>setScreen("home")}/>}
        {claimModal && <ClaimModal crush={claimModal} onClaim={c=>{setCrushes(p=>p.map(x=>x.id===c.id?{...x,claimed:true}:x));setClaimModal(null);}} onClose={()=>setClaimModal(null)} contract={contract} wallet={wallet}/>}
      </div>
    </>
  );
}
