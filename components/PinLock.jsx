"use client";

import { useState } from "react";
import { haptic } from "@/lib/utils";
import { I } from "@/lib/icons";

export function PinLock({T,mode,storedPin,onDone,onCancel}){
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
