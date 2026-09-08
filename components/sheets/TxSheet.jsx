"use client";

import { useRef, useEffect, useState } from "react";
import { mtSym } from "@/lib/utils";
import { I, CatIcon } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { Chip, SubmitBtn, AmountInput, SymbolGrid, ColorDots } from "@/components/form";

// The five directions a row can have. Money-in and money-out are paired, so "Received"
// (in, not income) always sits opposite "Sent out" (out, not spending) — Transfer spans
// the last row. Keeping every type here means no bank row can render with nothing selected.
const TYPES=[["expense","Expense",I.upload],["income","Income",I.download],["credit","Received",I.repeat],["debit","Sent out",I.swap],["transfer","Transfer",I.swap]];
const defCat=(v,cur)=>
  v==="credit"&&!["reimburse","refund","transfer"].includes(cur)?"reimburse":
  v==="debit"&&!["transfer","debt"].includes(cur)?"transfer":cur;

export function TxSheet({modal,closeM,editId,T,dark,fmt,txForm,setTxForm,accs,cats,inp,doAddTx,suggestCat,orderedCats,recentMerchants,addQuickCat}){
  const amtRef=useRef(null);
  const catRowRef=useRef(null);
  const open=modal==="tx";
  const [newCat,setNewCat]=useState(null); // {label,sym,color} while the inline creator is open

  // Per-type accent drives the hero tint and the selected type card.
  // "debit" = money that LEFT the account but isn't spending (a transfer to yourself,
  // a payment the classifier recognised as your own). It used to have no button and no
  // sign of its own, so the sheet showed it as "+" with nothing selected — one tap then
  // silently reversed the row. It is a first-class, correctly-signed choice now.
  const ACCENTS={expense:T.red,income:T.green,credit:T.recv,debit:T.txt2,transfer:T.acc};
  const OUT=txForm.type==="expense"||txForm.type==="debit";
  const accent=ACCENTS[txForm.type]||T.acc;
  const sign=OUT?"−":txForm.type==="transfer"?"":"+";

  // Same merchant handler as typing — recent-merchant chips reuse it so the
  // suggestCat/_catTouched rules apply identically for both entry paths.
  const setMerchant=v=>{
    setTxForm(f=>{
      const next={...f,merchant:v};
      if(!f._catTouched&&f.type==="expense"){
        const s=suggestCat?.(v);
        if(s)next.category=s;
      }
      return next;
    });
  };

  // Every category, most-used first; if an edited tx points at a deleted
  // category, keep it visible/selectable via a gray fallback chip.
  const catList=(orderedCats&&orderedCats.length?orderedCats:cats)||[];
  const catMissing=txForm.category&&!catList.some(c=>c.id===txForm.category);
  const fullCatList=catMissing?[...catList,{id:txForm.category,label:txForm.category,color:"#9ca3af"}]:catList;

  // Keep the selected category chip in view when the sheet opens or the
  // selection moves (type switch, suggestCat, merchant chip).
  useEffect(()=>{
    if(!open)return;
    const el=catRowRef.current?.querySelector(`[data-catid="${CSS.escape(txForm.category||"")}"]`);
    el?.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"});
  },[open,txForm.category,txForm.type]);

  // Reset the inline creator whenever the sheet closes.
  useEffect(()=>{if(!open)setNewCat(null);},[open]);

  // Desktop nicety only — mobile keyboards don't raise reliably from
  // programmatic focus and it fights the sheet's spring animation.
  useEffect(()=>{
    if(open&&!editId&&window.matchMedia?.("(pointer:fine)").matches){
      const t=setTimeout(()=>amtRef.current?.focus(),420);
      return()=>clearTimeout(t);
    }
  },[open,editId]);

  const createCat=()=>{
    const label=(newCat?.label||"").trim();
    if(!label)return;
    const id=addQuickCat({label,sym:newCat.sym,color:newCat.color});
    setTxForm(f=>({...f,category:id,_catTouched:true}));
    setNewCat(null);
  };

  const heroLen=Math.max(String(txForm.amount||"").length,1)+1;
  const hscrollBleed={margin:"0 -20px",padding:"2px 20px"};
  const amtNum=parseFloat(txForm.amount);
  const dis=!txForm.amount||isNaN(amtNum)||!txForm.accountId||(txForm.type==="transfer"&&!txForm.toAccountId);

  return(
      <Sheet open={open} onClose={closeM} title={editId?"Edit Transaction":"New Transaction"} T={T}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:6}}>
          {TYPES.map(([v,l,ic],i)=>{
            // In/out pairs first, then Transfer spanning the last row (odd count).
            // "Received" = money in that isn't income (reimbursement/refund/own transfer).
            // "Sent out" = money out that isn't spending (your own transfer, a payback).
            // Selecting either defaults to a sensible category if none is set yet.
            const on=txForm.type===v;
            const a=ACCENTS[v];
            const span=i===TYPES.length-1&&TYPES.length%2===1;
            return(
            <button key={v} className="mt-press" onClick={()=>setTxForm(f=>({...f,type:v,category:defCat(v,f.category)}))} style={{gridColumn:span?"1 / -1":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"11px 4px",borderRadius:12,border:`1.5px solid ${on?a:T.border}`,background:on?a:T.inp,color:on?"#fff":T.txt2,fontWeight:600,fontSize:13,cursor:"pointer",transition:"background .15s,border-color .15s"}}>{ic(on?"#fff":T.txt2,14)} {l}</button>
          );})}
        </div>

        {/* Hero amount — the field you always type gets the hero treatment. */}
        <div onClick={()=>amtRef.current?.focus()} style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:6,margin:"16px 0 12px",cursor:"text"}}>
          <span className="mt-num" style={{fontSize:24,fontWeight:600,color:T.txt3,transition:"color .2s"}}>{sign}{mtSym()}</span>
          <AmountInput inputRef={amtRef} placeholder="0"
            value={txForm.amount} onChange={v=>setTxForm(f=>({...f,amount:v}))}
            className="mt-num mt-heroinp" aria-label={`Amount (${mtSym()})`}
            style={{width:`${heroLen}ch`,maxWidth:"60vw",background:"transparent",border:"none",outline:"none",textAlign:"center",padding:0,fontSize:"clamp(34px,9.5vw,44px)",fontWeight:700,letterSpacing:-1,color:accent,transition:"color .2s",WebkitAppearance:"none",appearance:"none"}}/>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:16}}>
          {[1,5,10,20,50].map(v=>(
            <button key={v} className="mt-press mt-num" onClick={()=>setTxForm(f=>({...f,amount:String(Math.round(((parseFloat(f.amount)||0)+v)*100)/100)}))} style={{flex:1,padding:"9px 0",borderRadius:99,border:`1.5px solid ${T.border}`,background:T.inp,color:T.txt,fontWeight:600,fontSize:14,cursor:"pointer"}}>+{v}</button>
          ))}
          <button className="mt-press" onClick={()=>setTxForm(f=>({...f,amount:""}))} style={{padding:"9px 14px",borderRadius:99,border:`1.5px solid ${T.border}`,background:T.inp,color:T.red,fontWeight:700,fontSize:14,cursor:"pointer"}}>C</button>
        </div>

        <div style={{marginBottom:14}}>
          <Label text="Merchant / Payee" T={T}/>
          <input type="text" placeholder="e.g. Kaufland, Apple Music…" value={txForm.merchant}
            onChange={e=>setMerchant(e.target.value)} style={inp}/>
          {!editId&&recentMerchants?.length>0&&(
            <div className="mt-hscroll" style={{...hscrollBleed,marginTop:8,gap:7}}>
              {recentMerchants.map(m=>(
                <button key={m} className="mt-press" onClick={()=>setMerchant(m)} style={{whiteSpace:"nowrap",flexShrink:0,padding:"7px 12px",borderRadius:99,border:`1.5px solid ${T.border}`,background:T.inp,color:T.txt2,fontWeight:500,fontSize:13,cursor:"pointer"}}>{m}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{marginBottom:14}}>
          <Label text="Account" T={T}/>
          <div className="mt-hscroll" style={{...hscrollBleed,gap:7}}>
            {accs.map(a=>{
              const on=txForm.accountId===a.id;
              return(
                <Chip key={a.id} on={on} T={T} onClick={()=>setTxForm(f=>({...f,accountId:a.id}))}>
                  <span style={{width:8,height:8,borderRadius:99,background:on?"#fff":a.color,flexShrink:0}}/>{a.name}
                </Chip>
              );
            })}
          </div>
        </div>

        {txForm.type==="transfer"?(
          <div style={{marginBottom:14}}>
            <Label text="To Account" T={T}/>
            <div className="mt-hscroll" style={{...hscrollBleed,gap:7}}>
              {accs.map(a=>{
                const on=txForm.toAccountId===a.id;
                return(
                  <Chip key={a.id} on={on} T={T} onClick={()=>setTxForm(f=>({...f,toAccountId:a.id}))}>
                    <span style={{width:8,height:8,borderRadius:99,background:on?"#fff":a.color,flexShrink:0}}/>{a.name}
                  </Chip>
                );
              })}
            </div>
          </div>
        ):(
          <div style={{marginBottom:14}}>
            <Label text="Category" T={T}/>
            <div ref={catRowRef} className="mt-hscroll" style={{...hscrollBleed,gap:7}}>
              {fullCatList.map(c=>{
                const on=txForm.category===c.id;
                return(
                  <span key={c.id} data-catid={c.id} style={{flexShrink:0}}>
                    <Chip on={on} T={T} accent={c.color} onClick={()=>setTxForm(f=>({...f,category:c.id,_catTouched:true}))}>
                      <CatIcon cat={c} size={15} color={on?"#fff":c.color}/>{c.label}
                    </Chip>
                  </span>
                );
              })}
              {addQuickCat&&(
                <span style={{flexShrink:0}}>
                  <Chip on={false} T={T} onClick={()=>setNewCat(n=>n?null:{label:"",sym:"box",color:"#9ca3af"})}>
                    {I.plus(T.txt2,14)} New
                  </Chip>
                </span>
              )}
            </div>
            {/* Inline creator — a nested sheet would close this one and lose the form. */}
            {newCat&&(
              <div style={{marginTop:10,background:T.inp,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:14}}>
                <Label text="New category" T={T}/>
                <input type="text" autoFocus placeholder="e.g. Gym, Coffee…" value={newCat.label}
                  onChange={e=>setNewCat(n=>({...n,label:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter")createCat();}}
                  style={{...inp,marginBottom:12}}/>
                <div style={{marginBottom:12}}><SymbolGrid value={newCat.sym} onChange={s=>setNewCat(n=>({...n,sym:s}))} T={T} color={newCat.color}/></div>
                <div style={{marginBottom:14}}><ColorDots value={newCat.color} onChange={c=>setNewCat(n=>({...n,color:c}))} T={T}/></div>
                <div style={{display:"flex",gap:8}}>
                  <button className="mt-press" onClick={()=>setNewCat(null)} style={{flex:1,padding:"12px 0",borderRadius:12,border:`1.5px solid ${T.border}`,background:"transparent",color:T.txt2,fontWeight:600,fontSize:15,cursor:"pointer"}}>Cancel</button>
                  <button className="mt-press" onClick={createCat} disabled={!newCat.label.trim()} style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:newCat.label.trim()?T.acc:T.txt3,color:"#fff",fontWeight:700,fontSize:15,cursor:newCat.label.trim()?"pointer":"not-allowed"}}>Create</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:txForm.type==="expense"?"1fr 1fr":"1fr",gap:10,marginBottom:txForm.type==="expense"?6:14}}>
          <div><Label text="Date" T={T}/><input type="date" value={txForm.date} onChange={e=>setTxForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
          {txForm.type==="expense"&&(
            <div><Label text={`My share (opt., ${mtSym()})`} T={T}/><AmountInput placeholder={txForm.amount?`Full ${fmt(parseFloat(txForm.amount)||0)}`:"Full amount"} value={txForm._share||""} onChange={v=>setTxForm(f=>({...f,_share:v}))} style={inp}/></div>
          )}
        </div>
        {txForm.type==="expense"&&(
          <div style={{fontSize:12,color:T.txt2,marginBottom:14}}>Paid for others (rent, group bills)? Enter only <b>your</b> part — that&apos;s what counts as your spending. Leave blank for the full amount.</div>
        )}

        <div style={{marginBottom:20}}><Label text="Notes (optional)" T={T}/><input type="text" placeholder="Any notes…" value={txForm.notes} onChange={e=>setTxForm(f=>({...f,notes:e.target.value}))} style={inp}/></div>
        <SubmitBtn onClick={doAddTx} disabled={dis} T={T}>
          {editId?"Save Changes":"Add Transaction"}
        </SubmitBtn>
      </Sheet>
  );
}
