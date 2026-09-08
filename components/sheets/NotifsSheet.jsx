"use client";

import { I } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";

export function NotifsSheet({modal,closeM,T,notifs,sdn,setTab,setAnaView,setPeopleView,openCard}){
  return(
      <Sheet open={modal==="notifs"} onClose={closeM} title="Notifications" T={T}>
        {notifs.length===0
          ?<div style={{textAlign:"center",padding:"30px 0 40px",color:T.txt3}}><div style={{marginBottom:8}}>{I.bell(T.txt3,42)}</div><div style={{fontWeight:600,fontSize:15,color:T.txt2}}>All caught up</div></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:12}}>
            {notifs.map(n=>{
              const cc=({blue:T.acc,red:T.red,green:T.green})[n.tone]||T.acc;
              return(
                <button key={n.k} onClick={()=>{
                    sdn(prev=>[...prev,n.k]);
                    // Card notifs open the card sheet instead of switching tab — they carry no n.tab.
                    if(n.card){openCard(n.card);return;}
                    if(n.tab)setTab(n.tab);
                    if(n.ana)setAnaView(n.ana);if(n.pv)setPeopleView(n.pv);closeM();
                  }} className="mt-press"
                  style={{display:"flex",alignItems:"center",gap:12,background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{width:38,height:38,borderRadius:12,background:cc+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{typeof n.icon==="function"?n.icon(cc,18):n.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:14,color:T.txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                    <div style={{fontSize:12,color:T.txt2,marginTop:1}}>{n.sub}</div>
                  </div>
                  <span style={{color:T.txt3,fontSize:18}}>›</span>
                </button>
              );
            })}
          </div>
        }
      </Sheet>
  );
}
