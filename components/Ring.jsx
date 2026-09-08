export function Ring({pct,size=66,stroke=7,color,track,children}){
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
