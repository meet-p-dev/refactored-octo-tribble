const {useState,useEffect,useMemo,useRef}=React;
function MiniChart({data,T,fmt:f}){
  const [sel,setSel]=useState(data.length-1);
  const cur=data[sel]||{label:"",income:0,spent:0};
  const max=Math.max(...data.flatMap(d=>[d.income,d.spent]),1);
  const W=300,H=140,bp=20,tp=8,aH=H-bp-tp,sw=W/data.length,bw=Math.min(sw*.28,10);
  return(
    <div>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:700,color:T.txt}}>{cur.label}</span>
        <span style={{display:"flex",gap:12,fontSize:13,fontWeight:700}}>
          <span style={{color:T.cG}}>↑ {f(cur.income)}</span>
          <span style={{color:T.cR}}>↓ {f(cur.spent)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {[.33,.66,1].map(fr=><line key={fr} x1={0} y1={tp+(1-fr)*aH} x2={W} y2={tp+(1-fr)*aH} stroke={T.border} strokeWidth={.5}/>)}
        {data.map((d,i)=>{
          const cx=(i+.5)*sw,iH=(d.income/max)*aH,sH=(d.spent/max)*aH,on=i===sel;
          return(
            <g key={i} onClick={()=>setSel(i)} style={{cursor:"pointer"}}>
              {on&&<rect x={cx-sw/2+1} y={tp} width={sw-2} height={aH} fill={T.acc} opacity={.1} rx={4}/>}
              {iH>0&&<rect x={cx-bw-1} y={tp+aH-iH} width={bw} height={iH} fill={T.cG} rx={2} opacity={on?1:.5}/>}
              {sH>0&&<rect x={cx+1} y={tp+aH-sH} width={bw} height={sH} fill={T.cR} rx={2} opacity={on?1:.5}/>}
              <text x={cx} y={H-5} textAnchor="middle" fontSize={7.5} fill={on?T.txt:T.txt3} fontWeight={on?700:400}>{d.label}</text>
              <rect x={cx-sw/2} y={0} width={sw} height={H} fill="transparent"/>
            </g>
          );
        })}
        <rect x={W-54} y={tp+1} width={7} height={7} fill={T.cG} rx={1.5}/>
        <text x={W-44} y={tp+7.5} fontSize={7.5} fill={T.txt2}>Income</text>
        <rect x={W-54} y={tp+12} width={7} height={7} fill={T.cR} rx={1.5}/>
        <text x={W-44} y={tp+18.5} fontSize={7.5} fill={T.txt2}>Spent</text>
      </svg>
    </div>
  );
}

function Sheet({open,onClose,title,T,children}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:300}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)",animation:"mtFade .25s ease"}} onClick={onClose}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.card,borderRadius:"22px 22px 0 0",paddingBottom:"calc(env(safe-area-inset-bottom) + 12px)",maxHeight:"calc(100vh - env(safe-area-inset-top) - 32px)",display:"flex",flexDirection:"column",boxShadow:"0 -4px 30px rgba(0,0,0,.3)",animation:"mtSheetUp .34s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{width:36,height:4,background:T.border,borderRadius:99,margin:"12px auto 2px",flexShrink:0}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontWeight:700,fontSize:18,color:T.txt}}>{title}</span>
          <button onClick={onClose} style={{background:T.cardH,border:"none",borderRadius:99,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.x(T.txt2)}</button>
        </div>
        <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 4px"}}>{children}</div>
      </div>
    </div>
  );
}

function Label({text}){return <div style={{fontSize:12,fontWeight:600,color:"#8e8e93",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>{text}</div>;}
function Toggle({value,onChange,T}){
  return(
    <div onClick={()=>{haptic(10);onChange(!value);}} style={{width:51,height:31,borderRadius:99,background:value?T.acc:T.border,cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:value?22:2,width:27,height:27,borderRadius:99,background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.3)",transition:"left .25s cubic-bezier(.34,1.56,.64,1)"}}/>
    </div>
  );
}
function AnimatedNumber({value,format,style}){
  const [d,setD]=useState(value);const ref=useRef(value);
  useEffect(()=>{
    const from=ref.current,to=value||0,start=performance.now();
    if(from===to){setD(to);return;}
    let raf;
    const tick=now=>{const t=Math.min((now-start)/700,1),e=1-Math.pow(1-t,3);setD(from+(to-from)*e);if(t<1)raf=requestAnimationFrame(tick);else{ref.current=to;setD(to);}};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[value]);
  return <span style={style}>{format?format(d):Math.round(d)}</span>;
}
function Ring({pct,size=66,stroke=7,color,track,children}){
  const r=(size-stroke)/2,c=2*Math.PI*r,off=c*(1-Math.min(Math.max(pct||0,0),1));
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{transition:"stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)"}}/>
      </svg>
      {children!=null&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>{children}</div>}
    </div>
  );
}
function Confetti({show}){
  const pieces=useMemo(()=>Array.from({length:60},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*.45,dur:1.7+Math.random()*1.5,color:["#ff453a","#30d158","#0a84ff","#ffd60a","#bf5af2","#ff9f0a"][i%6],w:6+Math.random()*7,rot:Math.random()*360})),[show]);
  if(!show)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:998,pointerEvents:"none",overflow:"hidden"}}>
      {pieces.map(p=><div key={p.id} style={{position:"absolute",top:0,left:p.left+"%",width:p.w,height:p.w*.62,background:p.color,borderRadius:2,transform:`rotate(${p.rot}deg)`,animation:`mtConfetti ${p.dur}s ${p.delay}s ease forwards`}}/>)}
    </div>
  );
}
function PinLock({T,mode,storedPin,onDone,onCancel}){
  const [stage,setStage]=useState(mode==="set"?"new":"enter");
  const [first,setFirst]=useState("");const [entry,setEntry]=useState("");
  const [shake,setShake]=useState(false);const [err,setErr]=useState("");
  const titles={enter:"Enter Passcode",new:"Create Passcode",confirm:"Confirm Passcode"};
  const subs={enter:"Unlock MoneyTrack",new:"Choose a 4-digit code",confirm:"Re-enter your code"};
  const fail=msg=>{setShake(true);setErr(msg||"");haptic([30,40,30]);setTimeout(()=>{setShake(false);setEntry("");setErr("");},520);};
  const commit=code=>{
    if(stage==="enter"){if(code===storedPin){haptic(14);onDone(code);}else fail("Wrong passcode");}
    else if(stage==="new"){setFirst(code);setEntry("");setStage("confirm");}
    else{if(code===first){haptic(14);onDone(code);}else{setStage("new");setFirst("");fail("Codes didn't match");}}
  };
  const press=n=>{if(entry.length>=4)return;haptic(8);const next=entry+n;setEntry(next);if(next.length===4)setTimeout(()=>commit(next),150);};
  const del=()=>{haptic(8);setEntry(e=>e.slice(0,-1));};
  const keys=["1","2","3","4","5","6","7","8","9","","0","del"];
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingBottom:"calc(env(safe-area-inset-bottom)+24px)",animation:"mtFade .25s ease"}}>
      <div style={{width:66,height:66,borderRadius:20,background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,boxShadow:`0 10px 34px ${T.acc}66`}} className="mt-pop">{I.lock("#fff",30)}</div>
      <div style={{fontWeight:700,fontSize:22,color:T.txt}}>{titles[stage]}</div>
      <div style={{fontSize:14,color:err?T.red:T.txt2,marginTop:5,height:18,fontWeight:err?600:400}}>{err||subs[stage]}</div>
      <div style={{display:"flex",gap:18,margin:"26px 0 34px",animation:shake?"mtShake .5s":"none"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:15,height:15,borderRadius:99,background:i<entry.length?(err?T.red:T.acc):"transparent",border:`2px solid ${i<entry.length?(err?T.red:T.acc):T.inpB}`,transition:"all .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,76px)",gap:16}}>
        {keys.map((k,i)=>k===""?<div key={i}/>:k==="del"?(
          <button key={i} onClick={del} style={{height:76,borderRadius:99,background:"transparent",border:"none",color:T.txt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.x(T.txt2)}</button>
        ):(
          <button key={i} onClick={()=>press(k)} className="mt-press" style={{height:76,borderRadius:99,background:T.card,border:`1px solid ${T.border}`,color:T.txt,fontSize:28,fontWeight:500,cursor:"pointer"}}>{k}</button>
        ))}
      </div>
      {onCancel&&<button onClick={onCancel} style={{marginTop:26,background:"none",border:"none",color:T.acc,fontSize:16,fontWeight:600,cursor:"pointer"}}>Cancel</button>}
    </div>
  );
}


function OnboardFlow({T,mode,defAccs,onImport,onFinish}){
  const guide=mode==="guide";
  const [step,setStep]=useState(0);
  const [imported,setImported]=useState(false);
  const [accs,setAccs]=useState(()=>((defAccs&&defAccs.length?defAccs:DEFACCS)||[]).map(a=>({...a,_bal:a.ib?String(a.ib):""})));
  const upd=(i,k,v)=>setAccs(a=>a.map((x,j)=>j===i?{...x,[k]:v}:x));
  const addAcc=()=>setAccs(a=>[...a,{id:uid(),name:"",color:"#3b82f6",ib:0,_bal:""}]);
  const built=()=>accs.filter(a=>(a.name||"").trim()).map(a=>({id:a.id,name:a.name.trim(),color:a.color||"#3b82f6",ib:parseFloat(String(a._bal||"").replace(",","."))||0}));
  const intro=[
    {icon:"💰",title:"Welcome to MoneyTrack",body:"Your private money tracker. Accounts, spending, splits with friends, budgets and goals — all stored on your own device. Your currency · dark · iPhone-grade. Set your region in Settings."},
    {icon:"🧭",title:"How it works",body:"Home — your balance & insights\nActivity — every transaction\nPeople — split bills, debts & recurring\nGoals — savings targets\nAnalytics — budgets & charts\n\nTap the + button to add anything."},
  ];
  const last=guide?1:3;
  const btn=(label,onClick,primary,flex)=>(<button onClick={onClick} style={{flex:flex||1,background:primary?T.acc:T.card,color:primary?"#fff":T.txt,border:"none",borderRadius:12,padding:16,fontWeight:primary?700:600,fontSize:16,cursor:"pointer"}}>{label}</button>);
  const shell=(content,footer)=>(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:T.bg,color:T.txt,display:"flex",flexDirection:"column",padding:"calc(env(safe-area-inset-top) + 28px) 24px calc(env(safe-area-inset-bottom) + 24px)",animation:"mtFade .25s ease"}}>
      <div style={{flex:1,overflowY:"auto"}}>{content}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",margin:"16px 0"}}>{Array.from({length:last+1}).map((_,i)=><div key={i} style={{width:i===step?22:7,height:7,borderRadius:99,background:i===step?T.acc:T.border,transition:"width .2s"}}/>)}</div>
      <div style={{display:"flex",gap:12}}>{footer}</div>
    </div>
  );
  if(step<2){
    const s=intro[step];
    return shell(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"60vh"}}>
        <div style={{fontSize:60,marginBottom:20}}>{s.icon}</div>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:-.6,marginBottom:14,lineHeight:1.15}}>{s.title}</div>
        <div style={{fontSize:16,color:T.txt2,lineHeight:1.6,whiteSpace:"pre-line"}}>{s.body}</div>
      </div>,
      <>{step>0&&btn("Back",()=>setStep(step-1),false,1)}{btn(guide&&step===1?"Got it":"Continue",()=>{if(guide&&step===1)onFinish();else setStep(step+1);},true,2)}</>
    );
  }
  if(step===2){
    return shell(
      <div>
        <div style={{fontSize:24,fontWeight:800,letterSpacing:-.5,marginBottom:4}}>Your accounts</div>
        <div style={{fontSize:14,color:T.txt2,marginBottom:16}}>Name each account and enter its current balance.</div>
        {accs.map((a,i)=>(
          <div key={a.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
            <input value={a.name} onChange={e=>upd(i,"name",e.target.value)} placeholder="Account name" style={{flex:1.5,minWidth:0,width:"100%",background:T.card,color:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",fontSize:15}}/>
            <input value={a._bal} onChange={e=>upd(i,"_bal",e.target.value)} type="number" inputMode="decimal" placeholder={window.mtSym()} style={{flex:1,minWidth:0,width:"100%",background:T.card,color:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",fontSize:15}}/>
            <button onClick={()=>setAccs(x=>x.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.txt3,fontSize:18,cursor:"pointer",padding:4,flexShrink:0}}>✕</button>
          </div>
        ))}
        <button onClick={addAcc} style={{background:T.card,color:T.acc,border:`1px dashed ${T.border}`,borderRadius:12,padding:"12px",width:"100%",fontWeight:600,fontSize:14,cursor:"pointer"}}>+ Add account</button>
      </div>,
      <>{btn("Back",()=>setStep(1),false,1)}{btn("Continue",()=>setStep(3),true,2)}</>
    );
  }
  return shell(
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"55vh"}}>
      <div style={{fontSize:54,marginBottom:18}}>🏦</div>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:-.5,marginBottom:10}}>Connect your bank (optional)</div>
      <div style={{fontSize:15,color:T.txt2,lineHeight:1.6,marginBottom:20}}>If you've used the bank-sync tool, import the file it produced — your real transactions appear automatically. Or skip and add transactions yourself.</div>
      <label style={{display:"block",background:imported?T.card:T.acc,color:imported?T.green:"#fff",border:imported?`1px solid ${T.border}`:"none",borderRadius:12,padding:14,textAlign:"center",fontWeight:700,fontSize:15,cursor:"pointer",marginBottom:10}}>
        {imported?"✓ Bank file imported":"Import bank file"}
        <input type="file" accept="application/json,.json" onChange={e=>{onImport(e);setImported(true);}} style={{display:"none"}}/>
      </label>
      <div style={{fontSize:12,color:T.txt3,textAlign:"center"}}>You can also do this anytime from Settings.</div>
    </div>,
    btn("Start using MoneyTrack",()=>onFinish(imported?{apply:false}:{apply:true,accs:built()}),true,1)
  );
}
