"use client";

import { mtSym } from "@/lib/utils";
import { Sheet } from "@/components/Sheet";
import { Label } from "@/components/Label";
import { Toggle } from "@/components/Toggle";
import { Segmented, ColorDots, SubmitBtn, AmountInput } from "@/components/form";

export function AccSheet({modal,closeM,editId,T,accForm,setAccForm,inp,doAddAcc,accs}){
  const isCred=accForm.kind==="credit";
  const cashAccs=(accs||[]).filter(a=>a.kind!=="credit"&&a.id!==editId);
  const half={flex:1,minWidth:0};
  return(
      <Sheet open={modal==="acc"} onClose={closeM} title={editId?"Edit Account":"New Account"} T={T}>
        <div style={{marginBottom:14}}>
          <Label text="Account Type" T={T}/>
          <Segmented items={[["cash","Cash / Bank"],["credit","Credit Card"]]} value={isCred?"credit":"cash"} onChange={v=>setAccForm(f=>({...f,kind:v}))} T={T}/>
        </div>

        <div style={{marginBottom:14}}><Label text="Account Name" T={T}/><input type="text" placeholder={isCred?"e.g. Amex Gold, Barclays Visa…":"e.g. N26, Cash, Savings…"} value={accForm.name} onChange={e=>setAccForm(f=>({...f,name:e.target.value}))} style={inp}/></div>

        {isCred?(<>
          <div style={{marginBottom:14}}>
            <Label text={`Credit Limit (${mtSym()})`} T={T}/>
            <AmountInput placeholder="6000" value={accForm.creditLimit} onChange={v=>setAccForm(f=>({...f,creditLimit:v}))} style={inp}/>
          </div>
          <div style={{marginBottom:14}}>
            <Label text={`Balance Already Owed (${mtSym()})`} T={T}/>
            <AmountInput placeholder="0.00" value={accForm.owed} onChange={v=>setAccForm(f=>({...f,owed:v}))} style={inp}/>
            <div style={{fontSize:12,color:T.txt2,marginTop:6}}>What you owe on this card today, before logging any transactions here. Leave 0 for a fresh card.</div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div style={half}><Label text="Statement Day" T={T}/><input type="number" min="1" max="31" placeholder="25" value={accForm.statementDay} onChange={e=>setAccForm(f=>({...f,statementDay:e.target.value}))} style={inp}/></div>
            <div style={half}><Label text="Due Day" T={T}/><input type="number" min="1" max="31" placeholder="15" value={accForm.dueDay} onChange={e=>setAccForm(f=>({...f,dueDay:e.target.value}))} style={inp}/></div>
          </div>
          <div style={{fontSize:12,color:T.txt2,marginTop:-6,marginBottom:14}}>The bill closes on the statement day; anything you spend after it rolls onto next month&apos;s bill.</div>
          <div style={{marginBottom:14}}>
            <Label text="APR % (optional)" T={T}/>
            <AmountInput placeholder="18.9" value={accForm.apr} onChange={v=>setAccForm(f=>({...f,apr:v}))} style={inp}/>
            <div style={{fontSize:12,color:T.txt2,marginTop:6}}>Used only to estimate interest if you don&apos;t clear the bill. Leave empty to skip.</div>
          </div>
          <div style={{marginBottom:14}}>
            <Label text="Pay Bill From" T={T}/>
            <select value={accForm.payFromId} onChange={e=>setAccForm(f=>({...f,payFromId:e.target.value}))} style={inp}>
              <option value="">Ask me each time</option>
              {cashAccs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.inp,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{flex:1,paddingRight:12}}>
              <div style={{fontWeight:600,fontSize:15}}>Auto-pay the bill</div>
              <div style={{fontSize:12,color:T.txt2,marginTop:2}}>On the due date, log the full statement payment automatically. Needs a &quot;pay from&quot; account.</div>
            </div>
            <Toggle value={!!accForm.autopay&&!!accForm.payFromId} onChange={v=>setAccForm(f=>({...f,autopay:v}))} T={T}/>
          </div>
          <div style={{marginBottom:14}}>
            <Label text="Auto-match bill payment (optional)" T={T}/>
            <input type="text" placeholder="Text on your bank statement, e.g. your card issuer" value={accForm.billPayee||""} onChange={e=>setAccForm(f=>({...f,billPayee:e.target.value}))} style={inp}/>
            <div style={{fontSize:12,color:T.txt2,marginTop:6,lineHeight:1.45}}>When a synced bank debit contains this text, it&apos;s automatically counted as a payment on this card (a transfer), so you never add it by hand. Leave blank to keep bill payments manual.</div>
          </div>
        </>):(
          <div style={{marginBottom:14}}>
            <Label text="Balance" T={T}/>
            <div style={{marginBottom:10}}>
              <Segmented items={[["current","Balance today"],["start","Starting balance"]]} value={accForm._balMode==="current"?"current":"start"} onChange={v=>setAccForm(f=>({...f,_balMode:v}))} T={T}/>
            </div>
            {accForm._balMode==="current"?(<>
              <AmountInput placeholder="0.00" value={accForm._currentBal} onChange={v=>setAccForm(f=>({...f,_currentBal:v}))} style={inp}/>
              <div style={{fontSize:12,color:T.txt2,marginTop:6}}>{editId?"What this account shows in your bank right now — we back-calculate the starting balance from your transactions, so every past day is correct too.":"Its balance today (same as the starting balance for a brand-new account)."}</div>
            </>):(<>
              <AmountInput placeholder="0.00" value={accForm.ib} onChange={v=>setAccForm(f=>({...f,ib:v}))} style={inp}/>
              <div style={{fontSize:12,color:T.txt2,marginTop:6}}>Balance before the first transaction recorded in this account.</div>
            </>)}
          </div>
        )}

        <div style={{marginBottom:22}}><Label text="Color" T={T}/><ColorDots value={accForm.color} onChange={c=>setAccForm(f=>({...f,color:c}))} T={T}/></div>
        <SubmitBtn onClick={doAddAcc} disabled={!accForm.name} T={T}>{editId?"Save Changes":isCred?"Add Card":"Add Account"}</SubmitBtn>
      </Sheet>
  );
}
