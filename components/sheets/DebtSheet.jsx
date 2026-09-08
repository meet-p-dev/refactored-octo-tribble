"use client";

import { mtSym } from "@/lib/utils";
import { I } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { ColorDots, SubmitBtn, AmountInput } from "@/components/form";

export function DebtSheet({modal,closeM,editId,T,dark,fmt,debtForm,setDebtForm,accs,inp,doAddDebt}){
  return(
      <Sheet open={modal==="debt"} onClose={closeM} title={editId?"Edit Debt":"Add Debt"} T={T}>
        <div style={{marginBottom:14}}><Label text="Person's Name" T={T}/><input type="text" placeholder="e.g. Sara, Raj, Max…" value={debtForm.personName} onChange={e=>setDebtForm(f=>({...f,personName:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Borrowed (${mtSym()})`} T={T}/><AmountInput placeholder="0.00" value={debtForm.totalAmount} onChange={v=>setDebtForm(f=>({...f,totalAmount:v}))} style={inp}/></div>
          <div>
            <Label text={`Already paid back (${mtSym()})`} T={T}/>
            {/* FIX: cap paidBack at totalAmount in input */}
            <AmountInput
              placeholder="0"
              value={debtForm.paidBack}
              onChange={v=>{
                // v is canonical (dot) — clamp, then write back canonical.
                const total=parseFloat(debtForm.totalAmount)||0;
                const val=parseFloat(v);
                if(isNaN(val)){setDebtForm(f=>({...f,paidBack:v}));return;}
                setDebtForm(f=>({...f,paidBack:total>0&&val>total?String(total):v}));
              }}
              style={inp}/>
          </div>
        </div>
        <div style={{marginBottom:14}}><Label text="Date Borrowed" T={T}/><input type="date" value={debtForm.date} onChange={e=>setDebtForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
        {!editId&&(
          <div style={{marginBottom:14}}>
            <Label text="Money received into account" T={T}/>
            <select value={debtForm.receivedInAccount} onChange={e=>setDebtForm(f=>({...f,receivedInAccount:e.target.value}))} style={inp}>
              <option value="">Don&apos;t log (I&apos;ll do it manually)</option>
              {accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {debtForm.receivedInAccount&&(
              <div style={{marginTop:8,background:dark?"#002e14":"#d4f5df",borderRadius:12,padding:"9px 12px",fontSize:13,color:dark?"#4ade80":"#16a34a",fontWeight:500}}>
                <span style={{display:"inline-flex",verticalAlign:"-2px",marginRight:4}}>{I.check(dark?"#4ade80":"#16a34a",14)}</span>
                Will add +{debtForm.totalAmount?fmt(parseFloat(debtForm.totalAmount)):fmt(0)} income to {accs.find(a=>a.id===debtForm.receivedInAccount)?.name} on {debtForm.date}
                {parseFloat(debtForm.paidBack)>0&&<div style={{marginTop:4}}>And −{fmt(Math.min(parseFloat(debtForm.paidBack),parseFloat(debtForm.totalAmount)||0))} for prior repayment</div>}
              </div>
            )}
          </div>
        )}
        <div style={{marginBottom:14}}><Label text="Description (optional)" T={T}/><input type="text" placeholder="e.g. for groceries, emergency…" value={debtForm.description} onChange={e=>setDebtForm(f=>({...f,description:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:22}}><Label text="Color" T={T}/><ColorDots value={debtForm.color} onChange={c=>setDebtForm(f=>({...f,color:c}))} T={T}/></div>
        <SubmitBtn onClick={doAddDebt} disabled={!debtForm.personName||!debtForm.totalAmount} T={T}>{editId?"Save Changes":"Add Debt"}</SubmitBtn>
      </Sheet>
  );
}
