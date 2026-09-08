"use client";

import { useState } from "react";

export function MiniChart({data,T,fmt:f}){
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
