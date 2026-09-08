"use client";

import { I } from "@/lib/icons";
import { AddBtn } from "@/components/form";

// Debt tracking. (Splits and recurring transactions were removed once bank sync landed —
// the bank imports real recurring charges, and split-settlements duplicated income.)
export function PeopleTab({
  T,dark,fmt,totalDebt,getCat,
  activeDebts,accs,setDebtForm,iDebt,setEditId,setModal,openRepay,doEditDebt,delDebt,settledDebts,haptic,
}){
  return(<>
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:20}}>Debts</div>
            <div style={{fontSize:13,color:T.txt2,marginTop:1}}>{activeDebts.length>0?`You owe ${fmt(totalDebt)}`:"Track what you owe friends"}</div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:14,color:T.txt2}}>{activeDebts.length>0?`Total owed: ${fmt(totalDebt)}`:"No active debts"}</div>
            <AddBtn T={T} color={T.red} onClick={()=>{setDebtForm(iDebt);setEditId(null);setModal("debt");}}>Add Debt</AddBtn>
          </div>
          {activeDebts.length===0
            ?<div style={{background:T.card,borderRadius:20,boxShadow:T.shadow,padding:"32px 20px",textAlign:"center",marginBottom:14}}>
              <div style={{marginBottom:10}}>{I.people(T.txt3,44)}</div>
              <div style={{fontWeight:600,fontSize:16,color:T.txt,marginBottom:6}}>No debts logged</div>
              <div style={{color:T.txt3,fontSize:14}}>Add a debt to track what you owe friends</div>
            </div>
            :<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
              {activeDebts.map(d=>{
                const pct=Math.min(d.paidBack/d.totalAmount*100,100),remaining=d.totalAmount-d.paidBack;
                const accName=accs.find(a=>a.id===d.receivedInAccount)?.name;
                return(
                  <div key={d.id} style={{background:T.card,borderRadius:20,boxShadow:T.shadow,padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{width:52,height:52,borderRadius:20,background:d.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:24,flexShrink:0}}>{d.personName[0]?.toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:17}}>{d.personName}</div>
                        <div style={{fontSize:12,color:T.txt2}}>Borrowed {fmt(d.totalAmount)} · {d.date}</div>
                        {accName&&<div style={{fontSize:12,color:T.txt3}}>→ {accName}</div>}
                        {d.description&&<div style={{fontSize:12,color:T.txt3}}>{d.description}</div>}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontWeight:700,fontSize:20,color:T.red}}>{fmt(remaining)}</div>
                        <div style={{fontSize:11,color:T.txt3}}>left to pay</div>
                      </div>
                    </div>
                    <div style={{height:7,background:T.border,borderRadius:99,marginBottom:5,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:99,background:d.color,width:`${pct}%`,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:12,color:T.txt3,marginBottom:12}}>{pct.toFixed(0)}% paid · {fmt(d.paidBack)} of {fmt(d.totalAmount)}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>openRepay(d)} style={{flex:1,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Log Repayment</button>
                      <button onClick={()=>doEditDebt(d)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{I.edit(T.acc)}</button>
                      <button onClick={()=>delDebt(d.id)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{I.trash(T.red)}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          }
          {settledDebts.length>0&&<>
            <div style={{fontSize:13,fontWeight:600,color:T.txt2,marginBottom:8}}>Fully Paid ✓</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              {settledDebts.map(d=>(
                <div key={d.id} style={{background:T.card,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,opacity:.55}}>
                  <div style={{width:40,height:40,borderRadius:12,background:d.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18,flexShrink:0}}>{d.personName[0]?.toUpperCase()}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:15}}>{d.personName}</div><div style={{fontSize:12,color:T.txt2}}>{fmt(d.totalAmount)} · paid back</div></div>
                  <button onClick={()=>delDebt(d.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>{I.trash(T.red)}</button>
                </div>
              ))}
            </div>
          </>}
        </>);
}
