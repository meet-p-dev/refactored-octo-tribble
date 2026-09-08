"use client";

import { haptic } from "@/lib/utils";

export function Toggle({value,onChange,T}){
  return(
    <div onClick={()=>{haptic(10);onChange(!value);}} style={{width:51,height:31,borderRadius:99,background:value?T.acc:T.border,cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:value?22:2,width:27,height:27,borderRadius:99,background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.3)",transition:"left .25s cubic-bezier(.34,1.56,.64,1)"}}/>
    </div>
  );
}
