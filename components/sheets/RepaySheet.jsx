"use client";

import { mtSym } from "@/lib/utils";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { Chip, SubmitBtn, AmountInput } from "@/components/form";

export function RepaySheet({modal,closeM,T,dark,fmt,debts,repayForm,setRepayForm,accs,inp,doRepay}){
  return(
      <Sheet open={modal==="repay"} onClose={closeM} title="Log Repayment" T={T}>
        {(()=>{
          const debt=debts.find(x=>x.id===repayForm.debtId);
          if(!debt)return null;
          const remaining=debt.totalAmount-debt.paidBack;
          const chips=[10,20,50].filter(v=>v<remaining);
          const pill={flex:1,padding:"9px 0",borderRadius:99,border:`1.5px solid ${T.border}`,background:T.inp,color:T.txt,fontWeight:600,fontSize:14,cursor:"pointer"};
          return(<>
            <div style={{background:T.bg,borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:12,background:debt.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:22,flexShrink:0}}>{debt.personName[0]?.toUpperCase()}</div>
              <div><div style={{fontWeight:700,fontSize:16,color:T.txt}}>{debt.personName}</div><div style={{fontSize:13,color:T.red,fontWeight:600}}>{fmt(remaining)} remaining</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div><Label text={`Amount (${mtSym()})`} T={T}/><AmountInput placeholder="0.00" value={repayForm.amount} onChange={v=>setRepayForm(f=>({...f,amount:v}))} style={inp}/></div>
              <div><Label text="Date" T={T}/><input type="date" value={repayForm.date} onChange={e=>setRepayForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              {chips.map(v=><button key={v} className="mt-press mt-num" onClick={()=>setRepayForm(f=>({...f,amount:String(v)}))} style={pill}>{mtSym()}{v}</button>)}
              {remaining>20&&<button className="mt-press" onClick={()=>setRepayForm(f=>({...f,amount:String((Math.ceil(remaining/2*100)/100).toFixed(2))}))} style={pill}>Half</button>}
              <button className="mt-press" onClick={()=>setRepayForm(f=>({...f,amount:String(remaining.toFixed(2))}))} style={{...pill,border:`1.5px solid ${T.acc}`,background:T.acc+"18",color:T.acc,fontWeight:700}}>Full</button>
            </div>
            <div style={{marginBottom:14}}>
              <Label text="From Account" T={T}/>
              <div className="mt-hscroll" style={{margin:"0 -20px",padding:"2px 20px",gap:7}}>
                {accs.map(a=>{
                  const on=repayForm.accountId===a.id;
                  return(
                    <Chip key={a.id} on={on} T={T} onClick={()=>setRepayForm(f=>({...f,accountId:a.id}))}>
                      <span style={{width:8,height:8,borderRadius:99,background:on?"#fff":a.color,flexShrink:0}}/>{a.name}
                    </Chip>
                  );
                })}
              </div>
            </div>
            <div style={{marginBottom:20}}><Label text="Notes (optional)" T={T}/><input type="text" placeholder="Any notes…" value={repayForm.notes} onChange={e=>setRepayForm(f=>({...f,notes:e.target.value}))} style={inp}/></div>
            <SubmitBtn onClick={doRepay} disabled={!repayForm.amount||!repayForm.accountId} T={T}>Log Repayment</SubmitBtn>
          </>);
        })()}
      </Sheet>
  );
}
