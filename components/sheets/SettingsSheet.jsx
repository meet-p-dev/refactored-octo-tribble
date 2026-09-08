"use client";

import { DEFACCS, CURRENCIES } from "@/lib/constants";
import { LS, MT_VERSION } from "@/lib/utils";
import { I } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { Toggle } from "@/components/Toggle";

export function SettingsSheet({
  modal,closeM,T,dark,fileRef,doImport,doExport,exportCSV,setTab,setAnaView,setModal,sbUser,
  curId,pin,setPinFlow,notifOn,setNotif,
  txs,accs,goals,debts,recurring,sa,st,sg,sr,sd,sb,setOnbDone,showToast,
}){
  const cur=CURRENCIES.find(c=>c.id===curId)||CURRENCIES[0];
  const curExample=new Intl.NumberFormat(cur.loc,{style:"currency",currency:cur.cur}).format(1234.56);
  return(
      <Sheet open={modal==="settings"} onClose={closeM} title="Settings & Data" T={T}>
        <input type="file" ref={fileRef} accept=".json" style={{display:"none"}} onChange={doImport}/>
        <div style={{marginBottom:10}}><Label text="Bank Sync"/></div>
        <button onClick={()=>setModal("banksync")} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left",marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.wallet(T.acc)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:15,color:T.txt}}>Connect a bank</div>
            <div style={{fontSize:12,color:T.txt2,marginTop:1}}>{sbUser?"Signed in · auto-syncs 3×/day":"Sign in to auto-import transactions"}</div>
          </div>
          <div style={{width:9,height:9,borderRadius:99,background:sbUser?T.green:T.txt3,flexShrink:0}}/>
        </button>
        <div style={{marginBottom:10}}><Label text="Data Backup"/></div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          <button onClick={doExport} style={{display:"flex",alignItems:"center",gap:12,background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.download(T.acc)}</div>
            <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Export backup</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Download all data as JSON</div></div>
          </button>
          <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:12,background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:12,background:T.green+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.upload(T.green)}</div>
            <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Restore backup</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Import a JSON backup file</div></div>
          </button>
          <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:12,background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:12,background:T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.download(T.txt2)}</div>
            <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Export CSV</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Last 200 transactions</div></div>
          </button>
        </div>
        {/* Accounts and Categories both live in the Wallet tab now. */}
        <div style={{marginBottom:10}}><Label text="Budgets"/></div>
        <button onClick={()=>{setTab("stats");setAnaView("budget");closeM();}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left",marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.budget(T.acc,20)}</div>
          <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Monthly Budgets</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Set limits per category</div></div>
        </button>
        <div style={{marginBottom:10}}><Label text="Currency & Region"/></div>
        <button onClick={()=>setModal("currency")} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left",marginBottom:20}}>
          <span style={{fontSize:26,flexShrink:0}}>{cur.flag}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:15,color:T.txt}}>{cur.country} · {cur.cur}</div>
            <div style={{fontSize:12,color:T.txt2,marginTop:1,fontVariantNumeric:"tabular-nums"}}>{curExample}</div>
          </div>
          <span style={{flexShrink:0,display:"flex",alignItems:"center",transform:"rotate(180deg)"}}>{I.back2(T.txt3)}</span>
        </button>
        <div style={{marginBottom:10}}><Label text="Preferences"/></div>
        <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>{I.lock(T.acc,20)}<div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>App Lock</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>{pin?"Enabled":"4-digit passcode"}</div></div></div>
            <Toggle value={!!pin} onChange={v=>{v?setPinFlow("set"):setPinFlow("disable");}} T={T}/>
          </div>
          <div style={{height:1,background:T.border}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>{I.bell(T.acc,20)}<div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Notifications</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Ping me when the bank syncs new transactions</div></div></div>
            <Toggle value={notifOn} onChange={setNotif} T={T}/>
          </div>
        </div>
        <div style={{marginBottom:10}}><Label text="Stats"/></div>
        <div style={{background:T.bg,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {[["Transactions",txs.length],["Accounts",accs.length],["Goals",goals.length],["Debts",debts.length]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:14,color:T.txt2}}>{l}</span>
              <span style={{fontSize:14,fontWeight:600,color:T.txt}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 16px",background:dark?"#2d0000":"#ffdede",borderRadius:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:14,color:dark?"#ff453a":"#c0392b",marginBottom:4}}>{I.alert(dark?"#ff453a":"#c0392b",15)} Danger zone</div>
          <div style={{fontSize:12,color:dark?"#ff6b6b":"#7f1d1d",marginBottom:10}}>Permanently deletes all your data.</div>
          <button onClick={()=>{if(confirm("Delete ALL data?")){sa(DEFACCS);st([]);sg([]);sr([]);sd([]);sb({});LS.s("mt-onboarded",null);setOnbDone(false);closeM();showToast("Starting fresh…",false);}}} style={{background:dark?"#ff453a":"#c0392b",color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Clear all data</button>
        </div>
        <div style={{textAlign:"center",fontSize:12,color:T.txt3,marginTop:14}}>MoneyTrack {MT_VERSION}</div>
        <div style={{height:16}}/>
      </Sheet>
  );
}
