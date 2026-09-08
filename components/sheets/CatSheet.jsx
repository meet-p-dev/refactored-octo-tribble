"use client";

import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { ColorDots, SubmitBtn, SymbolGrid } from "@/components/form";

export function CatSheet({modal,closeM,editId,T,catForm,setCatForm,inp,doAddCat}){
  return(
      <Sheet open={modal==="cat"} onClose={closeM} title={editId?"Edit Category":"New Category"} T={T}>
        <div style={{marginBottom:14}}><Label text="Category Name" T={T}/><input type="text" placeholder="e.g. Dining, Groceries…" value={catForm.label} onChange={e=>setCatForm(f=>({...f,label:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:14}}>
          <Label text="Symbol" T={T}/>
          <SymbolGrid value={catForm.sym} onChange={s=>setCatForm(f=>({...f,sym:s}))} T={T} color={catForm.color}/>
        </div>
        <div style={{marginBottom:22}}><Label text="Color" T={T}/><ColorDots value={catForm.color} onChange={c=>setCatForm(f=>({...f,color:c}))} T={T}/></div>
        <SubmitBtn onClick={doAddCat} disabled={!catForm.label} T={T}>{editId?"Save Changes":"Save Category"}</SubmitBtn>
      </Sheet>
  );
}
