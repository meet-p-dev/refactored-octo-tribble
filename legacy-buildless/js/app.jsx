const {useState,useEffect,useMemo,useRef}=React;
function App(){
  const sysDark=window.matchMedia?.("(prefers-color-scheme:dark)").matches??false;
  const [accs,setAccs]           =useState([]);
  const [cats,setCats]           =useState([]);
  const [txs,setTxs]             =useState([]);
  const [goals,setGoals]         =useState([]);
  const [recurring,setRecurring] =useState([]);
  const [debts,setDebts]         =useState([]);
  const [dark,setDark]           =useState(()=>LS.g("mt-dark")??sysDark);
  const [curId,setCurId]         =useState(()=>LS.g("mt-currency")||"de-DE");
  const [tab,setTab]             =useState("home");
  const [modal,setModal]         =useState(null);
  const [editId,setEditId]       =useState(null);
  const [search,setSearch]       =useState("");
  const [fCat,setFCat]           =useState("");
  const [fAcc,setFAcc]           =useState("");
  const [fType,setFType]         =useState("");
  const [drillCat,setDrillCat]   =useState(null);
  const [ready,setReady]         =useState(false);
  const [toast,setToast]         =useState(null);
  const [budgets,setBudgets]     =useState({});
  const [pin,setPin]             =useState(null);
  const [locked,setLocked]       =useState(false);
  const [pinFlow,setPinFlow]     =useState(null);
  const [hapticsOn,setHapticsOn] =useState(true);
  const [anaView,setAnaView]     =useState("spend");
  const [confetti,setConfetti]   =useState(false);
  const [splitBannerSeen,setSplitBannerSeen]     =useState(()=>LS.g("mt-split-banner")||false);
  const [recurringBannerSeen,setRecurringBannerSeen]=useState(()=>LS.g("mt-rec-banner")||false);
  const [debtBannerSeen,setDebtBannerSeen]       =useState(()=>LS.g("mt-debt-banner")||false);
  const [dismissedNotifs,setDismissedNotifs]     =useState([]);
  const [fabSide,setFabSide]     =useState("right");
  const [fabTop,setFabTop]       =useState(null);
  const [fabDrag,setFabDrag]     =useState(null);
  const [calMonth,setCalMonth]   =useState(()=>tod().slice(0,7));
  const [peopleView,setPeopleView]=useState("splits");
  const fileRef=useRef();
  const T=dark?DK:LT;
  useEffect(()=>{window.__mtHaptics=hapticsOn;},[hapticsOn]);
  const fireConfetti=()=>{setConfetti(true);haptic([12,40,12,40,18]);setTimeout(()=>setConfetti(false),2600);};

  const iTx={date:tod(),type:"expense",amount:"",merchant:"",category:"other",accountId:"",toAccountId:"",notes:"",isSplit:false,splitPeople:2,splitSettled:false};
  const iAcc={name:"",color:"#3b82f6",ib:""};
  const iCat={label:"",icon:"📦",color:"#9ca3af"};
  const iGoal={name:"",targetAmount:"",savedAmount:"",icon:"🎯",color:"#007aff"};
  const iRec={merchant:"",amount:"",category:"other",accountId:"",type:"expense",dayOfMonth:1,active:true,notes:""};
  const iDebt={personName:"",totalAmount:"",paidBack:"0",date:tod(),description:"",color:"#e11d48",receivedInAccount:""};
  const iRepay={debtId:"",amount:"",date:tod(),accountId:"",notes:""};

  const [txForm,setTxForm]       =useState(iTx);
  const [accForm,setAccForm]     =useState(iAcc);
  const [catForm,setCatForm]     =useState(iCat);
  const [goalForm,setGoalForm]   =useState(iGoal);
  const [recForm,setRecForm]     =useState(iRec);
  const [debtForm,setDebtForm]   =useState(iDebt);
  const [repayForm,setRepayForm] =useState(iRepay);

  const showToast=(msg,ok=true,undo=null)=>{
    haptic(ok?12:[20,30,20]);
    setToast({msg,ok,undo});
    setTimeout(()=>setToast(null),undo?6000:2400);
  };

  useEffect(()=>{
    const a=LS.g("mt-accs")||DEFACCS;
    const c=LS.g("mt-cats")||CATS;
    const t=LS.g("mt-txs")||[];
    const g=LS.g("mt-goals")||[];
    const r=LS.g("mt-recurring")||[];
    const db=LS.g("mt-debts")||[];
    setAccs(a);setCats(c);setTxs(t);setGoals(g);setRecurring(r);setDebts(db);
    setBudgets(LS.g("mt-budgets")||{});
    // prune stale dismissed notif IDs to prevent unbounded growth
    const dn=LS.g("mt-dismissed-notifs")||[];
    setDismissedNotifs(dn.slice(-200));
    setFabSide(LS.g("mt-fab-side")||"right");
    setFabTop(LS.g("mt-fab-top"));
    const sp=LS.g("mt-pin");if(sp){setPin(sp);setLocked(true);}
    const hp=LS.g("mt-haptics");setHapticsOn(hp===null?true:hp);
    if(!LS.g("mt-accs"))LS.s("mt-accs",DEFACCS);
    if(!LS.g("mt-cats"))LS.s("mt-cats",CATS);
    setReady(true);
  },[]);

  const mkSet=(setState,key)=>v=>setState(prev=>{const next=typeof v==="function"?v(prev):v;LS.s(key,next);return next;});
  const sa=mkSet(setAccs,"mt-accs");
  const sc=mkSet(setCats,"mt-cats");
  const st=mkSet(setTxs,"mt-txs");
  const sg=mkSet(setGoals,"mt-goals");
  const sr=mkSet(setRecurring,"mt-recurring");
  const sd=mkSet(setDebts,"mt-debts");
  const sb=mkSet(setBudgets,"mt-budgets");
  const [onbDone,setOnbDone]=useState(false);
  const finishOnboarding=p=>{if(p&&p.apply){sa(p.accs);st([]);sg([]);sr([]);sd([]);sb({});}LS.s("mt-onboarded",window.MT_VERSION);setOnbDone(true);};
  useEffect(()=>{if(LS.g("mt-cat-migrated"))return;const cur=LS.g("mt-txs")||[];let ch=false;const nx=cur.map(t=>{if(t.type==="transfer"&&t.category!=="transfer"){ch=true;return{...t,category:"transfer"};}if(/^(Borrowed from |Repayment )/.test(t.merchant||"")&&t.category!=="debt"){ch=true;return{...t,category:"debt"};}return t;});if(ch){LS.s("mt-txs",nx);setTxs(nx);}LS.s("mt-cat-migrated",true);},[]);
  const sdn=v=>{const next=typeof v==="function"?v(dismissedNotifs):v;const pruned=next.slice(-200);setDismissedNotifs(pruned);LS.s("mt-dismissed-notifs",pruned);};

  const FAB_YMIN=130,FAB_YMAX=()=>window.innerHeight-214;
  const onFabDown=e=>{
    e.preventDefault();
    const sx=e.clientX,sy=e.clientY;let moved=false;
    const move=ev=>{
      if(Math.abs(ev.clientX-sx)>6||Math.abs(ev.clientY-sy)>6)moved=true;
      if(moved)setFabDrag({x:ev.clientX,y:Math.max(FAB_YMIN+31,Math.min(FAB_YMAX()+31,ev.clientY))});
    };
    const up=ev=>{
      window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);
      setFabDrag(null);
      if(moved){
        const ns=ev.clientX<window.innerWidth/2?"left":"right";
        setFabSide(ns);LS.s("mt-fab-side",ns);
        const nt=Math.max(FAB_YMIN,Math.min(FAB_YMAX(),ev.clientY-31));
        setFabTop(nt);LS.s("mt-fab-top",nt);
        haptic(12);
      }else openAddPrefill();
    };
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);
  };

  const tgDk=()=>{const nd=!dark;setDark(nd);LS.s("mt-dark",nd);};
  const setCur=id=>{setCurId(id);window.__mtCurId=id;LS.s("mt-currency",id);haptic(12);};
  const setHap=v=>{setHapticsOn(v);LS.s("mt-haptics",v);};
  const getCat=id=>cats.find(c=>c.id===id)||CATS.find(c=>c.id===id)||{icon:"📦",color:"#9ca3af",label:id||"Other"};

  const getBal=useMemo(()=>(aid)=>{
    const a=accs.find(x=>x.id===aid);if(!a)return 0;
    let b=parseFloat(a.ib)||0;
    txs.forEach(t=>{
      const v=parseFloat(t.amount)||0;
      if(t.type==="income"&&t.accountId===aid)b+=v;
      if(t.type==="expense"&&t.accountId===aid)b-=v;
      if(t.type==="transfer"&&t.accountId===aid)b-=v;
      if(t.type==="transfer"&&t.toAccountId===aid)b+=v;
    });
    return b;
  },[accs,txs]);

  // FIX: totBal uses same memo as getBal — no stale closure
  const totBal=useMemo(()=>accs.reduce((s,a)=>s+getBal(a.id),0),[getBal,accs]);

  const mLbl=new Date().toLocaleString("default",{month:"long"});
  const now0=new Date();
  const monthKey=tod().slice(0,7);
  const daysInMonth=new Date(now0.getFullYear(),now0.getMonth()+1,0).getDate();
  const dayOfMonth=now0.getDate();
  const daysLeft=Math.max(daysInMonth-dayOfMonth+1,1);

  const mSt=useMemo(()=>{
    const m=txs.filter(t=>t.date.startsWith(monthKey));
    return{
      inc:m.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount),0),
      // FIX: use personal share for expenses
      spt:m.filter(t=>t.type==="expense").reduce((s,t)=>s+personalAmt(t),0),
    };
  },[txs]);

  const chartD=useMemo(()=>{
    const n=new Date();
    return Array.from({length:12},(_,i)=>{
      const d=new Date(n.getFullYear(),n.getMonth()-(11-i),1);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      return{
        label:d.toLocaleString("default",{month:"short"}),
        income:txs.filter(t=>t.type==="income"&&t.date.startsWith(k)).reduce((s,t)=>s+parseFloat(t.amount),0),
        // FIX: personal share for expenses in chart
        spent:txs.filter(t=>t.type==="expense"&&t.date.startsWith(k)).reduce((s,t)=>s+personalAmt(t),0),
      };
    });
  },[txs]);

  const catD=useMemo(()=>{
    const map={};
    txs.filter(t=>t.type==="expense").forEach(t=>{
      const c=t.category||"other";
      if(!map[c])map[c]={total:0,merchants:{}};
      // FIX: personal share
      const a=personalAmt(t);
      map[c].total+=a;
      const m=t.merchant||"Unknown";
      map[c].merchants[m]=(map[c].merchants[m]||0)+a;
    });
    return Object.entries(map).sort(([,a],[,b])=>b.total-a.total).map(([id,v])=>({id,...v,...getCat(id)}));
  },[txs,cats]);

  const filtTxs=useMemo(()=>
    [...txs].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>{
      if(search&&!t.merchant?.toLowerCase().includes(search.toLowerCase()))return false;
      if(fCat&&t.category!==fCat)return false;
      if(fAcc&&t.accountId!==fAcc)return false;
      if(fType&&t.type!==fType)return false;
      return true;
    }),[txs,search,fCat,fAcc,fType]);

  const filtSummary=useMemo(()=>{
    if(fType==="income")   return {sum:filtTxs.reduce((s,t)=>s+(parseFloat(t.amount)||0),0),verb:"in"};
    if(fType==="expense")  return {sum:filtTxs.reduce((s,t)=>s+personalAmt(t),0),verb:"spent"};
    if(fType==="transfer") return {sum:filtTxs.reduce((s,t)=>s+(parseFloat(t.amount)||0),0),verb:"moved"};
    return {sum:filtTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+personalAmt(t),0),verb:"spent"};
  },[filtTxs,fType]);

  const recTxs=useMemo(()=>[...txs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5),[txs]);
  const pendingSplits=useMemo(()=>txs.filter(t=>t.isSplit&&!t.splitSettled&&t.type==="expense"),[txs]);
  const totalOwed=useMemo(()=>pendingSplits.reduce((s,t)=>{const f=parseFloat(t.amount)||0;return s+(f-f/Math.max(t.splitPeople||1,1));},0),[pendingSplits]);
  const recurringDue=useMemo(()=>{const dom=new Date().getDate();return recurring.filter(r=>r.active&&r.dayOfMonth>=dom&&r.dayOfMonth<=dom+3);},[recurring]);
  const activeDebts=useMemo(()=>debts.filter(d=>!d.settled),[debts]);
  const settledDebts=useMemo(()=>debts.filter(d=>d.settled),[debts]);
  const totalDebt=useMemo(()=>activeDebts.reduce((s,d)=>s+(d.totalAmount-d.paidBack),0),[activeDebts]);

  const monthCatSpent=useMemo(()=>{
    const m={};
    txs.filter(t=>t.type==="expense"&&t.date.startsWith(monthKey)).forEach(t=>{
      m[t.category||"other"]=(m[t.category||"other"]||0)+personalAmt(t);
    });
    return m;
  },[txs]);

  const budgetData=useMemo(()=>cats.map(c=>({...c,limit:parseFloat(budgets[c.id])||0,spent:monthCatSpent[c.id]||0})).filter(b=>b.limit>0).map(b=>({...b,pct:b.spent/b.limit})).sort((a,b)=>b.pct-a.pct),[cats,budgets,monthCatSpent]);
  const totalBudget=useMemo(()=>budgetData.reduce((s,b)=>s+b.limit,0),[budgetData]);
  const totalBudgetSpent=useMemo(()=>budgetData.reduce((s,b)=>s+b.spent,0),[budgetData]);
  const overBudget=useMemo(()=>budgetData.filter(b=>b.pct>1),[budgetData]);
  const safeToday=useMemo(()=>{
    if(totalBudget>0)return Math.max((totalBudget-totalBudgetSpent)/daysLeft,0);
    if(mSt.inc>0)return Math.max((mSt.inc-mSt.spt)/daysLeft,0);
    return 0;
  },[totalBudget,totalBudgetSpent,mSt,daysLeft]);

  const reachedGoals=useMemo(()=>goals.filter(g=>parseFloat(g.targetAmount)>0&&parseFloat(g.savedAmount)>=parseFloat(g.targetAmount)),[goals]);
  const mxCat=catD[0]?.total||1;

  const notifs=useMemo(()=>{
    const a=[];
    recurringDue.forEach(r=>a.push({k:"rec-"+r.id,icon:"💳",tone:"blue",title:r.merchant+" due soon",sub:"Recurring · day "+r.dayOfMonth,tab:"splits",pv:"recurring"}));
    overBudget.forEach(b=>a.push({k:"ob-"+b.label,icon:"⚠️",tone:"red",title:b.label+" over budget",sub:Math.round(b.pct*100)+"% used",tab:"stats",ana:"budget"}));
    pendingSplits.forEach(t=>a.push({k:"ps-"+t.id,icon:"🧾",tone:"green",title:t.merchant,sub:"Split not settled",tab:"splits",pv:"splits"}));
    reachedGoals.forEach(g=>a.push({k:"g-"+g.id,icon:"🎉",tone:"green",title:g.name+" reached!",sub:"Savings goal complete",tab:"goals"}));
    activeDebts.slice(0,2).forEach(d=>a.push({k:"debt-"+d.id,icon:"💸",tone:"red",title:`Owe ${d.personName} ${fmt(d.totalAmount-d.paidBack)}`,sub:"Tap to log repayment",tab:"splits",pv:"debts"}));
    return a.filter(n=>!dismissedNotifs.includes(n.k));
  },[recurringDue,overBudget,pendingSplits,reachedGoals,activeDebts,dismissedNotifs]);

  const insights=useMemo(()=>{
    const list=[];
    const dailyAvg=mSt.spt/Math.max(dayOfMonth,1);
    const lm=new Date(now0.getFullYear(),now0.getMonth()-1,1);
    const lmKey=`${lm.getFullYear()}-${String(lm.getMonth()+1).padStart(2,"0")}`;
    const lmSpent=txs.filter(t=>t.type==="expense"&&t.date.startsWith(lmKey)).reduce((s,t)=>s+personalAmt(t),0);
    const expTx=txs.filter(t=>t.type==="expense"&&t.date.startsWith(monthKey));
    // projection from MEDIAN daily spend so one-off big expenses don't explode the forecast
    const byDay={};expTx.forEach(t=>{byDay[t.date]=(byDay[t.date]||0)+personalAmt(t);});
    const dTot=Object.values(byDay).sort((a,b)=>a-b);
    const medDay=dTot.length?dTot[Math.floor(dTot.length/2)]:0;
    const projected=mSt.spt+medDay*(daysInMonth-dayOfMonth);
    if(mSt.inc>0){const r=Math.round((mSt.inc-mSt.spt)/mSt.inc*100);list.push({icon:"💎",label:"Savings rate",value:r+"%",sub:r>=20?"Great!":"Aim for 20%+",tone:r>=20?"green":r>=0?"blue":"red"});}
    // FIX: only show projected spend if at least 5 days have passed (avoids day-1 scariness)
    if(mSt.spt>0&&dayOfMonth>=5)list.push({icon:"📈",label:"Projected spend",value:fmt(projected),sub:"at typical pace",tone:"blue"});
    if(lmSpent>0){const diff=Math.round((mSt.spt-lmSpent)/lmSpent*100);list.push({icon:diff<=0?"🎉":"⚠️",label:"vs last month",value:(diff>0?"+":"")+diff+"%",sub:diff<=0?"less spending":"more spending",tone:diff<=0?"green":"red"});}
    list.push({icon:"📅",label:"Daily average",value:fmt(dailyAvg),sub:`over ${dayOfMonth} days`,tone:"blue"});
    if(expTx.length){const big=expTx.reduce((a,b)=>parseFloat(b.amount)>parseFloat(a.amount)?b:a);list.push({icon:"🔥",label:"Biggest expense",value:fmt(parseFloat(big.amount)),sub:big.merchant||"—",tone:"red"});}
    return list;
  },[txs,mSt,dayOfMonth,daysInMonth]);

  const calData=useMemo(()=>{
    const m={};
    txs.filter(t=>t.type==="expense"&&t.date.startsWith(calMonth)).forEach(t=>{
      m[t.date]=(m[t.date]||0)+personalAmt(t);
    });
    return m;
  },[txs,calMonth]);

  const closeM=()=>{setModal(null);setEditId(null);setTxForm(iTx);setAccForm(iAcc);setGoalForm(iGoal);setRecForm(iRec);setDebtForm(iDebt);setRepayForm(iRepay);setCatForm(iCat);};

  const doAddTx=()=>{
    if(!txForm.amount||!txForm.accountId)return;
    // FIX: guard transfer toAccountId in save function too
    if(txForm.type==="transfer"&&!txForm.toAccountId)return;
    const {_settleIds,...cleanForm}=txForm;
    const settleIds=_settleIds||[];
    const tx={...cleanForm,id:editId||uid(),amount:parseFloat(txForm.amount),splitPeople:txForm.isSplit?parseInt(txForm.splitPeople)||2:1,category:txForm.type==="transfer"?"transfer":txForm.category};
    const oldTx=editId?txs.find(t=>t.id===editId):null;
    const base=editId?txs.map(t=>t.id===editId?tx:t):[tx,...txs];
    const newTxs=settleIds.length?base.map(t=>settleIds.includes(t.id)?{...t,splitSettled:true}:t):base;
    st(newTxs);
    // FIX: only reset split banner for split transactions
    if(tx.isSplit){setSplitBannerSeen(false);LS.s("mt-split-banner",false);}
    try{localStorage.setItem("mt-last-account",tx.accountId);localStorage.setItem("mt-last-category",tx.category);}catch{}
    showToast(editId?"Transaction updated":"Transaction added",true,()=>st(prev=>{
      const reverted=oldTx?prev.map(t=>t.id===tx.id?oldTx:t):prev.filter(t=>t.id!==tx.id);
      return settleIds.length?reverted.map(t=>settleIds.includes(t.id)?{...t,splitSettled:false}:t):reverted;
    }));
    closeM();
  };

  const doDeleteTx=id=>{
    const old=txs.find(t=>t.id===id);if(!old)return;
    st(txs.filter(t=>t.id!==id));
    showToast("Transaction deleted",true,()=>st(prev=>[old,...prev]));
  };
  const doEditTx=t=>{setTxForm({...iTx,...t});setEditId(t.id);setModal("tx");};
  const openAddPrefill=()=>{
    const la=localStorage.getItem("mt-last-account");
    const lc=localStorage.getItem("mt-last-category");
    setTxForm({...iTx,accountId:la||accs[0]?.id||"",category:lc||"other"});
    setEditId(null);setModal("tx");
  };

  const doAddAcc=()=>{
    if(!accForm.name)return;
    const a={id:editId||uid(),...accForm,ib:parseFloat(accForm.ib)||0};
    sa(editId?accs.map(x=>x.id===editId?{...x,...a}:x):[...accs,a]);
    showToast(editId?"Account updated":"Account added");closeM();
  };
  const delAcc=id=>{
    const a=accs.find(x=>x.id===id);if(!a||!confirm(`Delete "${a.name}"?`))return;
    sa(prev=>prev.filter(x=>x.id!==id));showToast("Account deleted",true,()=>sa(prev=>[a,...prev]));
  };
  const doEditAcc=a=>{setAccForm({name:a.name,color:a.color,ib:String(a.ib)});setEditId(a.id);setModal("acc");};

  const doAddCat=()=>{
    if(!catForm.label)return;
    const id=editId||catForm.label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||uid();
    const c={id,...catForm};
    sc(editId?cats.map(x=>x.id===editId?{...x,...c}:x):[...cats,c]);
    showToast(editId?"Category updated":"Category added");closeM();
  };
  const delCat=id=>{
    const c=cats.find(x=>x.id===id);if(!c||!confirm(`Delete "${c.label}"?`))return;
    sc(prev=>prev.filter(x=>x.id!==id));showToast("Category deleted");
  };
  const doEditCat=c=>{setCatForm({label:c.label,icon:c.icon,color:c.color});setEditId(c.id);setModal("cat");};

  const doAddGoal=()=>{
    if(!goalForm.name||!goalForm.targetAmount)return;
    const g={...goalForm,id:editId||uid(),targetAmount:parseFloat(goalForm.targetAmount)||0,savedAmount:parseFloat(goalForm.savedAmount)||0};
    sg(editId?goals.map(x=>x.id===editId?g:x):[...goals,g]);
    const reached=g.targetAmount>0&&g.savedAmount>=g.targetAmount;
    if(reached)fireConfetti();
    showToast(reached?"Goal reached! 🎉":editId?"Goal updated":"Goal added");closeM();
  };
  const delGoal=id=>{
    const g=goals.find(x=>x.id===id);if(!g||!confirm(`Delete "${g.name}"?`))return;
    sg(prev=>prev.filter(x=>x.id!==id));showToast("Goal deleted",true,()=>sg(prev=>[g,...prev]));
  };
  const doEditGoal=g=>{setGoalForm({name:g.name,targetAmount:String(g.targetAmount),savedAmount:String(g.savedAmount),icon:g.icon,color:g.color});setEditId(g.id);setModal("goal");};

  const doAddRec=()=>{
    if(!recForm.merchant||!recForm.amount||!recForm.accountId)return;
    const r={...recForm,id:editId||uid(),amount:parseFloat(recForm.amount)||0,dayOfMonth:parseInt(recForm.dayOfMonth)||1};
    sr(editId?recurring.map(x=>x.id===editId?r:x):[...recurring,r]);
    // FIX: reset recurring banner only when a new recurring is added
    if(!editId){setRecurringBannerSeen(false);LS.s("mt-rec-banner",false);}
    showToast(editId?"Recurring updated":"Recurring added");closeM();
  };
  const delRec=id=>{
    const r=recurring.find(x=>x.id===id);if(!r||!confirm(`Delete "${r.merchant}"?`))return;
    sr(prev=>prev.filter(x=>x.id!==id));showToast("Recurring deleted");
  };
  const addRecurringNow=r=>{
    const tx={id:uid(),type:r.type,amount:r.amount,merchant:r.merchant,category:r.category,accountId:r.accountId,notes:r.notes||"",date:tod(),isSplit:false,splitPeople:1,splitSettled:false};
    st(prev=>[tx,...prev]);showToast(`Added "${r.merchant}"`);
  };

  // Debts
  const doAddDebt=()=>{
    if(!debtForm.personName||!debtForm.totalAmount)return;
    const total=parseFloat(debtForm.totalAmount)||0;
    // FIX: paidBack cannot exceed totalAmount
    const paid=Math.min(parseFloat(debtForm.paidBack)||0,total);
    const wasSettled=editId?debts.find(x=>x.id===editId)?.settled:false;
    const d={...debtForm,id:editId||uid(),totalAmount:total,paidBack:paid,settled:paid>=total&&total>0};
    sd(prev=>editId?prev.map(x=>x.id===editId?d:x):[d,...prev]);
    if(!editId){
      const newTxs=[];
      // income tx — money received into account
      if(debtForm.receivedInAccount){
        newTxs.push({id:uid(),type:"income",amount:total,merchant:`Borrowed from ${debtForm.personName}`,category:"debt",accountId:debtForm.receivedInAccount,notes:`Debt: ${debtForm.description||debtForm.personName}`,date:debtForm.date,isSplit:false,splitPeople:1,splitSettled:false});
      }
      // FIX: if paidBack > 0, create expense tx for prior repayments
      if(paid>0&&debtForm.receivedInAccount){
        newTxs.push({id:uid(),type:"expense",amount:paid,merchant:`Repayment → ${debtForm.personName}`,category:"debt",accountId:debtForm.receivedInAccount,notes:"Prior repayment (entered at debt creation)",date:tod(),isSplit:false,splitPeople:1,splitSettled:false});
      }
      if(newTxs.length)st(prev=>[...newTxs,...prev]);
      // FIX: reset debt banner only when new debt added
      setDebtBannerSeen(false);LS.s("mt-debt-banner",false);
    }
    if(d.settled&&!wasSettled)fireConfetti();
    showToast(editId?"Debt updated":"Debt added"+(debtForm.receivedInAccount&&!editId?" · balance updated":""));
    closeM();
  };

  // FIX: delDebt uses functional updater — not stale closure
  const delDebt=id=>{
    const d=debts.find(x=>x.id===id);
    if(!d)return;
    if(!confirm(`Delete debt for "${d.personName}"?`))return;
    sd(prev=>prev.filter(x=>x.id!==id));
    showToast("Debt deleted",true,()=>sd(prev=>[d,...prev]));
  };

  const doEditDebt=d=>{setDebtForm({personName:d.personName,totalAmount:String(d.totalAmount),paidBack:String(d.paidBack),date:d.date,description:d.description||"",color:d.color||"#e11d48",receivedInAccount:d.receivedInAccount||""});setEditId(d.id);setModal("debt");};
  const openRepay=d=>{setRepayForm({...iRepay,debtId:d.id,accountId:d.receivedInAccount||accs[0]?.id||""});setModal("repay");};

  const doRepay=()=>{
    if(!repayForm.amount||!repayForm.accountId||!repayForm.debtId)return;
    const debt=debts.find(x=>x.id===repayForm.debtId);if(!debt)return;
    const remaining=debt.totalAmount-debt.paidBack;
    const requested=parseFloat(repayForm.amount)||0;
    // FIX: cap at remaining, warn if over
    const amount=Math.min(requested,remaining);
    if(amount<=0)return;
    const newPaid=(debt.paidBack||0)+amount;
    const nowSettled=newPaid>=debt.totalAmount;
    const tx={id:uid(),type:"expense",amount,merchant:`Repayment → ${debt.personName}`,category:"debt",accountId:repayForm.accountId,notes:repayForm.notes||"Debt repayment",date:repayForm.date,isSplit:false,splitPeople:1,splitSettled:false};
    st(prev=>[tx,...prev]);
    sd(prev=>prev.map(d=>d.id===repayForm.debtId?{...d,paidBack:newPaid,settled:nowSettled}:d));
    if(nowSettled){fireConfetti();showToast(`${debt.personName} fully paid! 🎉`);}
    else if(requested>remaining)showToast(`Capped at ${fmt(amount)} · debt cleared`);
    else showToast(`Logged · ${fmt(debt.totalAmount-newPaid)} left`);
    closeM();
  };

  const settleSplit=t=>{
    const full=parseFloat(t.amount)||0,share=full/Math.max(t.splitPeople||1,1);
    setTxForm({...iTx,type:"income",amount:String((full-share).toFixed(2)),merchant:"WG Settlement",category:"other",accountId:t.accountId,notes:`Settlement for ${t.merchant}`,date:tod(),_settleIds:[t.id]});
    setModal("tx");
  };
  const settleAll=()=>{
    if(!pendingSplits.length)return;
    setTxForm({...iTx,type:"income",amount:String(totalOwed.toFixed(2)),merchant:"WG Settlement",category:"other",accountId:accs[0]?.id||"",notes:`Monthly split settlement — ${pendingSplits.length} transactions`,date:tod(),_settleIds:pendingSplits.map(t=>t.id)});
    setModal("tx");
  };

  // FIX: recurring trigger uses functional updaters — no stale closures
  useEffect(()=>{
    if(!ready)return;
    const trigger=()=>{
      const today=new Date(),day=today.getDate(),todayStr=tod();
      sr(prevRec=>{
        const newTxs=[],ids=new Set();
        prevRec.forEach(r=>{
          if(!r.active||(parseInt(r.dayOfMonth)||0)!==day||r.lastTriggered===todayStr)return;
          newTxs.push({id:uid(),type:r.type||"expense",amount:parseFloat(r.amount)||0,merchant:r.merchant,category:r.category||"other",accountId:r.accountId||"",notes:r.notes||"",date:todayStr,isSplit:false,splitPeople:1,splitSettled:false});
          ids.add(r.id);
        });
        if(newTxs.length){
          st(prev=>[...newTxs,...prev]);
          showToast("Added due recurring transactions");
          return prevRec.map(x=>ids.has(x.id)?{...x,lastTriggered:todayStr}:x);
        }
        return prevRec;
      });
    };
    trigger();
    window.addEventListener("focus",trigger);
    return()=>window.removeEventListener("focus",trigger);
  },[ready]);

  const doExport=()=>{
    const data={accs,cats,txs,goals,recurring,debts,budgets,currency:curId,exportedAt:new Date().toISOString(),version:"2.5"};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`moneytrack-backup-${tod()}.json`;a.click();URL.revokeObjectURL(url);
    showToast("Backup exported!");
  };
  const doImport=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.accs)sa(data.accs);if(data.cats)sc(data.cats);if(data.txs)st(data.txs);
        if(data.goals)sg(data.goals);if(data.recurring)sr(data.recurring);if(data.debts)sd(data.debts);if(data.budgets)sb(data.budgets);
        if(data.currency&&window.CURRENCIES.some(c=>c.id===data.currency))setCur(data.currency);
        showToast("Data restored!");closeM();
      }catch{showToast("Invalid backup file",false);}
    };
    reader.readAsText(file);e.target.value="";
  };
  const exportCSV=()=>{
    const rows=[...txs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,200);
    const hdr=["Date","Description","Amount","Category"];
    const esc=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';const csv=[hdr.join(","),...rows.map(r=>[r.date,esc(r.merchant),(r.type==="expense"?-Math.abs(r.amount):Math.abs(r.amount)),esc(getCat(r.category).label)].join(","))];
    const blob=new Blob([csv.join("\n")],{type:"text/csv"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="transactions.csv";a.click();URL.revokeObjectURL(url);
  };
  const setBudget=(catId,val)=>{const next={...budgets},n=parseFloat(val);if(!val||isNaN(n)||n<=0)delete next[catId];else next[catId]=n;sb(next);};
  const lockNow=()=>{if(pin){haptic(12);setLocked(true);}};
  const goTxs=(type="")=>{haptic(8);setFType(type);setSearch("");setFCat("");setFAcc("");setTab("txs");};

  const net=mSt.inc-mSt.spt,netPos=net>=0;
  const inp={display:"block",width:"100%",background:T.inp,color:T.txt,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"13px 14px",fontSize:16,outline:"none",WebkitAppearance:"none",appearance:"none"};
  const GOAL_ICONS=["🎯","✈️","🏠","🎓","🚗","💻","🎮","💍","🏖️","🎁","💊","🐾"];

  if(!ready)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100dvh",background:T.bg,gap:12}}>
      <div style={{fontSize:52}}>💰</div>
      <div style={{color:T.txt2,fontSize:14}}>Loading MoneyTrack…</div>
    </div>
  );

  const TABS=[
    {id:"home",lbl:"Home",ic:I.home},
    {id:"txs",lbl:"Activity",ic:I.list},
    {id:"splits",lbl:"People",ic:I.people},
    {id:"goals",lbl:"Goals",ic:I.goal},
    {id:"stats",lbl:"Analytics",ic:I.chart},
  ];

  const SubNav=({view,setView,items})=>(
    <div style={{display:"flex",background:T.card,borderRadius:12,padding:4,marginBottom:14,gap:4}}>
      {items.map(([v,l])=>(
        <button key={v} onClick={()=>{haptic(8);setView(v);}} style={{flex:1,padding:"9px 0",borderRadius:12,border:"none",background:view===v?T.acc:"transparent",color:view===v?"#fff":T.txt2,fontWeight:600,fontSize:14,cursor:"pointer",transition:"all .2s"}}>{l}</button>
      ))}
    </div>
  );

  const fabLeft=fabDrag?(fabDrag.x<window.innerWidth/2?20:window.innerWidth-82):(fabSide==="left"?20:window.innerWidth-82);
  const fabTopVal=fabDrag?Math.max(FAB_YMIN,Math.min(FAB_YMAX(),fabDrag.y-31)):(fabTop!=null?Math.max(FAB_YMIN,Math.min(FAB_YMAX(),fabTop)):window.innerHeight-160);

  const _onbVer=LS.g("mt-onboarded");
  const onbMode=onbDone?null:(_onbVer==null?(txs.length===0?"full":"guide"):(_onbVer!==window.MT_VERSION?"guide":null));

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:T.bg,color:T.txt}}>
      <Confetti show={confetti}/>
      {(locked||pinFlow)&&(
        <PinLock T={T} mode={pinFlow==="set"?"set":"enter"} storedPin={pin}
          onDone={code=>{
            if(pinFlow==="set"){LS.s("mt-pin",code);setPin(code);setPinFlow(null);showToast("App Lock enabled");}
            else if(pinFlow==="disable"){LS.s("mt-pin",null);setPin(null);setPinFlow(null);showToast("App Lock disabled");}
            else{haptic(14);setLocked(false);}
          }}
          onCancel={pinFlow?()=>setPinFlow(null):null}/>
      )}
      {!locked&&onbMode&&(
        <OnboardFlow T={T} mode={onbMode} defAccs={accs} onImport={doImport} onFinish={finishOnboarding}/>
      )}

      {toast&&(
        <div style={{position:"fixed",top:"calc(env(safe-area-inset-top) + 12px)",left:"50%",transform:"translateX(-50%)",zIndex:999,background:toast.ok?"#1c1c1e":"#ff453a",color:"#fff",borderRadius:12,padding:"10px 18px",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 20px rgba(0,0,0,.3)",whiteSpace:"nowrap"}}>
          {toast.ok?I.check("#fff"):I.x("#fff")} {toast.msg}
          {toast.undo&&<button onClick={()=>{try{toast.undo();}catch{}setToast(null);}} style={{marginLeft:12,background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"#fff",padding:"6px 10px",borderRadius:12,cursor:"pointer",fontWeight:700}}>Undo</button>}
        </div>
      )}

      {/* Header */}
      <div style={{background:T.bg,flexShrink:0,paddingTop:"env(safe-area-inset-top)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 6px"}}>
          <span style={{fontWeight:700,fontSize:17,letterSpacing:-.3}}>MoneyTrack</span>
          <div style={{display:"flex",gap:18,alignItems:"center"}}>
            {pin&&<button onClick={lockNow} className="mt-press" style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex"}}>{I.lock(T.txt2,19)}</button>}
            <button onClick={()=>setModal("notifs")} className="mt-press" style={{position:"relative",background:"none",border:"none",padding:0,cursor:"pointer",display:"flex"}}>
              {I.bell(T.txt2)}
              {notifs.length>0&&<span style={{position:"absolute",top:-4,right:-6,minWidth:15,height:15,padding:"0 3px",borderRadius:99,background:T.red,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.bg}`}}>{notifs.length}</span>}
            </button>
            <button onClick={tgDk} className="mt-press" style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex"}}>{dark?I.sun(T.txt2):I.moon(T.txt2)}</button>
            <button onClick={()=>setModal("settings")} className="mt-press" style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex"}}>{I.settings(T.txt2)}</button>
          </div>
        </div>
      </div>

      <div className={"mt-scaleback"+(modal?" dimmed":"")} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        <div className="mt-stagger" style={{padding:"6px 16px calc(env(safe-area-inset-bottom) + 126px)"}}>

        {/* ══ HOME ══ */}
        {tab==="home"&&<>
          <div style={{textAlign:"center",padding:"8px 0 16px"}}>
            <div onClick={()=>{haptic(8);setTab("accs");}} className="mt-tap" style={{display:"inline-block"}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:1.1,color:T.txt3,textTransform:"uppercase"}}>Total Balance</div>
              <AnimatedNumber value={totBal} format={fmt} style={{fontSize:38,fontWeight:700,letterSpacing:-1.2,display:"block",marginTop:2,fontVariantNumeric:"tabular-nums"}}/>
              <div style={{fontSize:12,fontWeight:600,color:T.acc,marginTop:3}}>{accs.length} accounts ›</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:14}}>
              <div onClick={()=>goTxs("income")} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>INCOME</div>
                <div style={{fontSize:14,fontWeight:700,color:T.green,fontVariantNumeric:"tabular-nums",marginTop:1}}>+{fmt(mSt.inc)}</div>
              </div>
              <div onClick={()=>goTxs("expense")} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>SPENT</div>
                <div style={{fontSize:14,fontWeight:700,color:T.txt,fontVariantNumeric:"tabular-nums",marginTop:1}}>−{fmt(mSt.spt)}</div>
              </div>
              <div onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");}} className="mt-tap">
                <div style={{fontSize:10,fontWeight:600,letterSpacing:.6,color:T.txt3}}>NET · {mLbl.slice(0,3).toUpperCase()}</div>
                <div style={{fontSize:14,fontWeight:700,color:netPos?T.green:T.red,fontVariantNumeric:"tabular-nums",marginTop:1}}>{(netPos?"+":"")+fmt(net)}</div>
              </div>
            </div>
          </div>

          {/* Debt banner — persisted dismiss */}
          {activeDebts.length>0&&!debtBannerSeen&&(
            <div onClick={()=>{setDebtBannerSeen(true);LS.s("mt-debt-banner",true);setTab("splits");setPeopleView("debts");}} className="mt-press" style={{background:dark?"#2d0000":"#ffdede",border:`1px solid ${dark?"#5c1a1a":"#fca5a5"}`,borderRadius:20,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              {I.wallet(dark?"#ff6b6b":"#b91c1c",18)}
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:dark?"#ff6b6b":"#b91c1c"}}>You owe {fmt(totalDebt)}</div>
                <div style={{fontSize:12,color:dark?"#ff8888":"#dc2626",marginTop:1}}>{activeDebts.length===1?`to ${activeDebts[0].personName}`:`to ${activeDebts.length} friends`} · tap to manage</div>
              </div>
              <span style={{color:dark?"#ff6b6b":"#b91c1c",fontSize:14,fontWeight:600}}>View →</span>
            </div>
          )}

          {/* Recurring due banner — persisted dismiss */}
          {recurringDue.length>0&&!recurringBannerSeen&&(
            <div style={{background:dark?"#1a1000":"#fff8e6",border:`1px solid ${dark?"#5a3a00":"#fde68a"}`,borderRadius:20,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              {I.bell(dark?"#fbbf24":"#d97706")}
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:dark?"#fbbf24":"#92400e"}}>Recurring due soon</div>
                <div style={{fontSize:12,color:dark?"#d97706":"#a16207",marginTop:1}}>{recurringDue.map(r=>r.merchant).join(", ")}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setRecurringBannerSeen(true);LS.s("mt-rec-banner",true);setTab("splits");setPeopleView("recurring");}} style={{background:"none",border:"none",color:dark?"#fbbf24":"#d97706",fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>View</button>
            </div>
          )}

          {/* Splits banner — persisted dismiss */}
          {pendingSplits.length>0&&!splitBannerSeen&&(
            <div style={{background:dark?"#002e14":"#d4f5df",border:`1px solid ${dark?"#1a5c2a":"#86efac"}`,borderRadius:20,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              {I.people(dark?"#30d158":"#16a34a")}
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:dark?"#30d158":"#15803d"}}>Others owe you {fmt(totalOwed)}</div>
                <div style={{fontSize:12,color:dark?"#4ade80":"#16a34a",marginTop:1}}>{pendingSplits.length} unsettled split{pendingSplits.length>1?"s":""}</div>
              </div>
              <button onClick={()=>{setSplitBannerSeen(true);LS.s("mt-split-banner",true);setTab("splits");setPeopleView("splits");}} style={{background:"none",border:"none",color:dark?"#30d158":"#16a34a",fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>View</button>
            </div>
          )}

          {/* Safe / Budget row */}
          <div style={{display:"flex",background:T.card,borderRadius:20,marginBottom:12,overflow:"hidden"}}>
            <div onClick={()=>{haptic(8);setTab("stats");setAnaView("budget");}} className="mt-tap" style={{flex:1,padding:"13px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>{I.flame(T.acc,14)}<span style={{fontSize:11,fontWeight:600,color:T.txt2}}>Safe / day</span></div>
              <AnimatedNumber value={safeToday} format={fmt} style={{fontSize:18,fontWeight:700,letterSpacing:-.4,color:safeToday>0?T.txt:T.txt3,fontVariantNumeric:"tabular-nums"}}/>
              <span style={{fontSize:10,color:T.txt3}}> · {daysLeft} d left</span>
            </div>
            <div style={{width:1,background:T.border,margin:"12px 0",flexShrink:0}}/>
            <div onClick={()=>{haptic(8);setTab("stats");setAnaView("budget");}} className="mt-tap" style={{flex:1,padding:"13px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>{I.budget(T.acc,14)}<span style={{fontSize:11,fontWeight:600,color:T.txt2}}>Budget left</span></div>
              {totalBudget>0?<>
                <AnimatedNumber value={Math.max(totalBudget-totalBudgetSpent,0)} format={fmt} style={{fontSize:18,fontWeight:700,letterSpacing:-.4,color:totalBudgetSpent>totalBudget?T.red:T.txt,fontVariantNumeric:"tabular-nums"}}/>
                <div style={{height:3,background:T.border,borderRadius:99,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,width:Math.min(totalBudgetSpent/totalBudget*100,100)+"%",background:totalBudgetSpent>totalBudget?T.red:T.green,transition:"width .6s"}}/></div>
              </>:<><div style={{fontSize:14,fontWeight:700,color:T.acc}}>Set up →</div><div style={{fontSize:10,color:T.txt3,marginTop:3}}>Track monthly limits</div></>}
            </div>
          </div>

          {overBudget.length>0&&(
            <div onClick={()=>{setTab("stats");setAnaView("budget");}} className="mt-press" style={{background:dark?"#2d0000":"#ffe5e3",border:`1px solid ${dark?"#5c1a1a":"#fca5a5"}`,borderRadius:20,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              {I.budget(dark?"#ff6b6b":"#b91c1c",17)}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:dark?"#ff6b6b":"#b91c1c"}}>{overBudget.length} budget{overBudget.length>1?"s":""} over limit</div>
                <div style={{fontSize:12,color:dark?"#ff8888":"#dc2626",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{overBudget.map(b=>b.label).join(", ")}</div>
              </div>
              <span style={{color:dark?"#ff6b6b":"#b91c1c",fontSize:12,fontWeight:600}}>View</span>
            </div>
          )}

          {insights.length>0&&(
            <div style={{marginBottom:12}}>
              <span className="mt-label" style={{color:T.txt3}}>Insights</span>
              <div className="mt-hscroll">
                {insights.map((ins,i)=>{
                  const tones={green:[T.green,dark?"#0c2a16":"#e7f9ee"],red:[T.red,dark?"#2d0000":"#ffe5e3"],blue:[T.acc,dark?"#001533":"#e7f0ff"]};
                  const [cc,bg]=tones[ins.tone]||tones.blue;
                  return(
                    <div key={i} onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:9,background:T.card,borderRadius:12,padding:"10px 13px",maxWidth:210}}>
                      <div style={{width:30,height:30,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ins.icon}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:10,color:T.txt3,whiteSpace:"nowrap"}}>{ins.label}</div>
                        <div style={{fontSize:14,fontWeight:700,color:cc,letterSpacing:-.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ins.value} <span style={{fontSize:10,fontWeight:400,color:T.txt3}}>{ins.sub}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="mt-label" style={{color:T.txt3}}>Income vs expenses</span>
            <div style={{background:T.card,borderRadius:20,padding:"14px 14px 10px",marginBottom:12}}>
              <MiniChart data={chartD} T={T} fmt={fmt}/>
            </div>
          </div>

          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span className="mt-label" style={{color:T.txt3}}>Recent</span>
              <button onClick={()=>goTxs("")} style={{background:"none",border:"none",color:T.acc,fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>See all</button>
            </div>
            <div style={{background:T.card,borderRadius:20,marginBottom:12,overflow:"hidden"}}>
              {recTxs.length===0?<div style={{padding:"14px 16px",color:T.txt3,fontSize:14}}>No transactions yet</div>
              :recTxs.map((t,i)=>{
                const c=getCat(t.category),a=accs.find(x=>x.id===t.accountId);
                const disp=personalAmt(t);
                return(
                  <div key={t.id} onClick={()=>{haptic(8);doEditTx(t);}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:11,padding:"10px 15px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                    <div style={{width:38,height:38,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant||"Unknown"}</div>
                        {t.isSplit&&<span style={{fontSize:10,fontWeight:600,background:dark?"#002e14":"#d4f5df",color:dark?"#30d158":"#16a34a",borderRadius:6,padding:"1px 5px",flexShrink:0}}>split</span>}
                      </div>
                      <div style={{fontSize:11,color:T.txt2}}>{a?.name||"?"} · {t.date}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:t.type==="income"?T.green:t.type==="expense"?T.red:T.txt2,fontVariantNumeric:"tabular-nums"}}>
                        {t.type==="income"?"+":t.type==="expense"?"−":"⇄"}{fmt(disp)}
                      </div>
                      {t.isSplit&&<div style={{fontSize:10,color:T.txt3}}>of {fmt(t.amount)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {goals.length>0&&(
            <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span className="mt-label" style={{color:T.txt3}}>Savings goals</span>
              <button onClick={()=>{haptic(8);setTab("goals");}} style={{background:"none",border:"none",color:T.acc,fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>See all</button>
            </div>
            <div onClick={()=>{haptic(8);setTab("goals");}} className="mt-tap" style={{background:T.card,borderRadius:20,padding:"13px 15px 4px",marginBottom:12}}>
              {goals.slice(0,2).map(g=>{
                const pct=Math.min(g.savedAmount/g.targetAmount*100,100);
                return(
                  <div key={g.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:5}}>
                      <span>{g.icon} {g.name}</span>
                      <span style={{fontWeight:600}}>{fmt(g.savedAmount)} <span style={{color:T.txt3,fontWeight:400}}>/ {fmt(g.targetAmount)}</span></span>
                    </div>
                    <div style={{height:6,background:T.border,borderRadius:99}}><div style={{height:"100%",borderRadius:99,background:g.color||T.acc,width:`${pct}%`,transition:"width .4s"}}/></div>
                    <div style={{fontSize:11,color:T.txt3,marginTop:3}}>{pct.toFixed(0)}% · {fmt(g.targetAmount-g.savedAmount)} to go</div>
                  </div>
                );
              })}
            </div>
            </div>
          )}

          <div style={{marginBottom:12}}>
            <span className="mt-label" style={{color:T.txt3}}>Top categories</span>
            <div style={{background:T.card,borderRadius:20,padding:"13px 15px 4px"}}>
              {catD.length===0?<div style={{color:T.txt3,fontSize:14,paddingBottom:10}}>No spending yet</div>
              :catD.slice(0,5).map(c=>(
                <div key={c.id} onClick={()=>{haptic(8);setTab("stats");setAnaView("spend");setDrillCat(c.id);}} className="mt-tap" style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                    <span style={{color:T.txt2}}>{c.icon} {c.label}</span>
                    <span style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(c.total)}</span>
                  </div>
                  <div style={{height:4,background:T.border,borderRadius:99}}><div style={{height:"100%",borderRadius:99,background:c.color,width:`${(c.total/mxCat)*100}%`,transition:"width .4s"}}/></div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ══ ACTIVITY ══ */}
        {tab==="txs"&&<>
          <div style={{position:"relative",marginBottom:10}}>
            <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}>{I.srch(T.txt3)}</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search merchant…" style={{display:"block",width:"100%",background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"12px 40px 12px 38px",fontSize:16,outline:"none"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",display:"flex"}}>{I.x(T.txt3)}</button>}
          </div>
          <div style={{display:"flex",gap:7,marginBottom:10}}>
            {[["","All"],["income","Income"],["expense","Expenses"],["transfer","Transfers"]].map(([v,l])=>(
              <button key={v} onClick={()=>{haptic(8);setFType(v);}} className="mt-press" style={{flex:1,padding:"8px 0",borderRadius:99,border:"none",background:fType===v?T.acc:T.card,color:fType===v?"#fff":T.txt2,fontWeight:600,fontSize:13,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {filtTxs.length>0&&(
            <div style={{fontSize:13,color:T.txt2,margin:"0 2px 10px"}}>
              {filtTxs.length} transaction{filtTxs.length>1?"s":""} · <strong style={{color:T.txt}}>{fmt(filtSummary.sum)}</strong> {filtSummary.verb}
            </div>
          )}
          <div style={{display:"flex",gap:8,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"9px 14px",fontSize:14,flexShrink:0,outline:"none"}}>
              <option value="">All categories</option>
              {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <select value={fAcc} onChange={e=>setFAcc(e.target.value)} style={{background:T.card,color:T.txt,border:"none",borderRadius:12,padding:"9px 14px",fontSize:14,flexShrink:0,outline:"none"}}>
              <option value="">All accounts</option>
              {accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {search&&filtTxs.length>0&&(
            <div style={{background:dark?"#001533":"#deeaff",borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",fontSize:14}}>
              <span style={{fontWeight:600,color:T.acc}}>"{search}"</span>
              {/* FIX: use personalAmt for search total */}
              <span style={{color:T.txt2}}>{filtTxs.length} txs · <strong style={{color:T.acc}}>{fmt(filtSummary.sum)}</strong></span>
            </div>
          )}
          <div style={{background:T.card,borderRadius:20,overflow:"hidden",marginBottom:12}}>
            {filtTxs.length===0?<div style={{padding:24,color:T.txt3,textAlign:"center",fontSize:14}}>No transactions found</div>
            :filtTxs.map((t,i)=>{
              const c=getCat(t.category),a=accs.find(x=>x.id===t.accountId);
              const disp=personalAmt(t);
              return(
                <div key={t.id} onClick={()=>{haptic(8);doEditTx(t);}} className="mt-tap" style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                      <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant||"Unknown"}</div>
                      {t.isSplit&&<span style={{fontSize:10,fontWeight:600,background:dark?"#002e14":"#d4f5df",color:dark?"#30d158":"#16a34a",borderRadius:6,padding:"1px 5px",flexShrink:0}}>{t.splitSettled?"✓":"split"}</span>}
                    </div>
                    <div style={{fontSize:12,color:T.txt2}}>{t.date} · {a?.name||"?"} · {c.label}</div>
                    {t.notes&&<div style={{fontSize:12,color:T.txt3,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.notes}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <span style={{fontWeight:700,fontSize:16,color:t.type==="income"?T.green:t.type==="expense"?T.red:T.txt2}}>
                      {t.type==="income"?"+":t.type==="expense"?"−":"⇄"}{fmt(disp)}
                    </span>
                    {t.isSplit&&<div style={{fontSize:10,color:T.txt3}}>full {fmt(t.amount)}</div>}
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={e=>{e.stopPropagation();doEditTx(t);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>{I.edit(T.acc)}</button>
                      <button onClick={e=>{e.stopPropagation();doDeleteTx(t.id);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>{I.trash(T.red)}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ══ PEOPLE ══ */}
        {tab==="splits"&&<>
          <div style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:20}}>People & Money</div>
            <div style={{fontSize:13,color:T.txt2,marginTop:1}}>{totalDebt>0&&`You owe ${fmt(totalDebt)} · `}Others owe you {fmt(totalOwed)}</div>
          </div>
          <SubNav view={peopleView} setView={setPeopleView} items={[["splits","Splits"],["debts","Debts"],["recurring","Recurring"]]}/>

          {peopleView==="splits"&&<>
            {pendingSplits.length>0&&(
              <div style={{background:dark?"#002e14":"#d4f5df",borderRadius:20,padding:"14px 16px",marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:16,color:dark?"#30d158":"#15803d",marginBottom:4}}>💸 {fmt(totalOwed)} to collect</div>
                <div style={{fontSize:13,color:dark?"#4ade80":"#16a34a",marginBottom:10}}>{pendingSplits.length} split{pendingSplits.length>1?"s":""} pending</div>
                <button onClick={settleAll} style={{background:dark?"#30d158":"#16a34a",color:"#fff",border:"none",borderRadius:12,padding:"11px 20px",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%"}}>Settle All → Log Income</button>
              </div>
            )}
            {pendingSplits.length===0
              ?<div style={{background:T.card,borderRadius:20,padding:"24px",textAlign:"center",color:T.txt3,fontSize:14,marginBottom:12}}>No pending splits 🎉</div>
              :<div style={{background:T.card,borderRadius:20,overflow:"hidden",marginBottom:12}}>
                {pendingSplits.map((t,i)=>{
                  const c=getCat(t.category),full=parseFloat(t.amount)||0,share=full/Math.max(t.splitPeople||1,1),owed=full-share;
                  return(
                    <div key={t.id} style={{padding:"13px 16px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                        <div style={{width:42,height:42,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:15}}>{t.merchant}</div><div style={{fontSize:12,color:T.txt2}}>{t.date} · {t.splitPeople} people</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:T.green,fontSize:15}}>+{fmt(owed)}</div><div style={{fontSize:11,color:T.txt3}}>owed to you</div></div>
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        {[["Full",fmt(full),T.red],["Your share",fmt(share),T.txt],["Others pay",fmt(owed),T.green]].map(([l,v,co])=>(
                          <div key={l} style={{flex:1,background:T.bg,borderRadius:12,padding:"8px 6px",textAlign:"center"}}>
                            <div style={{fontSize:10,color:T.txt3}}>{l}</div>
                            <div style={{fontWeight:700,color:co,marginTop:1,fontSize:12}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>settleSplit(t)} style={{width:"100%",background:"none",border:`1.5px solid ${T.acc}`,borderRadius:12,padding:"9px",color:T.acc,fontWeight:600,fontSize:14,cursor:"pointer"}}>Settle → Log Income</button>
                    </div>
                  );
                })}
              </div>
            }
          </>}

          {peopleView==="debts"&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,color:T.txt2}}>{activeDebts.length>0?`Total owed: ${fmt(totalDebt)}`:"No active debts"}</div>
              <button onClick={()=>{setDebtForm(iDebt);setEditId(null);setModal("debt");}} style={{display:"flex",alignItems:"center",gap:4,background:T.red,color:"#fff",border:"none",borderRadius:12,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                {I.plus("#fff",14)} Add Debt
              </button>
            </div>
            {activeDebts.length===0
              ?<div style={{background:T.card,borderRadius:20,padding:"32px 20px",textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:44,marginBottom:10}}>🙌</div>
                <div style={{fontWeight:600,fontSize:16,color:T.txt,marginBottom:6}}>No debts logged</div>
                <div style={{color:T.txt3,fontSize:14}}>Add a debt to track what you owe friends</div>
              </div>
              :<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
                {activeDebts.map(d=>{
                  const pct=Math.min(d.paidBack/d.totalAmount*100,100),remaining=d.totalAmount-d.paidBack;
                  const accName=accs.find(a=>a.id===d.receivedInAccount)?.name;
                  return(
                    <div key={d.id} style={{background:T.card,borderRadius:20,padding:"16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                        <div style={{width:52,height:52,borderRadius:20,background:d.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:24,flexShrink:0}}>{d.personName[0]?.toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:17}}>{d.personName}</div>
                          <div style={{fontSize:12,color:T.txt2}}>Borrowed {fmt(d.totalAmount)} · {d.date}</div>
                          {accName&&<div style={{fontSize:12,color:T.txt3}}>→ {accName}</div>}
                          {d.description&&<div style={{fontSize:12,color:T.txt3}}>{d.description}</div>}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontWeight:700,fontSize:20,color:T.red}}>{fmt(remaining)}</div>
                          <div style={{fontSize:11,color:T.txt3}}>left to pay</div>
                        </div>
                      </div>
                      <div style={{height:7,background:T.border,borderRadius:99,marginBottom:5,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:99,background:d.color,width:`${pct}%`,transition:"width .5s"}}/>
                      </div>
                      <div style={{fontSize:12,color:T.txt3,marginBottom:12}}>{pct.toFixed(0)}% paid · {fmt(d.paidBack)} of {fmt(d.totalAmount)}</div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>openRepay(d)} style={{flex:1,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Log Repayment</button>
                        <button onClick={()=>doEditDebt(d)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{I.edit(T.acc)}</button>
                        <button onClick={()=>delDebt(d.id)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{I.trash(T.red)}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
            {settledDebts.length>0&&<>
              <div style={{fontSize:13,fontWeight:600,color:T.txt2,marginBottom:8}}>Fully Paid ✓</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                {settledDebts.map(d=>(
                  <div key={d.id} style={{background:T.card,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,opacity:.55}}>
                    <div style={{width:40,height:40,borderRadius:12,background:d.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18,flexShrink:0}}>{d.personName[0]?.toUpperCase()}</div>
                    <div style={{flex:1}}><div style={{fontWeight:600,fontSize:15}}>{d.personName}</div><div style={{fontSize:12,color:T.txt2}}>{fmt(d.totalAmount)} · paid back 🎉</div></div>
                    <button onClick={()=>delDebt(d.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>{I.trash(T.red)}</button>
                  </div>
                ))}
              </div>
            </>}
            {settledDebts.length===0&&activeDebts.length===0&&<div style={{height:60}}/>}
          </>}

          {peopleView==="recurring"&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:14,color:T.txt2}}>{recurring.length} recurring transaction{recurring.length>1?"s":""}</div>
              <button onClick={()=>{setRecForm({...iRec,accountId:accs[0]?.id||""});setEditId(null);setModal("rec");}} style={{display:"flex",alignItems:"center",gap:4,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                {I.plus("#fff",14)} Add
              </button>
            </div>
            {recurring.length===0
              ?<div style={{background:T.card,borderRadius:20,padding:"24px",textAlign:"center",color:T.txt3,fontSize:14,marginBottom:12}}>No recurring transactions yet</div>
              :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                {recurring.map(r=>{
                  const c=getCat(r.category),isDue=recurringDue.find(x=>x.id===r.id);
                  return(
                    <div key={r.id} style={{background:T.card,borderRadius:20,padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:44,height:44,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,position:"relative"}}>
                          {c.icon}
                          {isDue&&<div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:99,background:"#fbbf24",border:"2px solid "+T.card}}/>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontWeight:600,fontSize:15}}>{r.merchant}</span>
                            {isDue&&<span style={{fontSize:10,fontWeight:600,background:dark?"#1a1000":"#fef3c7",color:dark?"#fbbf24":"#92400e",borderRadius:6,padding:"1px 5px"}}>due soon</span>}
                          </div>
                          <div style={{fontSize:12,color:T.txt2}}>Day {r.dayOfMonth} · {r.type} · {getCat(r.category).label}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontWeight:700,fontSize:15,color:r.type==="income"?T.green:T.red}}>{r.type==="income"?"+":"−"}{fmt(r.amount)}</div>
                          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                            <button onClick={()=>addRecurringNow(r)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.plus(T.acc,16)}</button>
                            <button onClick={()=>{setRecForm({merchant:r.merchant,amount:String(r.amount),category:r.category,accountId:r.accountId,type:r.type,dayOfMonth:r.dayOfMonth,active:r.active,notes:r.notes||""});setEditId(r.id);setModal("rec");}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                            <button onClick={()=>delRec(r.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </>}
        </>}

        {/* ══ GOALS ══ */}
        {tab==="goals"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:20}}>Savings Goals</div>
            <button onClick={()=>{setGoalForm(iGoal);setEditId(null);setModal("goal");}} style={{display:"flex",alignItems:"center",gap:6,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:600,fontSize:15,cursor:"pointer"}}>{I.plus("#fff",18)} Add</button>
          </div>
          {goals.length===0
            ?<div style={{background:T.card,borderRadius:20,padding:"32px 20px",textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:48,marginBottom:10}}>🎯</div>
              <div style={{fontWeight:600,fontSize:16,marginBottom:6}}>No goals yet</div>
              <div style={{color:T.txt3,fontSize:14}}>Set a savings goal to track progress</div>
            </div>
            :<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:12}}>
              {goals.map(g=>{
                const pct=Math.min(g.savedAmount/g.targetAmount*100,100),done=pct>=100;
                return(
                  <div key={g.id} onClick={()=>{haptic(8);doEditGoal(g);}} className="mt-tap" style={{background:T.card,borderRadius:20,padding:"18px 16px",position:"relative",overflow:"hidden"}}>
                    {done&&<div style={{position:"absolute",top:0,right:0,background:T.green,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:"0 18px 0 10px"}}>REACHED! 🎉</div>}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:54,height:54,borderRadius:20,background:(g.color||T.acc)+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{g.icon}</div>
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
        </>}

        {/* ══ ACCOUNTS (hidden) ══ */}
        {tab==="accs"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontWeight:700,fontSize:20}}>Accounts</div><div style={{fontSize:13,color:T.txt2,marginTop:1}}>Net: {fmt(totBal)}</div></div>
            <button onClick={()=>{setAccForm(iAcc);setEditId(null);setModal("acc");}} style={{display:"flex",alignItems:"center",gap:6,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:600,fontSize:15,cursor:"pointer"}}>{I.plus("#fff",18)} Add</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {accs.map(a=>{
              const bal=getBal(a.id),cnt=txs.filter(t=>t.accountId===a.id||t.toAccountId===a.id).length;
              return(
                <div key={a.id} onClick={()=>{haptic(8);setFType("");setSearch("");setFCat("");setFAcc(a.id);setTab("txs");}} className="mt-tap" style={{background:T.card,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:50,height:50,borderRadius:12,background:a.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:22,flexShrink:0}}>{a.name[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:16}}>{a.name}</div>
                    <div style={{fontSize:12,color:T.txt2,marginTop:2}}>{cnt} transactions · initial {fmt(a.ib)}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:700,fontSize:18,color:bal>=0?T.green:T.red}}>{fmt(bal)}</div>
                    <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:5}}>
                      <button onClick={e=>{e.stopPropagation();doEditAcc(a);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                      <button onClick={e=>{e.stopPropagation();delAcc(a.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ══ CATEGORIES (hidden) ══ */}
        {tab==="categories"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontWeight:700,fontSize:20}}>Categories</div><div style={{fontSize:13,color:T.txt2,marginTop:1}}>{cats.length} categories</div></div>
            <button onClick={()=>{setCatForm(iCat);setEditId(null);setModal("cat");}} style={{display:"flex",alignItems:"center",gap:6,background:T.acc,color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:600,fontSize:15,cursor:"pointer"}}>{I.plus("#fff",18)} Add</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {cats.map(c=>(
              <div key={c.id} style={{background:T.card,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{c.icon}</div>
                  <div><div style={{fontWeight:600,fontSize:16}}>{c.label}</div><div style={{fontSize:12,color:T.txt2}}>{c.id}</div></div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>doEditCat(c)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.edit(T.acc)}</button>
                  <button onClick={()=>delCat(c.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>{I.trash(T.red)}</button>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ══ ANALYTICS ══ */}
        {tab==="stats"&&<>
          <div style={{fontWeight:700,fontSize:20,marginBottom:14}}>Analytics</div>
          <SubNav view={anaView} setView={v=>{setAnaView(v);setDrillCat(null);}} items={[["spend","Spending"],["budget","Budgets"],["cal","Calendar"]]}/>

          {anaView==="spend"&&(drillCat?(()=>{
            const c=catD.find(x=>x.id===drillCat);if(!c)return null;
            return(<>
              <button onClick={()=>setDrillCat(null)} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",color:T.acc,fontSize:15,cursor:"pointer",marginBottom:12,fontWeight:500,padding:0}}>{I.back(T.acc)} Categories</button>
              <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:36}}>{c.icon}</span>
                <div><div style={{fontWeight:700,fontSize:17}}>{c.label}</div><div style={{fontSize:13,color:T.txt2}}>{fmt(c.total)} personal · {Object.keys(c.merchants).length} merchants</div></div>
              </div>
              <div style={{background:T.card,borderRadius:20,overflow:"hidden",marginBottom:12}}>
                {Object.entries(c.merchants).sort(([,a],[,b])=>b-a).map(([m,tot],i)=>{
                  const cnt=txs.filter(t=>t.merchant===m&&t.category===drillCat).length;
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
                  <div style={{width:48,height:48,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{c.icon}</div>
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
                      <div style={{width:40,height:40,borderRadius:12,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:15}}>{c.label}</div>
                        <div style={{fontSize:12,color:over?T.red:T.txt2,marginTop:1}}>{limit>0?`${fmt(spent)} of ${fmt(limit)}${over?" · over!":""}`:`${fmt(spent)} spent`}</div>
                      </div>
                      <div style={{position:"relative",width:96,flexShrink:0}}>
                        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.txt3,fontSize:14,pointerEvents:"none"}}>{mtSym()}</span>
                        <input type="number" inputMode="decimal" min="0" placeholder="—" defaultValue={limit||""} onChange={e=>setBudget(c.id,e.target.value)} style={{width:"100%",background:T.bg,color:T.txt,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"9px 10px 9px 22px",fontSize:15,textAlign:"right"}}/>
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
        </>}

        </div>
      </div>

      {/* FAB */}
      <button onPointerDown={onFabDown} className="mt-press"
        style={{position:"fixed",left:fabLeft,top:fabTopVal,width:62,height:62,borderRadius:31,background:`linear-gradient(135deg,${T.acc},${dark?"#0a3a9c":"#0051d5"})`,border:"none",boxShadow:`0 8px 26px ${T.acc}66`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,touchAction:"none",userSelect:"none",transition:fabDrag?"none":"top .28s cubic-bezier(.22,1,.36,1),left .28s cubic-bezier(.22,1,.36,1)"}}>
        {I.plus("#fff",30)}
      </button>

      {/* Tab bar */}
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:90,paddingBottom:"calc(env(safe-area-inset-bottom) + 10px)",pointerEvents:"none"}}>
        <div style={{maxWidth:"100%",margin:"0 auto",padding:"0 14px"}}>
          <div style={{pointerEvents:"auto",display:"flex",gap:2,background:dark?"rgba(28,28,30,.82)":"rgba(255,255,255,.84)",backdropFilter:"saturate(180%) blur(22px)",WebkitBackdropFilter:"saturate(180%) blur(22px)",borderRadius:26,padding:"7px 6px",boxShadow:dark?"0 8px 32px rgba(0,0,0,.55)":"0 8px 32px rgba(0,0,0,.16)",border:`1px solid ${dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.05)"}`}}>
            {TABS.map(({id,lbl,ic})=>{
              const act=tab===id,col=act?T.acc:T.txt3;
              const badge=id==="splits"&&(pendingSplits.length>0||recurringDue.length>0||activeDebts.length>0);
              return(
                <button key={id} onClick={()=>{haptic(8);setTab(id);}} className="mt-press"
                  style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:act?T.acc+"18":"transparent",border:"none",cursor:"pointer",padding:"8px 0 6px",borderRadius:20,color:col,position:"relative",transition:"background .25s"}}>
                  {ic(col)}
                  {badge&&<div style={{position:"absolute",top:6,right:"calc(50% - 14px)",width:8,height:8,borderRadius:99,background:T.red,border:`2px solid ${dark?"#262628":"#fff"}`}}/>}
                  <span style={{fontSize:10.5,fontWeight:act?700:500}}>{lbl}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TRANSACTION SHEET ── */}
      <Sheet open={modal==="tx"} onClose={closeM} title={editId?"Edit Transaction":"New Transaction"} T={T}>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[["expense","💸 Expense"],["income","💰 Income"],["transfer","🔄 Transfer"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTxForm(f=>({...f,type:v}))} style={{flex:1,padding:"11px 4px",borderRadius:12,border:`2px solid ${txForm.type===v?T.acc:T.border}`,background:txForm.type===v?T.acc:"transparent",color:txForm.type===v?"#fff":T.txt2,fontWeight:600,fontSize:13,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Amount (${mtSym()})`}/><input type="number" step="0.01" min="0" placeholder="0.00" value={txForm.amount} onChange={e=>setTxForm(f=>({...f,amount:e.target.value}))} style={inp}/></div>
          <div><Label text="Date"/><input type="date" value={txForm.date} onChange={e=>setTxForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:14}}>
          {[1,5,10,20,50].map(v=>(
            <button key={v} onClick={()=>setTxForm(f=>({...f,amount:String(Math.round(((parseFloat(f.amount)||0)+v)*100)/100)}))} style={{flex:1,padding:"9px 0",borderRadius:12,border:`1.5px solid ${T.border}`,background:T.bg,color:T.txt,fontWeight:600,fontSize:14,cursor:"pointer"}}>+{v}</button>
          ))}
          <button onClick={()=>setTxForm(f=>({...f,amount:""}))} style={{padding:"9px 12px",borderRadius:12,border:`1.5px solid ${T.border}`,background:T.bg,color:T.red,fontWeight:700,fontSize:14,cursor:"pointer"}}>C</button>
        </div>
        <div style={{marginBottom:14}}><Label text="Merchant / Payee"/><input type="text" placeholder="e.g. Kaufland, Apple Music…" value={txForm.merchant} onChange={e=>setTxForm(f=>({...f,merchant:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text="Account"/><select value={txForm.accountId} onChange={e=>setTxForm(f=>({...f,accountId:e.target.value}))} style={inp}><option value="">Select…</option>{accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          {txForm.type==="transfer"
            ?<div><Label text="To Account"/><select value={txForm.toAccountId} onChange={e=>setTxForm(f=>({...f,toAccountId:e.target.value}))} style={inp}><option value="">Select…</option>{accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            :<div><Label text="Category"/><select value={txForm.category} onChange={e=>setTxForm(f=>({...f,category:e.target.value}))} style={inp}>{cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
          }
        </div>
        {txForm.type==="expense"&&(
          <div style={{background:T.bg,borderRadius:12,padding:"13px 14px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:txForm.isSplit?10:0}}>
              <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Split with others</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>WG, friends, group expenses</div></div>
              <Toggle value={txForm.isSplit} onChange={v=>setTxForm(f=>({...f,isSplit:v}))} T={T}/>
            </div>
            {txForm.isSplit&&<div>
              <Label text="Number of people (including you)"/>
              <div style={{display:"flex",gap:8}}>
                {[2,3,4,5,6].map(n=><button key={n} onClick={()=>setTxForm(f=>({...f,splitPeople:n}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`2px solid ${txForm.splitPeople===n?T.acc:T.border}`,background:txForm.splitPeople===n?T.acc:"transparent",color:txForm.splitPeople===n?"#fff":T.txt2,fontWeight:600,fontSize:15,cursor:"pointer"}}>{n}</button>)}
              </div>
              {txForm.amount&&<div style={{marginTop:10,background:dark?"#002e14":"#d4f5df",borderRadius:12,padding:"10px 12px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,color:dark?"#4ade80":"#16a34a"}}>Your share</span>
                <span style={{fontWeight:700,fontSize:15,color:dark?"#30d158":"#15803d"}}>{fmt(parseFloat(txForm.amount)/(txForm.splitPeople||2))}</span>
              </div>}
            </div>}
          </div>
        )}
        <div style={{marginBottom:20}}><Label text="Notes (optional)"/><input type="text" placeholder="Any notes…" value={txForm.notes} onChange={e=>setTxForm(f=>({...f,notes:e.target.value}))} style={inp}/></div>
        {(()=>{
          const dis=!txForm.amount||!txForm.accountId||(txForm.type==="transfer"&&!txForm.toAccountId);
          return <button onClick={doAddTx} disabled={dis} style={{display:"block",width:"100%",background:dis?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:dis?"not-allowed":"pointer",marginBottom:4}}>{editId?"Save Changes":"Add Transaction"}</button>;
        })()}
      </Sheet>

      {/* ── DEBT SHEET ── */}
      <Sheet open={modal==="debt"} onClose={closeM} title={editId?"Edit Debt":"Add Debt"} T={T}>
        <div style={{marginBottom:14}}><Label text="Person's Name"/><input type="text" placeholder="e.g. Sara, Raj, Max…" value={debtForm.personName} onChange={e=>setDebtForm(f=>({...f,personName:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Borrowed (${mtSym()})`}/><input type="number" step="0.01" min="0" placeholder="0.00" value={debtForm.totalAmount} onChange={e=>setDebtForm(f=>({...f,totalAmount:e.target.value}))} style={inp}/></div>
          <div>
            <Label text={`Already paid back (${mtSym()})`}/>
            {/* FIX: cap paidBack at totalAmount in input */}
            <input type="number" step="0.01" min="0"
              max={debtForm.totalAmount||undefined}
              placeholder="0"
              value={debtForm.paidBack}
              onChange={e=>{
                const total=parseFloat(debtForm.totalAmount)||0;
                const val=parseFloat(e.target.value)||0;
                setDebtForm(f=>({...f,paidBack:String(total>0?Math.min(val,total):val)}));
              }}
              style={inp}/>
          </div>
        </div>
        <div style={{marginBottom:14}}><Label text="Date Borrowed"/><input type="date" value={debtForm.date} onChange={e=>setDebtForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
        {!editId&&(
          <div style={{marginBottom:14}}>
            <Label text="Money received into account"/>
            <select value={debtForm.receivedInAccount} onChange={e=>setDebtForm(f=>({...f,receivedInAccount:e.target.value}))} style={inp}>
              <option value="">Don't log (I'll do it manually)</option>
              {accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {debtForm.receivedInAccount&&(
              <div style={{marginTop:8,background:dark?"#002e14":"#d4f5df",borderRadius:12,padding:"9px 12px",fontSize:13,color:dark?"#4ade80":"#16a34a",fontWeight:500}}>
                ✓ Will add +{debtForm.totalAmount?fmt(parseFloat(debtForm.totalAmount)):fmt(0)} income to {accs.find(a=>a.id===debtForm.receivedInAccount)?.name} on {debtForm.date}
                {parseFloat(debtForm.paidBack)>0&&<div style={{marginTop:4}}>And −{fmt(Math.min(parseFloat(debtForm.paidBack),parseFloat(debtForm.totalAmount)||0))} for prior repayment</div>}
              </div>
            )}
          </div>
        )}
        <div style={{marginBottom:14}}><Label text="Description (optional)"/><input type="text" placeholder="e.g. for groceries, emergency…" value={debtForm.description} onChange={e=>setDebtForm(f=>({...f,description:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:22}}><Label text="Color"/><input type="color" value={debtForm.color} onChange={e=>setDebtForm(f=>({...f,color:e.target.value}))} style={{width:"100%",height:52,border:`1.5px solid ${T.inpB}`,borderRadius:12,background:T.inp,cursor:"pointer",padding:4,display:"block"}}/></div>
        <button onClick={doAddDebt} disabled={!debtForm.personName||!debtForm.totalAmount} style={{display:"block",width:"100%",background:!debtForm.personName||!debtForm.totalAmount?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!debtForm.personName||!debtForm.totalAmount?"not-allowed":"pointer",marginBottom:4}}>
          {editId?"Save Changes":"Add Debt"}
        </button>
      </Sheet>

      {/* ── REPAYMENT SHEET ── */}
      <Sheet open={modal==="repay"} onClose={closeM} title="Log Repayment" T={T}>
        {(()=>{
          const debt=debts.find(x=>x.id===repayForm.debtId);
          if(!debt)return null;
          const remaining=debt.totalAmount-debt.paidBack;
          const chips=[10,20,50].filter(v=>v<remaining);
          return(<>
            <div style={{background:T.bg,borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:12,background:debt.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:22,flexShrink:0}}>{debt.personName[0]?.toUpperCase()}</div>
              <div><div style={{fontWeight:700,fontSize:16,color:T.txt}}>{debt.personName}</div><div style={{fontSize:13,color:T.red,fontWeight:600}}>{fmt(remaining)} remaining</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div><Label text={`Amount (${mtSym()})`}/><input type="number" step="0.01" min="0" placeholder="0.00" value={repayForm.amount} onChange={e=>setRepayForm(f=>({...f,amount:e.target.value}))} style={inp}/></div>
              <div><Label text="Date"/><input type="date" value={repayForm.date} onChange={e=>setRepayForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:dark?"dark":"light"}}/></div>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              {chips.map(v=><button key={v} onClick={()=>setRepayForm(f=>({...f,amount:String(v)}))} style={{flex:1,padding:"9px 0",borderRadius:12,border:`1.5px solid ${T.border}`,background:T.bg,color:T.txt,fontWeight:600,fontSize:14,cursor:"pointer"}}>{mtSym()}{v}</button>)}
              {remaining>20&&<button onClick={()=>setRepayForm(f=>({...f,amount:String((Math.ceil(remaining/2*100)/100).toFixed(2))}))} style={{flex:1,padding:"9px 0",borderRadius:12,border:`1.5px solid ${T.border}`,background:T.bg,color:T.txt,fontWeight:600,fontSize:14,cursor:"pointer"}}>Half</button>}
              <button onClick={()=>setRepayForm(f=>({...f,amount:String(remaining.toFixed(2))}))} style={{flex:1,padding:"9px 0",borderRadius:12,border:`2px solid ${T.acc}`,background:T.acc+"18",color:T.acc,fontWeight:700,fontSize:14,cursor:"pointer"}}>Full</button>
            </div>
            <div style={{marginBottom:14}}><Label text="From Account"/><select value={repayForm.accountId} onChange={e=>setRepayForm(f=>({...f,accountId:e.target.value}))} style={inp}><option value="">Select…</option>{accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div style={{marginBottom:20}}><Label text="Notes (optional)"/><input type="text" placeholder="Any notes…" value={repayForm.notes} onChange={e=>setRepayForm(f=>({...f,notes:e.target.value}))} style={inp}/></div>
            <button onClick={doRepay} disabled={!repayForm.amount||!repayForm.accountId} style={{display:"block",width:"100%",background:!repayForm.amount||!repayForm.accountId?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!repayForm.amount||!repayForm.accountId?"not-allowed":"pointer",marginBottom:4}}>Log Repayment</button>
          </>);
        })()}
      </Sheet>

      {/* ── ACCOUNT SHEET ── */}
      <Sheet open={modal==="acc"} onClose={closeM} title={editId?"Edit Account":"New Account"} T={T}>
        <div style={{marginBottom:14}}><Label text="Account Name"/><input type="text" placeholder="e.g. N26, Cash, Savings…" value={accForm.name} onChange={e=>setAccForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:14}}><Label text={`Starting Balance (${mtSym()})`}/><input type="number" step="0.01" placeholder="0.00" value={accForm.ib} onChange={e=>setAccForm(f=>({...f,ib:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:22}}><Label text="Color"/><input type="color" value={accForm.color} onChange={e=>setAccForm(f=>({...f,color:e.target.value}))} style={{width:"100%",height:52,border:`1.5px solid ${T.inpB}`,borderRadius:12,background:T.inp,cursor:"pointer",padding:4,display:"block"}}/></div>
        <button onClick={doAddAcc} disabled={!accForm.name} style={{display:"block",width:"100%",background:!accForm.name?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!accForm.name?"not-allowed":"pointer",marginBottom:4}}>{editId?"Save Changes":"Add Account"}</button>
      </Sheet>

      {/* ── CATEGORY SHEET ── */}
      <Sheet open={modal==="cat"} onClose={closeM} title={editId?"Edit Category":"New Category"} T={T}>
        <div style={{marginBottom:14}}><Label text="Category Name"/><input type="text" placeholder="e.g. Dining, Groceries…" value={catForm.label} onChange={e=>setCatForm(f=>({...f,label:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:14}}><Label text="Icon (emoji)"/><input type="text" placeholder="🛒" value={catForm.icon} onChange={e=>setCatForm(f=>({...f,icon:e.target.value}))} style={inp}/></div>
        <div style={{marginBottom:22}}><Label text="Color"/><input type="color" value={catForm.color} onChange={e=>setCatForm(f=>({...f,color:e.target.value}))} style={{width:"100%",height:52,border:`1.5px solid ${T.inpB}`,borderRadius:12,background:T.inp,cursor:"pointer",padding:4,display:"block"}}/></div>
        <button onClick={doAddCat} disabled={!catForm.label} style={{display:"block",width:"100%",background:!catForm.label?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!catForm.label?"not-allowed":"pointer",marginBottom:4}}>{editId?"Save Changes":"Save Category"}</button>
      </Sheet>

      {/* ── GOAL SHEET ── */}
      <Sheet open={modal==="goal"} onClose={closeM} title={editId?"Edit Goal":"New Savings Goal"} T={T}>
        <div style={{marginBottom:14}}><Label text="Goal Name"/><input type="text" placeholder="e.g. Trip home, New laptop…" value={goalForm.name} onChange={e=>setGoalForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Target (${mtSym()})`}/><input type="number" step="1" min="0" placeholder="400" value={goalForm.targetAmount} onChange={e=>setGoalForm(f=>({...f,targetAmount:e.target.value}))} style={inp}/></div>
          <div><Label text={`Saved so far (${mtSym()})`}/><input type="number" step="1" min="0" placeholder="0" value={goalForm.savedAmount} onChange={e=>setGoalForm(f=>({...f,savedAmount:e.target.value}))} style={inp}/></div>
        </div>
        <div style={{marginBottom:14}}><Label text="Icon"/><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{GOAL_ICONS.map(ic=><button key={ic} onClick={()=>setGoalForm(f=>({...f,icon:ic}))} style={{width:44,height:44,borderRadius:12,border:`2px solid ${goalForm.icon===ic?T.acc:T.border}`,background:goalForm.icon===ic?T.acc+"18":"transparent",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{ic}</button>)}</div></div>
        <div style={{marginBottom:22}}><Label text="Color"/><input type="color" value={goalForm.color} onChange={e=>setGoalForm(f=>({...f,color:e.target.value}))} style={{width:"100%",height:52,border:`1.5px solid ${T.inpB}`,borderRadius:12,background:T.inp,cursor:"pointer",padding:4,display:"block"}}/></div>
        <button onClick={doAddGoal} disabled={!goalForm.name||!goalForm.targetAmount} style={{display:"block",width:"100%",background:!goalForm.name||!goalForm.targetAmount?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!goalForm.name||!goalForm.targetAmount?"not-allowed":"pointer",marginBottom:4}}>{editId?"Save Changes":"Create Goal"}</button>
      </Sheet>

      {/* ── RECURRING SHEET ── */}
      <Sheet open={modal==="rec"} onClose={closeM} title={editId?"Edit Recurring":"New Recurring Transaction"} T={T}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["expense","💸 Expense"],["income","💰 Income"]].map(([v,l])=><button key={v} onClick={()=>setRecForm(f=>({...f,type:v}))} style={{flex:1,padding:"11px 4px",borderRadius:12,border:`2px solid ${recForm.type===v?T.acc:T.border}`,background:recForm.type===v?T.acc:"transparent",color:recForm.type===v?"#fff":T.txt2,fontWeight:600,fontSize:14,cursor:"pointer"}}>{l}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text={`Amount (${mtSym()})`}/><input type="number" step="0.01" min="0" placeholder="0.00" value={recForm.amount} onChange={e=>setRecForm(f=>({...f,amount:e.target.value}))} style={inp}/></div>
          <div><Label text="Day of month"/><input type="number" min="1" max="31" placeholder="1" value={recForm.dayOfMonth} onChange={e=>setRecForm(f=>({...f,dayOfMonth:e.target.value}))} style={inp}/></div>
        </div>
        <div style={{marginBottom:14}}><Label text="Merchant / Name"/><input type="text" placeholder="e.g. Apple Music, Rent…" value={recForm.merchant} onChange={e=>setRecForm(f=>({...f,merchant:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Label text="Account"/><select value={recForm.accountId} onChange={e=>setRecForm(f=>({...f,accountId:e.target.value}))} style={inp}><option value="">Select…</option>{accs.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <div><Label text="Category"/><select value={recForm.category} onChange={e=>setRecForm(f=>({...f,category:e.target.value}))} style={inp}>{cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
        </div>
        <div style={{marginBottom:20}}><Label text="Notes (optional)"/><input type="text" placeholder="Any notes…" value={recForm.notes} onChange={e=>setRecForm(f=>({...f,notes:e.target.value}))} style={inp}/></div>
        <button onClick={doAddRec} disabled={!recForm.merchant||!recForm.amount||!recForm.accountId} style={{display:"block",width:"100%",background:!recForm.merchant||!recForm.amount||!recForm.accountId?T.txt3:T.acc,color:"#fff",border:"none",borderRadius:12,padding:17,fontWeight:700,fontSize:17,cursor:!recForm.merchant||!recForm.amount||!recForm.accountId?"not-allowed":"pointer",marginBottom:4}}>{editId?"Save Changes":"Save Recurring"}</button>
      </Sheet>

      {/* ── NOTIFICATIONS SHEET ── */}
      <Sheet open={modal==="notifs"} onClose={closeM} title="Notifications" T={T}>
        {notifs.length===0
          ?<div style={{textAlign:"center",padding:"30px 0 40px",color:T.txt3}}><div style={{fontSize:42,marginBottom:8}}>🔔</div><div style={{fontWeight:600,fontSize:15,color:T.txt2}}>All caught up</div></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:12}}>
            {notifs.map(n=>{
              const cc=({blue:T.acc,red:T.red,green:T.green})[n.tone]||T.acc;
              return(
                <button key={n.k} onClick={()=>{sdn(prev=>[...prev,n.k]);setTab(n.tab);if(n.ana)setAnaView(n.ana);if(n.pv)setPeopleView(n.pv);closeM();}} className="mt-press"
                  style={{display:"flex",alignItems:"center",gap:12,background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{width:38,height:38,borderRadius:12,background:cc+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
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

      {/* ── SETTINGS SHEET ── */}
      <Sheet open={modal==="settings"} onClose={closeM} title="Settings & Data" T={T}>
        <input type="file" ref={fileRef} accept=".json" style={{display:"none"}} onChange={doImport}/>
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
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <button onClick={()=>{setTab("accs");closeM();}} style={{flex:1,display:"flex",alignItems:"center",gap:10,background:T.card,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:36,height:36,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.wallet(T.acc)}</div>
            <div><div style={{fontWeight:600,fontSize:14,color:T.txt}}>Accounts</div><div style={{fontSize:12,color:T.txt2,marginTop:2}}>Manage bank accounts</div></div>
          </button>
          <button onClick={()=>{setTab("categories");closeM();}} style={{flex:1,display:"flex",alignItems:"center",gap:10,background:T.card,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:36,height:36,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.goal(T.acc)}</div>
            <div><div style={{fontWeight:600,fontSize:14,color:T.txt}}>Categories</div><div style={{fontSize:12,color:T.txt2,marginTop:2}}>Manage categories</div></div>
          </button>
        </div>
        <button onClick={()=>{setTab("stats");setAnaView("budget");closeM();}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"15px 16px",cursor:"pointer",textAlign:"left",marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.acc+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.budget(T.acc,20)}</div>
          <div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Monthly Budgets</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Set limits per category</div></div>
        </button>
        <div style={{marginBottom:10}}><Label text="Currency & Region"/></div>
        <div style={{fontSize:12,color:T.txt2,marginTop:-4,marginBottom:10}}>Sets your currency and how amounts are written (e.g. 1.000,00 vs 1,000.00) everywhere in the app.</div>
        <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:20}}>
          {window.CURRENCIES.map((c,i)=>{
            const sel=curId===c.id;
            const ex=new Intl.NumberFormat(c.loc,{style:"currency",currency:c.cur}).format(1234.56);
            return (
              <React.Fragment key={c.id}>
                {i>0&&<div style={{height:1,background:T.border}}/>}
                <button className="mt-tap" onClick={()=>setCur(c.id)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:sel?T.acc+"18":"transparent",border:"none",padding:"13px 16px",cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{c.flag}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:15,color:T.txt}}>{c.country} · {c.cur}</div>
                    <div style={{fontSize:12,color:T.txt2,marginTop:1,fontVariantNumeric:"tabular-nums"}}>{ex}</div>
                  </div>
                  {sel&&<span style={{flexShrink:0}}>{I.check(T.acc)}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{marginBottom:10}}><Label text="Preferences"/></div>
        <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>{I.lock(T.acc,20)}<div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>App Lock</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>{pin?"Enabled":"4-digit passcode"}</div></div></div>
            <Toggle value={!!pin} onChange={v=>{v?setPinFlow("set"):setPinFlow("disable");}} T={T}/>
          </div>
          <div style={{height:1,background:T.border}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>📳</span><div><div style={{fontWeight:600,fontSize:15,color:T.txt}}>Haptic feedback</div><div style={{fontSize:12,color:T.txt2,marginTop:1}}>Vibrate on taps</div></div></div>
            <Toggle value={hapticsOn} onChange={setHap} T={T}/>
          </div>
        </div>
        <div style={{marginBottom:10}}><Label text="Stats"/></div>
        <div style={{background:T.bg,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {[["Transactions",txs.length],["Accounts",accs.length],["Goals",goals.length],["Debts",debts.length],["Recurring",recurring.length]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:14,color:T.txt2}}>{l}</span>
              <span style={{fontSize:14,fontWeight:600,color:T.txt}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 16px",background:dark?"#2d0000":"#ffdede",borderRadius:12}}>
          <div style={{fontWeight:600,fontSize:14,color:dark?"#ff453a":"#c0392b",marginBottom:4}}>⚠️ Danger zone</div>
          <div style={{fontSize:12,color:dark?"#ff6b6b":"#7f1d1d",marginBottom:10}}>Permanently deletes all your data.</div>
          <button onClick={()=>{if(confirm("Delete ALL data?")){sa(DEFACCS);st([]);sg([]);sr([]);sd([]);sb({});LS.s("mt-onboarded",null);setOnbDone(false);closeM();showToast("Starting fresh…",false);}}} style={{background:dark?"#ff453a":"#c0392b",color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Clear all data</button>
        </div>
        <div style={{textAlign:"center",fontSize:12,color:T.txt3,marginTop:14}}>MoneyTrack {window.MT_VERSION}</div>
        <div style={{height:16}}/>
      </Sheet>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
