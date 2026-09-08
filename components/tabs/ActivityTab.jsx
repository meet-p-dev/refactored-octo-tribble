"use client";

import { personalAmt } from "@/lib/utils";
import { I } from "@/lib/icons";
import { Monogram } from "@/components/Monogram";

export function ActivityTab({
  T,dark,fmt,search,setSearch,fType,setFType,filtTxs,filtSummary,
  fCat,setFCat,cats,fAcc,setFAcc,accs,getCat,doEditTx,doDeleteTx,haptic,
}){
  return(<>
          <div style={{position:"relative",marginBottom:10}}>
            <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}>{I.srch(T.txt3)}</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search merchant…" style={{display:"block",width:"100%",background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"12px 40px 12px 38px",fontSize:16,outline:"none"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",display:"flex"}}>{I.x(T.txt3)}</button>}
          </div>
          <div style={{display:"flex",gap:7,marginBottom:10}}>
            {[["","All"],["income","Income"],["credit","Received"],["expense","Expenses"],["transfer","Transfers"]].map(([v,l])=>{
              const on=fType===v;
              const onBg=v==="credit"?T.recv:T.acc;
              return(
              <button key={v} onClick={()=>{haptic(8);setFType(v);}} className="mt-press" style={{flex:1,padding:"8px 2px",borderRadius:99,border:"none",background:on?onBg:T.card,color:on?"#fff":T.txt2,fontWeight:600,fontSize:12.5,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</button>
            );})}
          </div>
          {filtTxs.length>0&&(
            <div style={{fontSize:13,color:T.txt2,margin:"0 2px 10px"}}>
              {filtTxs.length} transaction{filtTxs.length>1?"s":""} · <strong style={{color:T.txt}}>{fmt(filtSummary.sum)}</strong> {filtSummary.verb}
            </div>
          )}
          <div style={{display:"flex",gap:8,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"9px 14px",fontSize:14,flexShrink:0,outline:"none"}}>
              <option value="">All categories</option>
              {cats.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={fAcc} onChange={e=>setFAcc(e.target.value)} style={{background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"9px 14px",fontSize:14,flexShrink:0,outline:"none"}}>
              <option value="">All accounts</option>
              {accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {search&&filtTxs.length>0&&(
            <div style={{background:dark?"#001533":"#deeaff",borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",fontSize:14}}>
              <span style={{fontWeight:600,color:T.acc}}>"{search}"</span>
              {/* FIX: use personalAmt for search total */}
              <span style={{color:T.txt2}}>{filtTxs.length} txs · <strong style={{color:T.acc}}>{fmt(filtSummary.sum)}</strong></span>
            </div>
          )}
          <div style={{background:T.card,borderRadius:20,overflow:"hidden",marginBottom:12,boxShadow:T.shadow}}>
            {filtTxs.length===0?<div style={{padding:24,color:T.txt3,textAlign:"center",fontSize:14}}>No transactions found</div>
            :filtTxs.map((t,i)=>{
              const c=getCat(t.category),a=accs.find(x=>x.id===t.accountId);
              const disp=personalAmt(t);
              return(
                <div key={t.id} onClick={()=>{haptic(8);doEditTx(t);}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                  <Monogram name={t.merchant} cat={c} size={44} T={T}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                      <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant||"Unknown"}</div>
                      {t.isSplit&&<span style={{fontSize:10,fontWeight:600,background:dark?"#002e14":"#d4f5df",color:dark?"#30d158":"#16a34a",borderRadius:6,padding:"1px 5px",flexShrink:0}}>{t.splitSettled?"✓":"split"}</span>}
                      {t._needsReview&&<span style={{fontSize:10,fontWeight:600,background:dark?"#001533":"#e7f0ff",color:dark?"#4da3ff":"#0051d5",borderRadius:6,padding:"1px 5px",flexShrink:0}}>review</span>}
                    </div>
                    <div style={{fontSize:12,color:T.txt2}}>{t.date} · {a?.name||"?"} · {c.label}</div>
                    {t.notes&&<div style={{fontSize:12,color:T.txt3,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.notes}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <span style={{fontWeight:700,fontSize:16,color:t.type==="income"?T.green:t.type==="expense"?T.red:t.type==="credit"||t.type==="debit"?T.recv:T.txt2}}>
                      {t.type==="income"||t.type==="credit"?"+":t.type==="expense"||t.type==="debit"?"−":"⇄"}{fmt(disp)}
                    </span>
                    {t.isSplit&&<div style={{fontSize:10,color:T.txt3}}>full {fmt(t.amount)}</div>}
                    {t._shareAmt!=null&&<div style={{fontSize:10,color:T.txt3}}>your share · full {fmt(t.amount)}</div>}
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={e=>{e.stopPropagation();doEditTx(t);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>{I.edit(T.acc)}</button>
                      <button onClick={e=>{e.stopPropagation();doDeleteTx(t.id);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>{I.trash(T.red)}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>);
}
