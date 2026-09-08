"use client";

import { I, GoalIcon } from "@/lib/icons";
import { AddBtn } from "@/components/form";

export function GoalsTab({T,fmt,goals,setGoalForm,iGoal,setEditId,setModal,doEditGoal,delGoal,haptic}){
  return(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:20}}>Savings Goals</div>
            <AddBtn T={T} onClick={()=>{setGoalForm(iGoal);setEditId(null);setModal("goal");}}>Add</AddBtn>
          </div>
          {goals.length===0
            ?<div style={{background:T.card,borderRadius:20,boxShadow:T.shadow,padding:"32px 20px",textAlign:"center",marginBottom:12}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{I.goal(T.txt3,44)}</div>
              <div style={{fontWeight:600,fontSize:16,marginBottom:6}}>No goals yet</div>
              <div style={{color:T.txt3,fontSize:14}}>Set a savings goal to track progress</div>
            </div>
            :<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:12}}>
              {goals.map(g=>{
                const pct=Math.min(g.savedAmount/g.targetAmount*100,100),done=pct>=100;
                return(
                  <div key={g.id} onClick={()=>{haptic(8);doEditGoal(g);}} className="mt-tap" style={{background:T.card,borderRadius:20,boxShadow:T.shadow,padding:"18px 16px",position:"relative",overflow:"hidden"}}>
                    {done&&<div style={{position:"absolute",top:0,right:0,background:T.green,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:"0 18px 0 10px"}}>REACHED</div>}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:54,height:54,borderRadius:20,background:(g.color||T.acc)+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><GoalIcon goal={g} size={26}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:17}}>{g.name}</div>
                        <div style={{fontSize:13,color:T.txt2,marginTop:2}}>{done?"Goal reached!":fmt(g.targetAmount-g.savedAmount)+" to go"}</div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:18,color:g.color||T.acc}}>{fmt(g.savedAmount)}</div><div style={{fontSize:12,color:T.txt3}}>of {fmt(g.targetAmount)}</div></div>
                    </div>
                    <div style={{height:8,background:T.border,borderRadius:99,marginBottom:8,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:g.color||T.acc,width:`${pct}%`,transition:"width .5s"}}/></div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:600,color:g.color||T.acc}}>{pct.toFixed(0)}% saved</span>
                      <div style={{display:"flex",gap:14}}>
                        <button onClick={e=>{e.stopPropagation();doEditGoal(g);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                        <button onClick={e=>{e.stopPropagation();delGoal(g.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </>);
}
