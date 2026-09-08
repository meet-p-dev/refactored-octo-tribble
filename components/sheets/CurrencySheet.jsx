"use client";

import { Fragment } from "react";
import { CURRENCIES } from "@/lib/constants";
import { I } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";

export function CurrencySheet({ modal, onClose, T, curId, setCur }) {
  return (
    <Sheet open={modal==="currency"} onClose={onClose} title="Currency & Region" T={T}>
      <div style={{fontSize:13,color:T.txt2,marginBottom:14}}>
        Pick where you use MoneyTrack. This sets your currency and how amounts are written
        (e.g. 1.000,00 € vs $1,000.00) everywhere in the app.
      </div>
      <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:16}}>
        {CURRENCIES.map((c,i)=>{
          const sel=curId===c.id;
          const ex=new Intl.NumberFormat(c.loc,{style:"currency",currency:c.cur}).format(1234.56);
          return (
            <Fragment key={c.id}>
              {i>0&&<div style={{height:1,background:T.border}}/>}
              <button className="mt-tap" onClick={()=>{setCur(c.id);onClose();}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:sel?T.acc+"18":"transparent",border:"none",padding:"13px 16px",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,flexShrink:0}}>{c.flag}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:15,color:T.txt}}>{c.country} · {c.cur}</div>
                  <div style={{fontSize:12,color:T.txt2,marginTop:1,fontVariantNumeric:"tabular-nums"}}>{ex}</div>
                </div>
                {sel&&<span style={{flexShrink:0}}>{I.check(T.acc)}</span>}
              </button>
            </Fragment>
          );
        })}
      </div>
      <div style={{height:8}}/>
    </Sheet>
  );
}
