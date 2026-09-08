"use client";

import { CatIcon } from "@/lib/icons";

// V11 merchant identity: a colored monogram tile derived deterministically from the
// merchant name (same merchant = same color everywhere, forever), with the category
// glyph as a small corner badge. Falls back to the plain category tile when there's
// no merchant name. A curated palette keeps the colors "designed" rather than random.
export const PALETTE=[
  "#e11d48","#d97706","#ca8a04","#16a34a","#0d9488","#0284c7",
  "#4f46e5","#7c3aed","#c026d3","#db2777","#dc2626","#2563eb",
];
const hashName=s=>{
  let h=5381;
  for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;
  return h;
};
export const monogramColor=name=>PALETTE[hashName(name.toLowerCase().trim())%PALETTE.length];

export function Monogram({name,cat,size=44,T}){
  const n=(name||"").trim();
  if(!n)return(
    <div style={{width:size,height:size,borderRadius:size*0.28,background:(cat?.color||"#9ca3af")+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <CatIcon cat={cat} size={size*0.45}/>
    </div>
  );
  const col=monogramColor(n);
  const letter=n[0].toUpperCase();
  const badge=Math.round(size*0.42);
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:size*0.28,background:`linear-gradient(180deg,${col}e6,${col})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.42,letterSpacing:-0.5,userSelect:"none"}}>
        {letter}
      </div>
      {cat&&(
        <div style={{position:"absolute",right:-3,bottom:-3,width:badge,height:badge,borderRadius:99,background:cat.color||"#9ca3af",border:`2px solid ${T?.card||"#fff"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CatIcon cat={cat} size={badge*0.55} color="#fff"/>
        </div>
      )}
    </div>
  );
}
