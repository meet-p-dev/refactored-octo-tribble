"use client";

import { Sheet } from "@/components/Sheet";
import { Ring } from "@/components/Ring";
import { I, CatIcon } from "@/lib/icons";
import { cardStats, billHistory, utilTone, utilLabel } from "@/lib/credit";

const fmtDay=d=>{const[y,m,dd]=d.split("-").map(Number);return new Date(y,m-1,dd).toLocaleDateString("default",{day:"numeric",month:"short"});};

export function CardSheet({modal,closeM,T,dark,fmt,card,txs,getCat,accs,onPayBill,doEditAcc,haptic}){
  if(!card)return null;
  const s=cardStats(card,txs);
  const hist=billHistory(card,txs,12);
  const tone=utilTone(s.util,T);
  const payFrom=accs.find(a=>a.id===card.payFromId);

  // Category mix on this card — full amounts (the bank bills the whole charge, not your split share).
  const mix=(()=>{
    const m={};
    txs.filter(t=>t.accountId===card.id&&t.type==="expense").forEach(t=>{
      const c=t.category||"other";m[c]=(m[c]||0)+(parseFloat(t.amount)||0);
    });
    const list=Object.entries(m).sort(([,a],[,b])=>b-a).slice(0,5).map(([id,total])=>({id,total,...getCat(id)}));
    const top=list[0]?.total||1;
    return{list,top};
  })();

  const maxBill=Math.max(...hist.map(h=>h.charged),1);
  const stat=(label,value,color)=>(
    <div style={{flex:1,minWidth:0,background:T.cardH,borderRadius:12,padding:"11px 12px"}}>
      <div style={{fontSize:10.5,fontWeight:600,letterSpacing:.5,color:T.txt3,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontWeight:700,fontSize:16,marginTop:3,color:color||T.txt,fontVariantNumeric:"tabular-nums"}}>{value}</div>
    </div>
  );

  const dueTone=s.overdue?T.red:s.dueSoon?"#fb923c":T.txt2;
  const dueText=s.amountDue<=0
    ? (s.statementBalance>0?"Statement cleared — nothing due":"Nothing billed yet")
    : s.overdue?`Overdue by ${Math.abs(s.daysToDue)} day${Math.abs(s.daysToDue)===1?"":"s"}`
    : s.daysToDue===0?"Due today"
    : `Due in ${s.daysToDue} day${s.daysToDue===1?"":"s"} · ${fmtDay(s.due)}`;

  return(
    <Sheet open={modal==="card"} onClose={closeM} title={card.name} T={T}>
      {/* Hero — what you owe, and how much room is left */}
      <div style={{background:`linear-gradient(135deg,${card.color},${card.color}bb)`,borderRadius:20,padding:"16px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
        <Ring pct={s.util} size={78} stroke={8} color="#fff" track="rgba(255,255,255,.28)">
          <span style={{fontSize:17,fontWeight:700,color:"#fff",fontVariantNumeric:"tabular-nums"}}>{Math.round(s.util*100)}%</span>
          <span style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.8)",letterSpacing:.4}}>USED</span>
        </Ring>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:.8,color:"rgba(255,255,255,.75)",textTransform:"uppercase"}}>Current Balance</div>
          <div style={{fontSize:29,fontWeight:700,color:"#fff",letterSpacing:-.8,fontVariantNumeric:"tabular-nums",marginTop:1}}>{fmt(s.currentBalance)}</div>
          <div style={{fontSize:12.5,fontWeight:600,color:"rgba(255,255,255,.85)",marginTop:3}}>{fmt(Math.max(s.available,0))} available of {fmt(s.limit)}</div>
        </div>
      </div>

      {s.overLimit&&(
        <div style={{background:dark?"#2d0000":"#ffdede",border:`1px solid ${dark?"#5c1a1a":"#fca5a5"}`,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,fontWeight:600,color:dark?"#ff6b6b":"#b91c1c"}}>
          Over the limit by {fmt(s.currentBalance-s.limit)}
        </div>
      )}

      {/* The three numbers people actually confuse */}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {stat("Statement",fmt(s.amountDue),s.amountDue>0?T.red:T.green)}
        {stat("Unbilled",fmt(s.unbilled),T.txt)}
        {stat("Available",fmt(Math.max(s.available,0)),tone)}
      </div>
      <div style={{fontSize:12,color:T.txt2,lineHeight:1.5,marginBottom:14}}>
        Statement is what&apos;s owed from the bill that closed {fmtDay(s.close)}. Unbilled is what you&apos;ve charged since — it lands on the next bill, closing {fmtDay(s.nextClose)}.
      </div>

      {/* Due + pay */}
      <div style={{background:T.cardH,borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
        {I.clock(dueTone,18)}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:14,color:dueTone}}>{dueText}</div>
          <div style={{fontSize:12,color:T.txt2,marginTop:1}}>
            {card.autopay&&payFrom?`Auto-pay on from ${payFrom.name}`:payFrom?`Pays from ${payFrom.name}`:"Utilisation: "+utilLabel(s.util)}
          </div>
        </div>
      </div>

      {s.amountDue>0&&(
        <button onClick={()=>{haptic(12);onPayBill(card);}} style={{display:"block",width:"100%",background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:16,fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:14}}>
          Pay Bill · {fmt(s.amountDue)}
        </button>
      )}

      {/* Cycle burn */}
      <div style={{background:T.cardH,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:7}}>
          <span style={{fontWeight:600,fontSize:14}}>This cycle</span>
          <span style={{fontSize:12,color:T.txt2}}>day {s.cycleElapsed} of {s.cycleLen}</span>
        </div>
        <div style={{height:7,background:T.border,borderRadius:99,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${Math.min(s.cycleElapsed/s.cycleLen*100,100)}%`,height:"100%",background:T.acc,borderRadius:99,transition:"width .6s cubic-bezier(.22,1,.36,1)"}}/>
        </div>
        <div style={{fontSize:13,color:T.txt2,lineHeight:1.5}}>
          {s.unbilled>0
            ? <>You&apos;ve charged <b style={{color:T.txt}}>{fmt(s.unbilled)}</b> so far. At this pace the next bill lands around <b style={{color:T.txt}}>{fmt(s.projectedCycle)}</b>.</>
            : <>Nothing charged this cycle yet.</>}
        </div>
      </div>

      {/* Interest — only when there's an APR and a balance that could carry */}
      {s.interestEst>0&&(
        <div style={{background:dark?"#1a1000":"#fff8e6",border:`1px solid ${dark?"#5a3a00":"#fde68a"}`,borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          {I.flame(dark?"#fbbf24":"#d97706",18)}
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14,color:dark?"#fbbf24":"#92400e"}}>~{fmt(s.interestEst)} interest if you don&apos;t clear it</div>
            <div style={{fontSize:12,color:dark?"#d97706":"#a16207",marginTop:1}}>One month of {s.apr}% APR on {fmt(s.amountDue)}</div>
          </div>
        </div>
      )}

      {/* Bill history */}
      <div style={{background:T.cardH,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:11}}>Charged per bill · last 12</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:74}}>
          {hist.map((h,i)=>(
            <div key={h.close} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:0}}>
              <div title={fmt(h.charged)} style={{width:"100%",height:Math.max(h.charged/maxBill*54,2),background:i===hist.length-1?card.color:card.color+"66",borderRadius:4,transition:"height .6s cubic-bezier(.22,1,.36,1)"}}/>
              <span style={{fontSize:9,color:T.txt3}}>{h.label[0]}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:T.txt2,marginTop:9}}>
          Last closed bill: <b style={{color:T.txt}}>{fmt(hist[hist.length-1]?.charged||0)}</b>
        </div>
      </div>

      {/* What you put on this card */}
      {mix.list.length>0&&(
        <div style={{background:T.cardH,borderRadius:12,padding:"13px 14px",marginBottom:14}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:11}}>What you put on this card</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {mix.list.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{width:20,flexShrink:0,display:"flex",alignItems:"center"}}><CatIcon cat={c} size={15}/></span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:500}}>{c.label}</span>
                    <span style={{fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(c.total)}</span>
                  </div>
                  <div style={{height:5,background:T.border,borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${c.total/mix.top*100}%`,height:"100%",background:c.color,borderRadius:99}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={()=>doEditAcc(card)} style={{display:"block",width:"100%",background:"transparent",color:T.acc,border:`1.5px solid ${T.border}`,borderRadius:12,padding:14,fontWeight:600,fontSize:15,cursor:"pointer",marginBottom:4}}>
        Card Settings
      </button>
    </Sheet>
  );
}
