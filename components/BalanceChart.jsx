"use client";

// V11: gradient area chart of TOTAL balance over the last N days — the "is my money
// going up or down" glance. Pure SVG, no library; green when the window trends up,
// red when down. Kept deliberately quiet: one line, soft fill, first/last date labels.
export function BalanceChart({series,T}){
  if(!series||series.length<2)return null;
  const W=320,H=110,padT=8,padB=18;
  const vals=series.map(p=>p.v);
  let min=Math.min(...vals),max=Math.max(...vals);
  if(max-min<1){max+=1;min-=1;} // flat line → give it vertical breathing room
  const span=max-min;
  const X=i=>i/(series.length-1)*W;
  const Y=v=>padT+(1-(v-min)/span)*(H-padT-padB);
  const line=series.map((p,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join("");
  const area=`${line}L${W},${H-padB}L0,${H-padB}Z`;
  const first=series[0],last=series[series.length-1];
  const col=last.v>=first.v?T.green:T.red;
  const fmtD=s=>{const[,m,d]=s.split("-");return `${parseInt(d)}.${parseInt(m)}.`;};
  return(
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block"}} aria-hidden="true">
      <defs>
        <linearGradient id="mtBalFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".16"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {min<0&&max>0&&<line x1={0} x2={W} y1={Y(0)} y2={Y(0)} stroke={T.border} strokeDasharray="3 4" strokeWidth="1"/>}
      <path d={area} fill="url(#mtBalFill)"/>
      <path d={line} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={X(series.length-1)} cy={Y(last.v)} r="3.5" fill={col} stroke={T.card} strokeWidth="1.5"/>
      <text x={0} y={H-4} fontSize="9" fill={T.txt3}>{fmtD(first.d)}</text>
      <text x={W} y={H-4} fontSize="9" fill={T.txt3} textAnchor="end">today</text>
    </svg>
  );
}
