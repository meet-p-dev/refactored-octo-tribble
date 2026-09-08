"use client";

export function SubNav({view,setView,items,T,haptic}){
  return(
    <div style={{display:"flex",background:T.card,borderRadius:12,padding:4,marginBottom:14,gap:4}}>
      {items.map(([v,l])=>(
        <button key={v} onClick={()=>{haptic(8);setView(v);}} style={{flex:1,padding:"9px 0",borderRadius:12,border:"none",background:view===v?T.acc:"transparent",color:view===v?"#fff":T.txt2,fontWeight:600,fontSize:14,cursor:"pointer",transition:"all .2s"}}>{l}</button>
      ))}
    </div>
  );
}
