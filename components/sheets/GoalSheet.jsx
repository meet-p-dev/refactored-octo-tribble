"use client";

import { mtSym } from "@/lib/utils";
import { GOAL_SYMS } from "@/lib/icons";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { ColorDots, SubmitBtn, AmountInput, SymbolGrid } from "@/components/form";

export function GoalSheet({modal,closeM,editId,T,goalForm,setGoalForm,inp,doAddGoal}){
  return(
      <Sheet open={modal==="goal"} onClose={closeM} title={editId?"Edit Goal":"New Savings Goal"} T={T}>
        <div style={{marginBottom:14}}><Label text="Goal Name" T={T}/><input type="text" placeholder="e.g. Trip home, New laptop…" value={goalForm.name} onChange={e=>setGoalForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Target (${mtSym()})`} T={T}/><AmountInput placeholder="400" value={goalForm.targetAmount} onChange={v=>setGoalForm(f=>({...f,targetAmount:v}))} style={inp}/></div>
          <div><Label text={`Saved so far (${mtSym()})`} T={T}/><AmountInput placeholder="0" value={goalForm.savedAmount} onChange={v=>setGoalForm(f=>({...f,savedAmount:v}))} style={inp}/></div>
        </div>
        <div style={{marginBottom:14}}>
          <Label text="Symbol" T={T}/>
          {/* Goals saved before symbols existed prefill sym:"" — GoalIcon maps their
              emoji to the matching glyph, so the right cell still shows as selected. */}
          <SymbolGrid keys={GOAL_SYMS} value={goalForm.sym} onChange={s=>setGoalForm(f=>({...f,sym:s}))} T={T} color={goalForm.color}/>
        </div>
        <div style={{marginBottom:22}}><Label text="Color" T={T}/><ColorDots value={goalForm.color} onChange={c=>setGoalForm(f=>({...f,color:c}))} T={T}/></div>
        <SubmitBtn onClick={doAddGoal} disabled={!goalForm.name||!goalForm.targetAmount} T={T}>{editId?"Save Changes":"Create Goal"}</SubmitBtn>
      </Sheet>
  );
}
