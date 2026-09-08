"use client";

import { I } from "@/lib/icons";
import { AddBtn } from "@/components/form";
import { isCredit, cardStats } from "@/lib/credit";

// V11: darken a #rrggbb by factor f (0..1) — used for the credit-card face gradient.
// Computed in JS (not CSS color-mix) so it works on every phone browser.
const shade=(hex,f)=>{
  const n=parseInt(hex.slice(1),16);
  if(isNaN(n))return hex;
  const ch=x=>Math.max(0,Math.round(x*(1-f)));
  return `rgb(${ch((n>>16)&255)},${ch((n>>8)&255)},${ch(n&255)})`;
};

export function AccountsPanel({
  T,fmt,totBal,assets,creditOwed,accs,txs,getBal,setAccForm,iAcc,setEditId,setModal,doEditAcc,delAcc,openCard,
  setFType,setSearch,setFCat,setFAcc,setTab,haptic,openBankSync,
}){
  const cards=accs.filter(isCredit);
  const cash=accs.filter(a=>!isCredit(a));
  const goActivity=id=>{haptic(8);setFType("");setSearch("");setFCat("");setFAcc(id);setTab("txs");};

  return(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontWeight:700,fontSize:20}}>Accounts</div>
              <div className="mt-num" style={{fontSize:13,color:T.txt2,marginTop:1}}>Net: {fmt(totBal)}</div>
              {creditOwed>0&&(
                <div className="mt-num" style={{fontSize:12,color:T.txt3,marginTop:2}}>
                  {fmt(assets)} cash − {fmt(creditOwed)} credit
                </div>
              )}
            </div>
            <AddBtn T={T} onClick={()=>{setAccForm(iAcc);setEditId(null);setModal("acc");}}>Add</AddBtn>
          </div>

          {/* A fresh install has no accounts at all (nothing is pre-invented for you), so
              this is the first thing the tab shows — and it has to answer "where do
              accounts come from?" with two real buttons, not a shrug. */}
          {accs.length===0&&(
            <div style={{background:T.card,borderRadius:20,padding:"26px 20px",textAlign:"center",boxShadow:T.shadow}}>
              <div style={{marginBottom:12,display:"flex",justifyContent:"center"}}>{I.wallet(T.txt3,34)}</div>
              <div style={{fontWeight:700,fontSize:17,marginBottom:5}}>No accounts yet</div>
              <div style={{fontSize:13.5,color:T.txt2,lineHeight:1.55,marginBottom:18}}>
                Connect a bank and your real accounts and transactions arrive on their own, updated 3× a day. Or add one by hand for cash and anything without a bank feed.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {openBankSync&&(
                  <button onClick={()=>{haptic(8);openBankSync();}} style={{background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontWeight:700,fontSize:14.5,cursor:"pointer"}}>Connect a bank</button>
                )}
                <button onClick={()=>{haptic(8);setAccForm(iAcc);setEditId(null);setModal("acc");}} style={{background:T.surf2,color:T.txt,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px",fontWeight:600,fontSize:14.5,cursor:"pointer"}}>Add an account manually</button>
              </div>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {cash.map(a=>{
              const bal=getBal(a.id),cnt=txs.filter(t=>t.accountId===a.id||t.toAccountId===a.id).length;
              return(
                <div key={a.id} onClick={()=>goActivity(a.id)} className="mt-tap" style={{background:T.card,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:T.shadow}}>
                  <div style={{width:50,height:50,borderRadius:14,background:`linear-gradient(180deg,${a.color},${shade(a.color,.22)})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:22,flexShrink:0}}>{a.name[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:16}}>{a.name}</div>
                    <div style={{fontSize:12,color:T.txt2,marginTop:2}}>{cnt} transaction{cnt===1?"":"s"} · initial {fmt(a.ib)}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="mt-num" style={{fontWeight:700,fontSize:18,color:bal>=0?T.green:T.red}}>{fmt(bal)}</div>
                    <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:5}}>
                      <button onClick={e=>{e.stopPropagation();doEditAcc(a);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                      <button onClick={e=>{e.stopPropagation();delAcc(a.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {cards.length>0&&(<>
            <div className="mt-label" style={{color:T.txt3,marginBottom:8}}>Credit cards</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:12}}>
              {cards.map(a=>{
                const s=cardStats(a,txs);
                const dueChip=s.amountDue>0
                  ? (s.overdue
                      ? {bg:"rgba(0,0,0,.30)",col:"#ffb4ad",txt:`Overdue · ${fmt(s.amountDue)}`}
                      : {bg:"rgba(0,0,0,.30)",col:"#ffe27a",txt:s.daysToDue===0?`Due today · ${fmt(s.amountDue)}`:`Due in ${s.daysToDue}d · ${fmt(s.amountDue)}`})
                  : {bg:"rgba(255,255,255,.16)",col:"rgba(255,255,255,.85)",txt:"No bill due"};
                const util=Math.min(Math.max(s.util,0),1);
                return(
                  <div key={a.id} onClick={()=>{haptic(8);openCard(a.id);}} className="mt-tap"
                    style={{position:"relative",borderRadius:20,padding:"16px 16px 14px",overflow:"hidden",color:"#fff",background:`linear-gradient(150deg,${a.color} 0%,${shade(a.color,.35)} 100%)`,boxShadow:`0 10px 28px ${a.color}40`}}>
                    {/* soft highlight, like light catching the card */}
                    <div style={{position:"absolute",top:-70,right:-50,width:200,height:200,borderRadius:99,background:"rgba(255,255,255,.09)",pointerEvents:"none"}}/>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:16,letterSpacing:.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div>
                        <div style={{fontSize:11,opacity:.75,marginTop:1}}>Credit card</div>
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();goActivity(a.id);}} aria-label="Transactions" style={{width:30,height:30,borderRadius:99,background:"rgba(255,255,255,.18)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.list("#fff",15)}</button>
                        <button onClick={e=>{e.stopPropagation();delAcc(a.id);}} aria-label="Delete card" style={{width:30,height:30,borderRadius:99,background:"rgba(255,255,255,.18)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.trash("#fff",14)}</button>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <div style={{fontSize:10.5,letterSpacing:1,opacity:.75,textTransform:"uppercase",fontWeight:600}}>Owed</div>
                        <div className="mt-num" style={{fontWeight:700,fontSize:26,letterSpacing:-.6,lineHeight:1.15}}>{fmt(s.currentBalance)}</div>
                      </div>
                      <div style={{background:dueChip.bg,color:dueChip.col,borderRadius:99,padding:"5px 11px",fontSize:11.5,fontWeight:650,whiteSpace:"nowrap"}} className="mt-num">{dueChip.txt}</div>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,.22)",borderRadius:99,overflow:"hidden",marginBottom:6}}>
                      <div style={{width:`${util*100}%`,height:"100%",background:"#fff",borderRadius:99,transition:"width .6s cubic-bezier(.22,1,.36,1)"}}/>
                    </div>
                    <div className="mt-num" style={{display:"flex",justifyContent:"space-between",fontSize:11.5,opacity:.85}}>
                      <span>{fmt(s.currentBalance)} of {fmt(s.limit)}</span>
                      <span style={{fontWeight:650}}>{fmt(Math.max(s.available,0))} left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>)}
        </>);
}
