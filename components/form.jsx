"use client";

// Shared form primitives for the add/edit sheets. Purely presentational —
// each takes the same value/onChange the sheets already manage, so swapping
// one in never changes form state, validation, or persistence.

import { useState, useEffect } from "react";
import { I, SYM_KEYS } from "@/lib/icons";
import { decSep } from "@/lib/utils";
import { PALETTE } from "@/components/Monogram";

// ── Amount entry ──────────────────────────────────────────────────────────────
// Amounts are STORED canonically ("48.53", always a dot) but TYPED and SHOWN in the
// region's format ("48,53" in Germany). Keeping storage canonical is what lets every
// existing parseFloat()/String() call site keep working untouched — parseFloat("48,53")
// would silently return 48.
const toCanon = (t, sep) => String(t ?? "").replace(sep, ".");
const toText  = (v, sep) => String(v ?? "").replace(".", sep);

export function AmountInput({value,onChange,inputRef,style,className,placeholder,...rest}){
  const sep=decSep();
  const [raw,setRaw]=useState(()=>toText(value,sep));

  // Re-sync the visible text when `value` changes from the outside — the +5/+10 chips,
  // Half/Full, an edit prefill, or a currency switch. Compared NUMERICALLY, not as
  // strings: while typing "48," the canonical is "48.", and a string compare would
  // rewrite the field and eat the separator the user just pressed.
  useEffect(()=>{
    const a=parseFloat(toCanon(raw,sep)),b=parseFloat(value);
    if(!raw&&!value)return;
    if(isNaN(a)&&isNaN(b))return;
    if(a!==b)setRaw(toText(value,sep));
  },[value,sep]); // eslint-disable-line react-hooks/exhaustive-deps

  const onInput=e=>{
    // Accept whichever separator the keypad offers, then normalise: digits plus at
    // most one separator, rendered in the local convention.
    const cleaned=e.target.value.replace(/[^\d.,]/g,"");
    const parts=cleaned.split(/[.,]/);
    const t=parts.length>1?parts[0]+sep+parts.slice(1).join(""):parts[0];
    setRaw(t);
    onChange(toCanon(t,sep));
  };

  return <input {...rest} ref={inputRef} type="text" inputMode="decimal" value={raw}
    onChange={onInput} placeholder={placeholder} className={className} style={style}/>;
}

export function SymbolGrid({value,onChange,T,color,keys}){
  return(
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {(keys||SYM_KEYS).map(k=>{
        const on=value===k;
        return(
          <button key={k} className="mt-press" onClick={()=>onChange(k)} aria-label={k}
            style={{width:44,height:44,borderRadius:12,border:`1.5px solid ${on?(color||T.acc):T.border}`,background:on?(color||T.acc)+"18":T.inp,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {I[k](on?(color||T.acc):T.txt2,20)}
          </button>
        );
      })}
    </div>
  );
}

export function SubmitBtn({onClick,disabled,T,children}){
  return(
    <button onClick={onClick} disabled={disabled} className="mt-press"
      style={{display:"block",width:"100%",background:disabled?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:disabled?"not-allowed":"pointer",marginBottom:4,transition:"background .2s"}}>
      {children}
    </button>
  );
}

export function ColorDots({value,onChange,T}){
  const val=(value||"").toLowerCase();
  const custom=!!val&&!PALETTE.includes(val);
  const ring=on=>on?`0 0 0 2px ${T.card},0 0 0 4px ${T.acc}`:"none";
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:9,alignItems:"center"}}>
      {PALETTE.map(c=>(
        <button key={c} className="mt-press" onClick={()=>onChange(c)} aria-label={`Color ${c}`}
          style={{width:34,height:34,borderRadius:99,background:c,border:"none",padding:0,cursor:"pointer",flexShrink:0,boxShadow:ring(val===c)}}/>
      ))}
      <label className="mt-press" aria-label="Custom color"
        style={{width:34,height:34,borderRadius:99,position:"relative",overflow:"hidden",cursor:"pointer",flexShrink:0,boxShadow:ring(custom),background:custom?value:"conic-gradient(#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {I.edit("#fff")}
        <input type="color" value={value||"#000000"} onChange={e=>onChange(e.target.value)}
          style={{position:"absolute",inset:0,opacity:0,width:"100%",height:"100%",cursor:"pointer"}}/>
      </label>
    </div>
  );
}

export function Segmented({items,value,onChange,T}){
  return(
    <div style={{display:"flex",background:T.inp,borderRadius:12,padding:4,gap:4,border:`1.5px solid ${T.inpB}`}}>
      {items.map(([v,l])=>{
        const on=value===v;
        return(
          <button key={v} onClick={()=>onChange(v)}
            style={{flex:1,padding:"10px 0",borderRadius:12,border:"none",background:on?T.acc:"transparent",color:on?"#fff":T.txt2,fontWeight:600,fontSize:14,cursor:"pointer",transition:"all .2s"}}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({on,onClick,T,accent,children}){
  const a=accent||T.acc;
  return(
    <button onClick={onClick} className="mt-press"
      style={{display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0,padding:"9px 14px",borderRadius:99,border:`1.5px solid ${on?a:T.border}`,background:on?a:T.inp,color:on?"#fff":T.txt2,fontWeight:600,fontSize:14,cursor:"pointer",transition:"background .15s,border-color .15s"}}>
      {children}
    </button>
  );
}

export function AddBtn({onClick,T,color,children}){
  return(
    <button onClick={onClick} className="mt-press"
      style={{display:"flex",alignItems:"center",gap:6,background:color||T.acc,color:"#fff",border:"none",borderRadius:99,padding:"9px 15px",fontWeight:600,fontSize:14,cursor:"pointer"}}>
      {I.plus("#fff",16)} {children}
    </button>
  );
}
