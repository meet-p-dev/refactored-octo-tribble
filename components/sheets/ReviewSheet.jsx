"use client";

import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { I, CatIcon } from "@/lib/icons";
import { Monogram } from "@/components/Monogram";
import { REVIEW_CHOICES } from "@/lib/classify";

// label (engine) → review-choice key, for highlighting the engine's best guess
const labelToKey = l => (l === "salary" || l === "freelance") ? "income" : l;

// The Review inbox: bank credits the classifier couldn't confidently call income. Each one
// sits OUT of your income total (as a neutral "credit") until you pick what it is here. Your
// pick is remembered per-payee, so the same friend/employer is auto-handled next sync.
export function ReviewSheet({
  modal,closeM,T,dark,fmt,reviewTxs,accs,getCat,classifyReview,ownerName,saveOwnerName,doEditTx,
}){
  const acc=id=>accs.find(a=>a.id===id)?.name||"?";
  return(
    <Sheet open={modal==="review"} onClose={closeM} title="Review income" T={T}>
      {/* Your name — powers own-account transfer detection */}
      <div style={{marginBottom:16}}>
        <Label text="Your name (for spotting your own transfers)"/>
        <input
          value={ownerName}
          onChange={e=>saveOwnerName(e.target.value)}
          placeholder="e.g. Meet Patel"
          style={{display:"block",width:"100%",background:T.inp,color:T.txt,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"12px 14px",fontSize:16,outline:"none"}}
        />
        <div style={{fontSize:12,color:T.txt3,marginTop:6,lineHeight:1.4}}>
          Money you send between your own accounts (matching this name) won't be counted as income.
        </div>
      </div>

      {reviewTxs.length===0?(
        <div style={{textAlign:"center",padding:"22px 0 34px",color:T.txt3}}>
          <div style={{marginBottom:8}}>{I.check(T.green,42)}</div>
          <div style={{fontWeight:600,fontSize:15,color:T.txt2}}>Nothing to review</div>
          <div style={{fontSize:13,marginTop:6,lineHeight:1.5,maxWidth:280,marginLeft:"auto",marginRight:"auto"}}>
            Every incoming payment is classified. New bank credits that don't look like clear
            income will show up here for a quick tap.
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12,paddingBottom:12}}>
          <div style={{fontSize:13,color:T.txt2,lineHeight:1.45}}>
            <strong style={{color:T.txt}}>{reviewTxs.length}</strong> incoming payment{reviewTxs.length>1?"s":""} — not counted as income yet.
            Tap what each one is; we'll remember it for that person.
          </div>
          {reviewTxs.map(t=>{
            const c=getCat(t.category);
            const suggested=labelToKey(t._suggest?.[0]);
            return(
              <div key={t.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:16,padding:"13px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:8}}>
                  <Monogram name={t.merchant} cat={c} size={40} T={T}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant||"Bank transaction"}</div>
                    <div style={{fontSize:12,color:T.txt2}}>{t.date} · {acc(t.accountId)}</div>
                  </div>
                  <div style={{fontWeight:700,fontSize:16,color:T.recv,fontVariantNumeric:"tabular-nums",flexShrink:0}}>+{fmt(t.amount)}</div>
                </div>
                {t.notes&&<div style={{fontSize:12,color:T.txt3,fontStyle:"italic",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.notes}</div>}
                {t._clsReason&&<div style={{fontSize:11.5,color:T.txt3,marginBottom:9,lineHeight:1.35}}>{t._clsReason}{t._conf!=null&&` · ${Math.round(t._conf*100)}% sure`}</div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {REVIEW_CHOICES.map((ch,i)=>{
                    const isSug=ch.key===suggested;
                    const last=i===REVIEW_CHOICES.length-1&&REVIEW_CHOICES.length%2===1;
                    return(
                      <button key={ch.key} onClick={()=>classifyReview(t,ch)}
                        style={{textAlign:"left",background:isSug?T.recv+"1c":T.card,border:`1.5px solid ${isSug?T.recv:T.border}`,borderRadius:12,padding:"9px 11px",cursor:"pointer",gridColumn:last?"1 / -1":"auto"}}>
                        <div style={{fontWeight:700,fontSize:13.5,color:isSug?T.recv:T.txt}}>{ch.label}{isSug&&<span style={{fontSize:9.5,fontWeight:600,marginLeft:6,opacity:.8}}>SUGGESTED</span>}</div>
                        <div style={{fontSize:10.5,color:T.txt3,marginTop:1,lineHeight:1.25}}>{ch.sub}</div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={()=>{closeM();doEditTx(t);}} style={{marginTop:8,background:"none",border:"none",color:T.acc,fontSize:12.5,fontWeight:600,cursor:"pointer",padding:0}}>Edit details instead →</button>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
