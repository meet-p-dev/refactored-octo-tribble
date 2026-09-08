"use client";

import { useState } from "react";
import { LS, personalAmt } from "@/lib/utils";
import { I, CatIcon, GoalIcon } from "@/lib/icons";
import { Monogram } from "@/components/Monogram";
import { MiniChart } from "@/components/MiniChart";
import { BalanceChart } from "@/components/BalanceChart";
import { AnimatedNumber } from "@/components/AnimatedNumber";

// V11 "Today" Home: one prioritized attention card instead of a stack of shouting
// banners — the single most important thing sits on top, the rest collapse behind
// an "N more" toggle. Priority: overdue bill > review queue > upcoming bill >
// over-budget > open debts (debt entry keeps its persisted dismiss).
export function HomeTab({
  T,dark,fmt,totBal,accs,mSt,netPos,net,mLbl,
  activeDebts,debtBannerSeen,setDebtBannerSeen,totalDebt,
  safeToday,daysLeft,totalBudget,totalBudgetSpent,overBudget,
  insights,chartD,recTxs,getCat,goals,catD,mxCat,
  assets,creditOwed,dueCards,openCard,
  reviewCount,openReview,
  balSeries,sbUser,openBankSync,
  setTab,setPeopleView,setAnaView,setDrillCat,goTxs,doEditTx,haptic,
}){
  const [moreAlerts,setMoreAlerts]=useState(false);
  const dueTotal=(dueCards||[]).reduce((s,c)=>s+c.amountDue,0);
  const overdueCards=(dueCards||[]).filter(c=>c.overdue);
  const upcomingCards=(dueCards||[]).filter(c=>!c.overdue);

  // ── the attention stack ──
  const alerts=[];
  // A brand-new install owns nothing, so the single most important thing on screen is
  // "here is where accounts come from". Sits first because it outranks every other
  // alert — none of them can even fire without an account.
  if(accs.length===0)alerts.push({
    k:"noaccs",tone:T.acc,icon:I.wallet,
    title:"Add your first account",
    sub:"Connect a bank for real transactions, or add one by hand",
    cta:"Set up",onTap:()=>{haptic(8);setTab("accs");},
  });
  if(overdueCards.length>0)alerts.push({
    k:"overdue",tone:T.red,icon:I.card,
    title:`Card bill overdue · ${fmt(overdueCards.reduce((s,c)=>s+c.amountDue,0))}`,
    sub:overdueCards.length===1?`${overdueCards[0].card.name} · ${Math.abs(overdueCards[0].daysToDue)}d late — tap to pay`:`${overdueCards.length} cards late — tap to pay`,
    cta:"Pay",onTap:()=>openCard(overdueCards[0].card.id),
  });
  if(reviewCount>0)alerts.push({
    k:"review",tone:T.acc,icon:I.bell,
    title:`${reviewCount} transaction${reviewCount>1?"s":""} to review`,
    sub:"Confirm which incoming money is really income",
    cta:"Review",onTap:openReview,
  });
  if(upcomingCards.length>0)alerts.push({
    k:"due",tone:T.amber,icon:I.card,
    title:`Card bill due · ${fmt(upcomingCards.reduce((s,c)=>s+c.amountDue,0))}`,
    sub:upcomingCards.length===1?`${upcomingCards[0].card.name} · ${upcomingCards[0].daysToDue===0?"due today":`in ${upcomingCards[0].daysToDue} day${upcomingCards[0].daysToDue===1?"":"s"}`}`:`${upcomingCards.length} cards — tap to pay`,
    cta:"Pay",onTap:()=>openCard(upcomingCards[0].card.id),
  });
  if(overBudget.length>0)alerts.push({
    k:"budget",tone:T.red,icon:I.budget,
    title:`${overBudget.length} budget${overBudget.length>1?"s":""} over limit`,
    sub:overBudget.map(b=>b.label).join(", "),
    cta:"View",onTap:()=>{setTab("stats");setAnaView("budget");},
  });
  if(activeDebts.length>0&&!debtBannerSeen)alerts.push({
    k:"debt",tone:T.red,icon:I.wallet,
    title:`You owe ${fmt(totalDebt)}`,
    sub:activeDebts.length===1?`to ${activeDebts[0].personName} · tap to manage`:`to ${activeDebts.length} friends · tap to manage`,
    cta:"View",onTap:()=>{setDebtBannerSeen(true);LS.s("mt-debt-banner",true);setTab("splits");setPeopleView("debts");},
  });
  const primary=alerts[0],rest=alerts.slice(1);

  const balDelta=balSeries&&balSeries.length>1?balSeries[balSeries.length-1].v-balSeries[0].v:0;

  const AlertRow=({a,big})=>(
    <div onClick={()=>{haptic(8);a.onTap();}} className="mt-press"
      style={{background:a.tone+(dark?"1f":"14"),border:`1px solid ${a.tone}42`,borderRadius:big?20:14,padding:big?"13px 16px":"10px 14px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
      <div style={{width:big?36:30,height:big?36:30,borderRadius:99,background:a.tone+"2b",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{a.icon(a.tone,big?18:15)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:650,fontSize:big?14.5:13.5,color:T.txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
        <div style={{fontSize:big?12:11.5,color:T.txt2,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.sub}</div>
      </div>
      <span style={{color:a.tone,fontSize:big?13.5:12.5,fontWeight:650,flexShrink:0}}>{a.cta} →</span>
    </div>
  );

  return(<>
          {/* ── Hero ── */}
          <div style={{textAlign:"center",padding:"10px 0 18px"}}>
            <div onClick={()=>{haptic(8);setTab("accs");}} className="mt-tap" style={{display:"inline-block"}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:1.1,color:T.txt3,textTransform:"uppercase"}}>Total Balance</div>
              <AnimatedNumber value={totBal} format={fmt} className="mt-hero" style={{display:"block",marginTop:2}}/>
              <div style={{fontSize:12,fontWeight:600,color:T.acc,marginTop:3}}>{accs.length} account{accs.length===1?"":"s"} ›</div>
              {creditOwed>0&&(
                <div className="mt-num" style={{fontSize:11.5,color:T.txt3,marginTop:3}}>
                  {fmt(assets)} cash − {fmt(creditOwed)} credit
                </div>
              )}
            </div>
            {/* Own row. The block above is an inline-block, so an inline-flex pill here used
                to sit on the SAME line and collide with the "x cash − y credit" subline
                (marginTop can't push an inline element onto a new line). */}
            {sbUser&&(
              <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
                <div onClick={()=>{haptic(8);openBankSync();}} className="mt-tap" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:T.card,border:`1px solid ${T.border}`,fontSize:11.5,color:T.txt2,fontWeight:600}}>
                  <span style={{width:6,height:6,borderRadius:99,background:T.green,display:"inline-block"}}/>
                  Bank sync on · 3×/day
                </div>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:14}}>
              <div onClick={()=>goTxs("income")} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>INCOME</div>
                <div className="mt-num" style={{fontSize:14,fontWeight:700,color:T.green,marginTop:1}}>+{fmt(mSt.inc)}</div>
              </div>
              <div onClick={()=>goTxs("expense")} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>SPENT</div>
                <div className="mt-num" style={{fontSize:14,fontWeight:700,color:T.txt,marginTop:1}}>−{fmt(mSt.spt)}</div>
              </div>
              <div onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");}} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>NET · {mLbl.slice(0,3).toUpperCase()}</div>
                <div className="mt-num" style={{fontSize:14,fontWeight:700,color:netPos?T.green:T.red,marginTop:1}}>{(netPos?"+":"")+fmt(net)}</div>
              </div>
            </div>
          </div>

          {/* ── Attention card: the ONE most important thing + collapsed rest ── */}
          {primary&&(
            <div style={{marginBottom:14}}>
              <AlertRow a={primary} big/>
              {rest.length>0&&(
                <div style={{marginTop:8}}>
                  {!moreAlerts?(
                    <button onClick={()=>{haptic(6);setMoreAlerts(true);}} style={{display:"block",margin:"0 auto",background:T.card,border:`1px solid ${T.border}`,borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:600,color:T.txt2,cursor:"pointer"}}>
                      +{rest.length} more
                    </button>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {rest.map(a=><AlertRow key={a.k} a={a}/>)}
                      <button onClick={()=>setMoreAlerts(false)} style={{display:"block",margin:"0 auto",background:"none",border:"none",padding:"2px 8px",fontSize:12,fontWeight:600,color:T.txt3,cursor:"pointer"}}>Show less</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Balance over time ── */}
          {balSeries&&balSeries.length>1&&(
            <div style={{background:T.card,borderRadius:20,padding:"14px 14px 8px",marginBottom:12,boxShadow:T.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6,padding:"0 2px"}}>
                <span style={{fontSize:11,fontWeight:600,letterSpacing:1.1,color:T.txt3,textTransform:"uppercase"}}>Balance · 60 days</span>
                <span className="mt-num" style={{fontSize:12.5,fontWeight:700,color:balDelta>=0?T.green:T.red}}>{balDelta>=0?"+":""}{fmt(balDelta)}</span>
              </div>
              <BalanceChart series={balSeries} T={T}/>
            </div>
          )}

          {/* ── Safe / Budget row ── */}
          <div style={{display:"flex",background:T.card,borderRadius:20,marginBottom:12,overflow:"hidden",boxShadow:T.shadow}}>
            <div onClick={()=>{haptic(8);setTab("stats");setAnaView("budget");}} className="mt-tap" style={{flex:1,padding:"13px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>{I.flame(T.acc,14)}<span style={{fontSize:11,fontWeight:600,color:T.txt2}}>Safe / day</span></div>
              <AnimatedNumber value={safeToday} format={fmt} style={{fontSize:18,fontWeight:700,letterSpacing:-.4,color:safeToday>0?T.txt:T.txt3,fontVariantNumeric:"tabular-nums"}}/>
              <span style={{fontSize:10,color:T.txt3}}> · {daysLeft} d left</span>
            </div>
            <div style={{width:1,background:T.border,margin:"12px 0",flexShrink:0}}/>
            <div onClick={()=>{haptic(8);setTab("stats");setAnaView("budget");}} className="mt-tap" style={{flex:1,padding:"13px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>{I.budget(T.acc,14)}<span style={{fontSize:11,fontWeight:600,color:T.txt2}}>Budget left</span></div>
              {totalBudget>0?<>
                <AnimatedNumber value={Math.max(totalBudget-totalBudgetSpent,0)} format={fmt} style={{fontSize:18,fontWeight:700,letterSpacing:-.4,color:totalBudgetSpent>totalBudget?T.red:T.txt,fontVariantNumeric:"tabular-nums"}}/>
                <div style={{height:3,background:T.border,borderRadius:99,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,width:Math.min(totalBudgetSpent/totalBudget*100,100)+"%",background:totalBudgetSpent>totalBudget?T.red:T.green,transition:"width .6s"}}/></div>
              </>:<><div style={{fontSize:14,fontWeight:700,color:T.acc}}>Set up →</div><div style={{fontSize:10,color:T.txt3,marginTop:3}}>Track monthly limits</div></>}
            </div>
          </div>

          {insights.length>0&&(
            <div style={{marginBottom:12}}>
              <span className="mt-label" style={{color:T.txt3}}>Insights</span>
              <div className="mt-hscroll">
                {insights.map((ins,i)=>{
                  const tones={green:[T.green,dark?"#0c2a16":"#e7f9ee"],red:[T.red,dark?"#2d0000":"#ffe5e3"],blue:[T.acc,dark?"#001533":"#e7f0ff"]};
                  const [cc,bg]=tones[ins.tone]||tones.blue;
                  return(
                    <div key={i} onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:9,background:T.card,borderRadius:12,padding:"10px 13px",maxWidth:210,boxShadow:T.shadow}}>
                      <div style={{width:30,height:30,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ins.icon(cc,15)}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:10,color:T.txt3,whiteSpace:"nowrap"}}>{ins.label}</div>
                        <div style={{fontSize:14,fontWeight:700,color:cc,letterSpacing:-.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ins.value} <span style={{fontSize:10,fontWeight:400,color:T.txt3}}>{ins.sub}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="mt-label" style={{color:T.txt3}}>Income vs expenses</span>
            <div style={{background:T.card,borderRadius:20,padding:"14px 14px 10px",marginBottom:12,boxShadow:T.shadow}}>
              <MiniChart data={chartD} T={T} fmt={fmt}/>
            </div>
          </div>

          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span className="mt-label" style={{color:T.txt3}}>Recent</span>
              <button onClick={()=>goTxs("")} style={{background:"none",border:"none",color:T.acc,fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>See all</button>
            </div>
            <div style={{background:T.card,borderRadius:20,marginBottom:12,overflow:"hidden",boxShadow:T.shadow}}>
              {recTxs.length===0?<div style={{padding:"14px 16px",color:T.txt3,fontSize:14}}>No transactions yet</div>
              :recTxs.map((t,i)=>{
                const c=getCat(t.category),a=accs.find(x=>x.id===t.accountId);
                const disp=personalAmt(t);
                return(
                  <div key={t.id} onClick={()=>{haptic(8);doEditTx(t);}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:11,padding:"10px 15px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                    <Monogram name={t.merchant} cat={c} size={38} T={T}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant||"Unknown"}</div>
                        {t.isSplit&&<span style={{fontSize:10,fontWeight:600,background:dark?"#002e14":"#d4f5df",color:dark?"#30d158":"#16a34a",borderRadius:6,padding:"1px 5px",flexShrink:0}}>split</span>}
                      </div>
                      <div style={{fontSize:11,color:T.txt2}}>{a?.name||"?"} · {t.date}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div className="mt-num" style={{fontWeight:700,fontSize:14,color:t.type==="income"?T.green:t.type==="expense"?T.red:t.type==="credit"||t.type==="debit"?T.recv:T.txt2}}>
                        {t.type==="income"||t.type==="credit"?"+":t.type==="expense"||t.type==="debit"?"−":"⇄"}{fmt(disp)}
                      </div>
                      {t.isSplit&&<div style={{fontSize:10,color:T.txt3}}>of {fmt(t.amount)}</div>}
                      {t._shareAmt!=null&&<div style={{fontSize:10,color:T.txt3}}>your share · of {fmt(t.amount)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {goals.length>0&&(
            <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span className="mt-label" style={{color:T.txt3}}>Savings goals</span>
              <button onClick={()=>{haptic(8);setTab("goals");}} style={{background:"none",border:"none",color:T.acc,fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>See all</button>
            </div>
            <div onClick={()=>{haptic(8);setTab("goals");}} className="mt-tap" style={{background:T.card,borderRadius:20,padding:"13px 15px 4px",marginBottom:12,boxShadow:T.shadow}}>
              {goals.slice(0,2).map(g=>{
                const pct=Math.min(g.savedAmount/g.targetAmount*100,100);
                return(
                  <div key={g.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:5}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:6}}><GoalIcon goal={g} size={15}/> {g.name}</span>
                      <span className="mt-num" style={{fontWeight:600}}>{fmt(g.savedAmount)} <span style={{color:T.txt3,fontWeight:400}}>/ {fmt(g.targetAmount)}</span></span>
                    </div>
                    <div style={{height:6,background:T.border,borderRadius:99}}><div style={{height:"100%",borderRadius:99,background:g.color||T.acc,width:`${pct}%`,transition:"width .4s"}}/></div>
                    <div style={{fontSize:11,color:T.txt3,marginTop:3}}>{pct.toFixed(0)}% · {fmt(g.targetAmount-g.savedAmount)} to go</div>
                  </div>
                );
              })}
            </div>
            </div>
          )}

          <div style={{marginBottom:12}}>
            <span className="mt-label" style={{color:T.txt3}}>Top categories</span>
            <div style={{background:T.card,borderRadius:20,padding:"13px 15px 4px",boxShadow:T.shadow}}>
              {catD.length===0?<div style={{color:T.txt3,fontSize:14,paddingBottom:10}}>No spending yet</div>
              :catD.slice(0,5).map(c=>(
                <div key={c.id} onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");setDrillCat(c.id);}} className="mt-tap" style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                    <span style={{color:T.txt2,display:"inline-flex",alignItems:"center",gap:6}}><CatIcon cat={c} size={13} color={c.color}/> {c.label}</span>
                    <span className="mt-num" style={{fontWeight:600}}>{fmt(c.total)}</span>
                  </div>
                  <div style={{height:4,background:T.border,borderRadius:99}}><div style={{height:"100%",borderRadius:99,background:c.color,width:`${(c.total/mxCat)*100}%`,transition:"width .4s"}}/></div>
                </div>
              ))}
            </div>
          </div>
        </>);
}
