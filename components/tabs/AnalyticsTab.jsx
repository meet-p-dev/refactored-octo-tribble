"use client";

import { mtSym, tod } from "@/lib/utils";
import { I, CatIcon } from "@/lib/icons";
import { AmountInput } from "@/components/form";
import { Ring } from "@/components/Ring";
import { SubNav } from "@/components/SubNav";

export function AnalyticsTab({
  T,dark,fmt,anaView,setAnaView,drillCat,setDrillCat,catD,txs,setSearch,setFCat,setTab,mxCat,
  spendMonth,setSpendMonth,spendMonths,spendTotal,
  totalBudget,totalBudgetSpent,cats,budgets,monthCatSpent,setBudget,
  calMonth,setCalMonth,calData,creditSplit,haptic,
}){
  const curMonth=tod().slice(0,7);
  const lastMonthKey=(()=>{const [y,m]=curMonth.split("-").map(Number);const d=new Date(y,m-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;})();
  const monthLabel=k=>k==="all"?"All time":k===curMonth?"This month":k===lastMonthKey?"Last month":(()=>{const [y,m]=k.split("-").map(Number);return new Date(y,m-1,1).toLocaleString("default",{month:"short",year:"2-digit"});})();
  const monthOpts=["all",...(spendMonths||[])];
  return(<>
          <div style={{fontWeight:700,fontSize:20,marginBottom:14}}>Insights</div>
          <SubNav view={anaView} setView={v=>{setAnaView(v);setDrillCat(null);}} items={[["spend","Spending"],["budget","Budgets"],["cal","Calendar"]]} T={T} haptic={haptic}/>

          {/* Bug 5: scope the spending breakdown by month (This month / Last month / older / All time) */}
          {anaView==="spend"&&(
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
                {monthOpts.map(k=>{
                  const on=spendMonth===k;
                  return(
                    <button key={k} onClick={()=>{setSpendMonth(k);setDrillCat(null);haptic&&haptic(8);}}
                      style={{flexShrink:0,background:on?T.acc:T.card,color:on?"#fff":T.txt2,border:`1.5px solid ${on?T.acc:T.border}`,borderRadius:99,padding:"7px 14px",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {monthLabel(k)}
                    </button>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:12}}>
                <span style={{fontSize:13,color:T.txt2}}>{spendMonth==="all"?"Total spent":`Spent · ${monthLabel(spendMonth)}`}</span>
                <span style={{fontWeight:700,fontSize:18,fontVariantNumeric:"tabular-nums"}}>{fmt(spendTotal||0)}</span>
              </div>
            </div>
          )}

          {/* How much of this month's spending was funded by credit rather than money you have */}
          {anaView==="spend"&&!drillCat&&(spendMonth==="all"||spendMonth===curMonth)&&creditSplit&&creditSplit.credit>0&&(
            <div style={{background:T.card,borderRadius:20,padding:"15px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
                <span style={{fontWeight:600,fontSize:15}}>Cash vs credit</span>
                <span style={{fontSize:12,color:T.txt2}}>this month</span>
              </div>
              <div style={{display:"flex",height:10,borderRadius:99,overflow:"hidden",background:T.border,marginBottom:10}}>
                <div style={{width:`${creditSplit.cashPct*100}%`,background:T.green,transition:"width .6s cubic-bezier(.22,1,.36,1)"}}/>
                <div style={{width:`${creditSplit.creditPct*100}%`,background:"#fb923c",transition:"width .6s cubic-bezier(.22,1,.36,1)"}}/>
              </div>
              <div style={{display:"flex",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:8,height:8,borderRadius:99,background:T.green,flexShrink:0}}/>
                    <span style={{fontSize:12,color:T.txt2}}>Cash</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:16,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmt(creditSplit.cash)}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:8,height:8,borderRadius:99,background:"#fb923c",flexShrink:0}}/>
                    <span style={{fontSize:12,color:T.txt2}}>Credit</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:16,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmt(creditSplit.credit)}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:T.txt2,marginTop:10,lineHeight:1.5}}>
                {Math.round(creditSplit.creditPct*100)}% of what you spent this month was put on a card — money you still owe.
              </div>
            </div>
          )}

          {anaView==="spend"&&(drillCat?(()=>{
            const c=catD.find(x=>x.id===drillCat);if(!c)return null;
            return(<>
              <button onClick={()=>setDrillCat(null)} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",color:T.acc,fontSize:15,cursor:"pointer",marginBottom:12,fontWeight:500,padding:0}}>{I.back(T.acc)} Categories</button>
              <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:52,height:52,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CatIcon cat={c} size={24}/></div>
                <div><div style={{fontWeight:700,fontSize:17}}>{c.label}</div><div style={{fontSize:13,color:T.txt2}}>{fmt(c.total)} personal · {Object.keys(c.merchants).length} merchants</div></div>
              </div>
              <div style={{background:T.card,borderRadius:20,overflow:"hidden",marginBottom:12}}>
                {Object.entries(c.merchants).sort(([,a],[,b])=>b-a).map(([m,tot],i)=>{
                  const cnt=txs.filter(t=>t.merchant===m&&t.category===drillCat&&(spendMonth==="all"||t.date.startsWith(spendMonth))).length;
                  return(
                    <div key={m} onClick={()=>{setSearch(m);setFCat("");setTab("txs");setDrillCat(null);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderTop:i>0?`1px solid ${T.border}`:"none",cursor:"pointer"}} onTouchStart={e=>e.currentTarget.style.background=T.cardH} onTouchEnd={e=>e.currentTarget.style.background="transparent"}>
                      <div><div style={{fontWeight:600,fontSize:15}}>{m}</div><div style={{fontSize:12,color:T.txt2}}>{cnt} transactions</div></div>
                      <span style={{fontWeight:700,color:T.red,fontSize:16}}>{fmt(tot)}</span>
                    </div>
                  );
                })}
              </div>
            </>);
          })():(
            catD.length===0?<div style={{color:T.txt3,fontSize:14}}>No spending data yet.</div>
            :<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {catD.map(c=>(
                <div key={c.id} onClick={()=>setDrillCat(c.id)} style={{background:T.card,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",gap:13,cursor:"pointer"}} onTouchStart={e=>e.currentTarget.style.background=T.cardH} onTouchEnd={e=>e.currentTarget.style.background=T.card}>
                  <div style={{width:48,height:48,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CatIcon cat={c} size={22}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontWeight:600,fontSize:15}}>{c.label}</span>
                      <span style={{fontWeight:700,fontSize:15}}>{fmt(c.total)}</span>
                    </div>
                    <div style={{height:5,background:T.border,borderRadius:99}}><div style={{height:"100%",borderRadius:99,background:c.color,width:`${(c.total/mxCat)*100}%`}}/></div>
                    <div style={{fontSize:12,color:T.txt3,marginTop:4}}>tap to explore</div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {anaView==="budget"&&<>
            <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
              <Ring pct={totalBudget>0?totalBudgetSpent/totalBudget:0} size={78} stroke={8} color={totalBudgetSpent>totalBudget?T.red:T.acc} track={T.border}>
                <span style={{fontSize:15,fontWeight:700,color:T.txt}}>{totalBudget>0?Math.round(totalBudgetSpent/totalBudget*100)+"%":"—"}</span>
              </Ring>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:T.txt2,fontWeight:500}}>Spent this month</div>
                <div style={{fontSize:22,fontWeight:700}}>{fmt(totalBudgetSpent)}</div>
                <div style={{fontSize:13,color:T.txt3,marginTop:2}}>{totalBudget>0?`of ${fmt(totalBudget)} · ${fmt(Math.max(totalBudget-totalBudgetSpent,0))} left`:"No budgets set yet"}</div>
              </div>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:T.txt2,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Monthly limit per category</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {cats.map(c=>{
                const limit=parseFloat(budgets[c.id])||0,spent=monthCatSpent[c.id]||0,pct=limit>0?spent/limit:0,over=limit>0&&spent>limit;
                return(
                  <div key={c.id} style={{background:T.card,borderRadius:20,padding:"13px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CatIcon cat={c} size={18}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:15}}>{c.label}</div>
                        <div style={{fontSize:12,color:over?T.red:T.txt2,marginTop:1}}>{limit>0?`${fmt(spent)} of ${fmt(limit)}${over?" · over!":""}`:`${fmt(spent)} spent`}</div>
                      </div>
                      <div style={{position:"relative",width:96,flexShrink:0}}>
                        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.txt3,fontSize:14,pointerEvents:"none"}}>{mtSym()}</span>
                        <AmountInput placeholder="—" value={limit?String(limit):""} onChange={v=>setBudget(c.id,v)} style={{width:"100%",background:T.bg,color:T.txt,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"9px 10px 9px 22px",fontSize:15,textAlign:"right"}}/>
                      </div>
                    </div>
                    {limit>0&&<div style={{height:6,background:T.border,borderRadius:99,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,width:Math.min(pct*100,100)+"%",background:over?T.red:pct>.85?"#ff9f0a":c.color,transition:"width .5s"}}/></div>}
                  </div>
                );
              })}
            </div>
          </>}

          {anaView==="cal"&&(()=>{
            const [yy,mm]=calMonth.split("-").map(Number);
            const first=new Date(yy,mm-1,1),startDow=(first.getDay()+6)%7,dim=new Date(yy,mm,0).getDate();
            const vals=Object.values(calData),maxDay=Math.max(...vals,1),monthTotal=vals.reduce((s,v)=>s+v,0);
            const activeDays=vals.filter(v=>v>0).length,busiest=Object.entries(calData).sort((a,b)=>b[1]-a[1])[0];
            const curKey=tod().slice(0,7);
            const shift=delta=>{const d=new Date(yy,mm-1+delta,1);const nk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;if(nk<=curKey)setCalMonth(nk);};
            const cells=[];for(let i=0;i<startDow;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);
            const atMax=calMonth>=curKey;
            return(<>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <button onClick={()=>shift(-1)} className="mt-press" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.back(T.acc)}</button>
                <div style={{fontWeight:700,fontSize:16}}>{first.toLocaleString("default",{month:"long",year:"numeric"})}</div>
                <button onClick={()=>shift(1)} disabled={atMax} className="mt-press" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:atMax?"default":"pointer",opacity:atMax?.4:1}}>{I.back2(T.acc)}</button>
              </div>
              <div style={{background:T.card,borderRadius:20,padding:"14px",marginBottom:14}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:7}}>
                  {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:11,fontWeight:600,color:T.txt3}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
                  {cells.map((d,i)=>{
                    if(d===null)return <div key={i}/>;
                    const key=`${calMonth}-${String(d).padStart(2,"0")}`,sp=calData[key]||0,a=sp>0?0.2+0.8*(sp/maxDay):0,isToday=key===tod();
                    return(<div key={i} style={{aspectRatio:"1",borderRadius:9,background:sp>0?`rgba(255,69,58,${a})`:T.bg,display:"flex",alignItems:"center",justifyContent:"center",border:isToday?`2px solid ${T.acc}`:"none"}}><span style={{fontSize:12,fontWeight:600,color:a>0.5?"#fff":T.txt2}}>{d}</span></div>);
                  })}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:12}}>
                  <span style={{fontSize:10,color:T.txt3}}>Less</span>
                  {[0.2,0.45,0.7,1].map(a=><div key={a} style={{width:12,height:12,borderRadius:4,background:`rgba(255,69,58,${a})`}}/>)}
                  <span style={{fontSize:10,color:T.txt3}}>More</span>
                </div>
              </div>
              <div style={{display:"flex",gap:11,marginBottom:14}}>
                <div style={{flex:1,background:T.card,borderRadius:20,padding:"14px"}}><div style={{fontSize:12,color:T.txt2,fontWeight:600}}>Month total</div><div style={{fontSize:20,fontWeight:700,color:T.red,marginTop:3}}>{fmt(monthTotal)}</div></div>
                <div style={{flex:1,background:T.card,borderRadius:20,padding:"14px"}}><div style={{fontSize:12,color:T.txt2,fontWeight:600}}>Active days</div><div style={{fontSize:20,fontWeight:700,marginTop:3}}>{activeDays}<span style={{fontSize:13,color:T.txt3}}> / {dim}</span></div></div>
              </div>
              {busiest&&busiest[1]>0&&<div style={{background:T.card,borderRadius:20,padding:"14px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,color:T.txt2,fontWeight:600}}>Busiest day</div><div style={{fontSize:15,fontWeight:600,marginTop:2}}>{busiest[0]}</div></div><div style={{fontSize:18,fontWeight:700,color:T.red}}>{fmt(busiest[1])}</div></div>}
            </>);
          })()}
        </>);
}
