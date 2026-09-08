"use client";

import { I, CatIcon } from "@/lib/icons";
import { AddBtn } from "@/components/form";

export function CategoriesPanel({T,cats,setCatForm,iCat,setEditId,setModal,doEditCat,delCat}){
  return(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontWeight:700,fontSize:20}}>Categories</div><div style={{fontSize:13,color:T.txt2,marginTop:1}}>{cats.length} categories</div></div>
            <AddBtn T={T} onClick={()=>{setCatForm(iCat);setEditId(null);setModal("cat");}}>Add</AddBtn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {cats.map(c=>(
              <div key={c.id} style={{background:T.card,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center"}}><CatIcon cat={c} size={20}/></div>
                  <div><div style={{fontWeight:600,fontSize:16}}>{c.label}</div><div style={{fontSize:12,color:T.txt2}}>{c.id}</div></div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>doEditCat(c)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                  <button onClick={()=>delCat(c.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                </div>
              </div>
            ))}
          </div>
        </>);
}
