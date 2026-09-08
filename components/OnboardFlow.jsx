"use client";

import { useState } from "react";
import { DEFACCS } from "@/lib/constants";
import { uid, mtSym } from "@/lib/utils";
import { I } from "@/lib/icons";
import { AmountInput } from "@/components/form";

export function OnboardFlow({T,mode,defAccs,onImport,onFinish}){
  const guide=mode==="guide";
  const [step,setStep]=useState(0);
  const [imported,setImported]=useState(false);
  const [accs,setAccs]=useState(()=>((defAccs&&defAccs.length?defAccs:DEFACCS)||[]).map(a=>({...a,_bal:a.ib?String(a.ib):""})));
  const upd=(i,k,v)=>setAccs(a=>a.map((x,j)=>j===i?{...x,[k]:v}:x));
  const addAcc=()=>setAccs(a=>[...a,{id:uid(),name:"",color:"#3b82f6",ib:0,_bal:""}]);
  const built=()=>accs.filter(a=>(a.name||"").trim()).map(a=>({id:a.id,name:a.name.trim(),color:a.color||"#3b82f6",ib:parseFloat(String(a._bal||"").replace(",","."))||0}));
  const intro=[
    {icon:I.wallet,title:"Welcome to MoneyTrack",body:"Your private money tracker. Accounts, spending, debts, budgets and goals — all stored on your own device. Your currency · dark · iPhone-grade. Set your region in Settings."},
    {icon:I.goal,title:"How it works",body:"Home — your balance, alerts & trends\nActivity — every transaction\nInsights — spending, budgets & calendar\nWallet — accounts, cards, debts & goals\n\nTap the big + button to add anything."},
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
        <div style={{marginBottom:20}}>{s.icon(T.acc,60)}</div>
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
        <div style={{fontSize:14,color:T.txt2,marginBottom:16}}>Add the accounts you track by hand — cash, a wallet, anything without a bank feed. Name each one and enter what&apos;s in it today.</div>
        {/* Nothing is pre-filled: a bank account should come from the bank, not from a
            guess. Connecting a bank (next step) creates those accounts for you with
            their real balances, so adding them here as well would double-count them. */}
        {accs.length===0&&(
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"18px 16px",marginBottom:12,textAlign:"center"}}>
            <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{I.wallet(T.txt3,30)}</div>
            <div style={{fontWeight:650,fontSize:15,color:T.txt,marginBottom:4}}>No accounts yet</div>
            <div style={{fontSize:13,color:T.txt2,lineHeight:1.5}}>Add a manual account below — or skip this and connect your bank on the next step, which adds your real accounts automatically.</div>
          </div>
        )}
        {accs.map((a,i)=>(
          <div key={a.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
            <input value={a.name} onChange={e=>upd(i,"name",e.target.value)} placeholder="Account name" style={{flex:1.5,minWidth:0,width:"100%",background:T.card,color:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",fontSize:15}}/>
            <AmountInput value={a._bal} onChange={v=>upd(i,"_bal",v)} placeholder={mtSym()} style={{flex:1,minWidth:0,width:"100%",background:T.card,color:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",fontSize:15}}/>
            <button onClick={()=>setAccs(x=>x.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.txt3,fontSize:18,cursor:"pointer",padding:4,flexShrink:0}}>✕</button>
          </div>
        ))}
        <button onClick={addAcc} style={{background:T.card,color:T.acc,border:`1px dashed ${T.border}`,borderRadius:12,padding:"12px",width:"100%",fontWeight:600,fontSize:14,cursor:"pointer"}}>+ Add account</button>
      </div>,
      <>{btn("Back",()=>setStep(1),false,1)}{btn("Continue",()=>setStep(3),true,2)}</>
    );
  }
  const finish=extra=>onFinish({...(imported?{apply:false}:{apply:true,accs:built()}),...extra});
  return shell(
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"55vh"}}>
      <div style={{marginBottom:18}}>{I.card(T.acc,54)}</div>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:-.5,marginBottom:10}}>Connect your bank (optional)</div>
      <div style={{fontSize:15,color:T.txt2,lineHeight:1.6,marginBottom:20}}>Sign in once and MoneyTrack pulls your real accounts and transactions, then keeps them up to date 3× a day. Nothing is shared — the data stays in your own account.</div>
      {/* Straight into the bank sheet rather than "it's in Settings somewhere": the first
          thing a new user needs is to SEE where accounts come from. */}
      <button onClick={()=>finish({openBank:true})} style={{background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:700,fontSize:15,cursor:"pointer",marginBottom:10,width:"100%"}}>
        Connect a bank
      </button>
      <label style={{display:"block",background:T.card,color:imported?T.green:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:14,textAlign:"center",fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:10}}>
        {imported?"✓ Backup imported":"Restore from a backup file"}
        <input type="file" accept="application/json,.json" onChange={e=>{onImport(e);setImported(true);}} style={{display:"none"}}/>
      </label>
      <div style={{fontSize:12,color:T.txt3,textAlign:"center"}}>Both are always available later under Settings → Bank sync.</div>
    </div>,
    btn("Start using MoneyTrack",()=>finish(),true,1)
  );
}
