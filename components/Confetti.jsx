"use client";

import { useMemo } from "react";

export function Confetti({show}){
  const pieces=useMemo(()=>Array.from({length:60},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*.45,dur:1.7+Math.random()*1.5,color:["#ff453a","#30d158","#0a84ff","#ffd60a","#bf5af2","#ff9f0a"][i%6],w:6+Math.random()*7,rot:Math.random()*360})),[show]);
  if(!show)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:998,pointerEvents:"none",overflow:"hidden"}}>
      {pieces.map(p=><div key={p.id} style={{position:"absolute",top:0,left:p.left+"%",width:p.w,height:p.w*.62,background:p.color,borderRadius:2,transform:`rotate(${p.rot}deg)`,animation:`mtConfetti ${p.dur}s ${p.delay}s ease forwards`}}/>)}
    </div>
  );
}
