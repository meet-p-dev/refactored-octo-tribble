"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATS, DEFACCS, CURRENCIES, LT, DK } from "@/lib/constants";
import { LS, fmt, uid, tod, personalAmt, haptic, setCurrencyId, notify, MT_VERSION } from "@/lib/utils";
import { isCredit, cardStats } from "@/lib/credit";
import { classifyAll, counterpartyKey, bumpPayeeStats, setPayeeCat, migrateRulesToStats, LABEL_CLS } from "@/lib/classify";
import { merchantCategory } from "@/lib/merchants";
import { I } from "@/lib/icons";
import { Confetti } from "@/components/Confetti";
import { PinLock } from "@/components/PinLock";
import { OnboardFlow } from "@/components/OnboardFlow";
import { SubNav } from "@/components/SubNav";
import { HomeTab } from "@/components/tabs/HomeTab";
import { ActivityTab } from "@/components/tabs/ActivityTab";
import { PeopleTab } from "@/components/tabs/PeopleTab";
import { GoalsTab } from "@/components/tabs/GoalsTab";
import { AccountsPanel } from "@/components/tabs/AccountsPanel";
import { CategoriesPanel } from "@/components/tabs/CategoriesPanel";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { TxSheet } from "@/components/sheets/TxSheet";
import { DebtSheet } from "@/components/sheets/DebtSheet";
import { RepaySheet } from "@/components/sheets/RepaySheet";
import { AccSheet } from "@/components/sheets/AccSheet";
import { CardSheet } from "@/components/sheets/CardSheet";
import { CatSheet } from "@/components/sheets/CatSheet";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { NotifsSheet } from "@/components/sheets/NotifsSheet";
import { SettingsSheet } from "@/components/sheets/SettingsSheet";
import { BankSyncSheet } from "@/components/sheets/BankSyncSheet";
import { CurrencySheet } from "@/components/sheets/CurrencySheet";
import { ReviewSheet } from "@/components/sheets/ReviewSheet";
import { currentUser, signInPassword, signOut, changePassword, sendPasswordReset, completePasswordReset, fetchBankData, startConnect, finishConnect, subscribeTx, onAuthChange, deleteBankAccount, updateBankAccount, fetchPrefs, savePrefs } from "@/lib/bankSync";

export function App(){
  const [accs,setAccs]           =useState([]);
  const [cats,setCats]           =useState([]);
  const [txs,setTxs]             =useState([]);
  const [goals,setGoals]         =useState([]);
  const [recurring,setRecurring] =useState([]);
  const [debts,setDebts]         =useState([]);
  // SSR-safe: never read matchMedia during the initial render (server has no window,
  // and using it there would make the first client render mismatch the server HTML).
  // Falls back to light, then applies the system preference in the mount effect below
  // if there's no explicit stored preference.
  const [dark,setDark]           =useState(()=>LS.g("mt-dark")??false);
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
  const [anaView,setAnaView]     =useState("spend");
  const [spendMonth,setSpendMonth]=useState(()=>tod().slice(0,7)); // Insights→Spending scope: "all" | "yyyy-mm"
  const [confetti,setConfetti]   =useState(false);
  const [debtBannerSeen,setDebtBannerSeen]       =useState(()=>LS.g("mt-debt-banner")||false);
  const [notifOn,setNotifOn]                     =useState(false);
  const [dismissedNotifs,setDismissedNotifs]     =useState([]);
  const [calMonth,setCalMonth]   =useState(()=>tod().slice(0,7));
  const [peopleView,setPeopleView]=useState("debts");
  const [walletView,setWalletView]=useState("accounts");
  const [cardId,setCardId]     =useState(null);
  const [sbUser,setSbUser]=useState(null);
  const [bankConns,setBankConns]=useState([]);
  const [recoveryMode,setRecoveryMode]=useState(false);
  // Bank-credit classification: learned per-payee label counts (Bayesian prior),
  // one-off per-tx decisions, and your own name (own-transfer detection).
  const [payeeStats,setPayeeStats]=useState({});
  const [txDecisions,setTxDecisions]=useState({});
  const [ownerName,setOwnerName]=useState("");
  // Manual "my share" per expense (txId → amount). Overrides the classifier's automatic
  // rent-share netting, which can't always guess a split correctly.
  const [shareOverrides,setShareOverrides]=useState({});
  const fileRef=useRef();
  const T=dark?DK:LT;
  // Paint the page canvas (html/body) to match the theme. Without this the canvas is
  // transparent → white, and shows through wherever the 100dvh root doesn't reach
  // (iOS safe-area insets, rubber-band overscroll).
  useEffect(()=>{
    const el=document.documentElement;
    el.style.setProperty("--mt-bg",T.bg);
    el.style.colorScheme=dark?"dark":"light";
  },[dark,T.bg]);
  const fireConfetti=()=>{setConfetti(true);haptic([12,40,12,40,18]);setTimeout(()=>setConfetti(false),2600);};

  const iTx={date:tod(),type:"expense",amount:"",merchant:"",category:"other",accountId:"",toAccountId:"",notes:"",isSplit:false,splitPeople:2,splitSettled:false,_share:"",_catTouched:false};
  const iAcc={name:"",color:"#3b82f6",ib:"",kind:"cash",creditLimit:"",owed:"",statementDay:"",dueDay:"",apr:"",payFromId:"",autopay:false,billPayee:"",_balMode:"start",_currentBal:""};
  const iCat={label:"",icon:"📦",sym:"box",color:"#9ca3af"};
  const iGoal={name:"",targetAmount:"",savedAmount:"",icon:"🎯",sym:"goal",color:"#007aff"};
  const iDebt={personName:"",totalAmount:"",paidBack:"0",date:tod(),description:"",color:"#e11d48",receivedInAccount:""};
  const iRepay={debtId:"",amount:"",date:tod(),accountId:"",notes:""};

  const [txForm,setTxForm]       =useState(iTx);
  const [accForm,setAccForm]     =useState(iAcc);
  const [catForm,setCatForm]     =useState(iCat);
  const [goalForm,setGoalForm]   =useState(iGoal);
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
    // v2 learning store; migrate v1 single-rule store on first run
    const stats=LS.g("mt-payee-stats");
    if(stats)setPayeeStats(stats);
    else{const mig=migrateRulesToStats(LS.g("mt-payee-rules")||{});setPayeeStats(mig);if(Object.keys(mig).length)LS.s("mt-payee-stats",mig);}
    setTxDecisions(LS.g("mt-tx-decisions")||{});
    setShareOverrides(LS.g("mt-share-overrides")||{});
    setOwnerName(LS.g("mt-owner-name")||"");
    // Notifications: only "on" if the user opted in AND the browser still grants permission.
    setNotifOn(LS.g("mt-notif-enabled")===true && typeof window!=="undefined" && "Notification" in window && Notification.permission==="granted");
    // prune stale dismissed notif IDs to prevent unbounded growth
    const dn=LS.g("mt-dismissed-notifs")||[];
    setDismissedNotifs(dn.slice(-200));
    const sp=LS.g("mt-pin");if(sp){setPin(sp);setLocked(true);}
    if(!LS.g("mt-accs"))LS.s("mt-accs",DEFACCS);
    if(!LS.g("mt-cats"))LS.s("mt-cats",CATS);
    if(LS.g("mt-dark")==null){
      const sysDark=window.matchMedia?.("(prefers-color-scheme:dark)").matches??false;
      if(sysDark)setDark(true);
    }
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
  // `openBank` — onboarding's "Connect a bank" finishes the flow AND drops the user
  // straight into the bank sheet, so a fresh install never sits on an empty Home
  // wondering where accounts come from.
  const finishOnboarding=p=>{if(p&&p.apply){sa(p.accs);st([]);sg([]);sr([]);sd([]);sb({});}LS.s("mt-onboarded",MT_VERSION);setOnbDone(true);if(p&&p.openBank)setModal("banksync");};
  useEffect(()=>{if(LS.g("mt-cat-migrated"))return;const cur=LS.g("mt-txs")||[];let ch=false;const nx=cur.map(t=>{if(t.type==="transfer"&&t.category!=="transfer"){ch=true;return{...t,category:"transfer"};}if(/^(Borrowed from |Repayment )/.test(t.merchant||"")&&t.category!=="debt"){ch=true;return{...t,category:"debt"};}return t;});if(ch){LS.s("mt-txs",nx);setTxs(nx);}LS.s("mt-cat-migrated",true);},[]);
  const sdn=v=>{const next=typeof v==="function"?v(dismissedNotifs):v;const pruned=next.slice(-200);setDismissedNotifs(pruned);LS.s("mt-dismissed-notifs",pruned);};
  // Migration: existing installs have a stored category list without the new "received"
  // categories (Reimbursement / Refund). Append them once so they're selectable everywhere.
  useEffect(()=>{
    if(LS.g("mt-cat-migrated-received"))return;
    const cur=LS.g("mt-cats")||CATS;
    const have=new Set(cur.map(c=>c.id));
    const add=["reimburse","refund"].map(id=>CATS.find(c=>c.id===id)).filter(c=>c&&!have.has(c.id));
    if(add.length){
      const idx=cur.findIndex(c=>c.id==="transfer");
      const next=[...cur];next.splice(idx>=0?idx+1:next.length,0,...add);
      LS.s("mt-cats",next);setCats(next);
    }
    LS.s("mt-cat-migrated-received",true);
  },[]);

  // --- Bank sync (Supabase) — additive: merges cloud bank data into local state, never clobbers ---
  const mergeBank=(bankAccs,bankTxs)=>{
    if(bankAccs&&bankAccs.length)setAccs(prev=>{const have=new Set(prev.map(a=>a.id));const add=bankAccs.filter(a=>!have.has(a.id));if(!add.length)return prev;const next=[...prev,...add];LS.s("mt-accs",next);return next;});
    if(bankTxs&&bankTxs.length)setTxs(prev=>{const have=new Set(prev.map(t=>t.id));const add=bankTxs.filter(t=>!have.has(t.id));if(!add.length)return prev;const next=[...add,...prev];LS.s("mt-txs",next);return next;});
  };
  const refreshBank=async()=>{try{
    const {accs:ba,txs:bt,conns}=await fetchBankData();
    const cloudIds=new Set(bt.map(t=>t.id));
    // Detect genuinely-new bank txns against the persisted list (always fresh), so we can
    // fire a notification "when it pulls the transactions". Skip the very first pull
    // (existing empty) so signing in doesn't ping you with your whole history.
    const existingIds=new Set((LS.g("mt-txs")||[]).map(t=>t.id));
    const freshBank=bt.filter(t=>!existingIds.has(t.id));
    if(freshBank.length&&existingIds.size>0){
      const sum=freshBank.reduce((s,t)=>s+(t.type==="expense"?-1:1)*(Number(t.amount)||0),0);
      notify(`MoneyTrack — bank synced`,`${freshBank.length} new transaction${freshBank.length>1?"s":""} · net ${fmt(sum)}`);
    }
    // Reconcile bank txns to the cloud: drop local "sb-" txns no longer in the cloud (e.g. after a
    // reset), keep everything else (local/manual txns AND still-present bank txns with your edits),
    // and add any new ones.
    // HEALING (V11.3): for a bank row that already exists locally we now also re-apply the
    // CASH FACTS from the cloud — direction (type), amount, date and account. The bank owns
    // those; before this, a local row could diverge once (a mis-typed edit, a half-written
    // update) and NOTHING ever corrected it, so the balance drifted from the real bank
    // permanently and invisibly. Your own labelling (category, merchant, notes, splits) is
    // untouched — that lives on top via txDecisions/ctxs and is re-applied every sync.
    const cloudById=new Map(bt.map(t=>[t.id,t]));
    setTxs(prev=>{
      let healed=0;
      const kept=[];
      for(const t of prev){
        const id=String(t.id);
        if(!id.startsWith("sb-")){kept.push(t);continue;}   // manual row — never touched
        const c=cloudById.get(id);
        if(!c)continue;                                      // gone from the cloud → drop
        const drift=t.type!==c.type||Math.abs((parseFloat(t.amount)||0)-(parseFloat(c.amount)||0))>0.001
          ||t.date!==c.date||t.accountId!==c.accountId;
        if(drift){healed++;kept.push({...t,type:c.type,amount:c.amount,date:c.date,accountId:c.accountId,toAccountId:c.toAccountId||"",_bank:true});}
        else kept.push(t);
      }
      const have=new Set(kept.map(t=>String(t.id)));
      const add=bt.filter(t=>!have.has(t.id));
      if(!add.length&&!healed&&kept.length===prev.length)return prev;
      if(healed)console.info(`[bank] realigned ${healed} transaction(s) to the bank`);
      const next=[...add,...kept];LS.s("mt-txs",next);return next;
    });
    // Bank accounts mirror the cloud (balance/name authoritative there → syncs across devices);
    // manual accounts stay untouched.
    setAccs(prev=>{
      const nonBank=prev.filter(a=>!String(a.id).startsWith("sb-"));
      const next=[...nonBank,...ba];
      LS.s("mt-accs",next);return next;
    });
    setBankConns(conns);
  }catch(e){console.error("bank fetch failed",e);}};
  useEffect(()=>{
    let unsub=null,offAuth=null;
    const startLive=()=>{if(!unsub)unsub=subscribeTx(tx=>{mergeBank([],[tx]);notify("MoneyTrack — new transaction",`${tx.merchant||"Bank transaction"} · ${fmt(tx.amount)}`);});};
    currentUser().then(u=>{setSbUser(u);if(u){refreshBank();syncPrefsFromCloud();startLive();}});
    offAuth=onAuthChange((u,event)=>{
      // Arriving via a password-reset link: force the "set a new password" screen instead
      // of treating the temporary recovery session as a normal sign-in.
      if(event==="PASSWORD_RECOVERY"){setRecoveryMode(true);setSbUser(u);setModal("banksync");return;}
      setSbUser(u);
      if(u){refreshBank();syncPrefsFromCloud();startLive();}else if(unsub){unsub();unsub=null;}
    });
    return ()=>{if(unsub)unsub();if(offAuth)offAuth();};
  },[]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSignIn=async(email,password)=>{const u=await signInPassword(email,password);setSbUser(u);await refreshBank();};
  const onStartConnect=async(name,iban)=>await startConnect(name,iban);
  const onFinishConnect=async(code,name)=>{const r=await finishConnect(code,name);await refreshBank();return r;};
  const onSignOut=async()=>{await signOut();setSbUser(null);setBankConns([]);};
  const onChangePassword=async(pw)=>{await changePassword(pw);};
  const onSendReset=async(email)=>{await sendPasswordReset(email);};
  const onCompleteReset=async(pw)=>{const u=await completePasswordReset(pw);setRecoveryMode(false);setSbUser(u);await refreshBank();};

  const tgDk=()=>{const nd=!dark;setDark(nd);LS.s("mt-dark",nd);};
  const setCur=id=>{setCurId(id);setCurrencyId(id);LS.s("mt-currency",id);haptic(12);};
  // Turn OS notifications on/off. Turning on requests browser permission first.
  const setNotif=async v=>{
    if(!v){setNotifOn(false);LS.s("mt-notif-enabled",false);showToast("Notifications off");return;}
    if(typeof window==="undefined"||!("Notification" in window)){showToast("Notifications aren't supported here",false);return;}
    let perm=Notification.permission;
    if(perm==="default"){try{perm=await Notification.requestPermission();}catch{perm="denied";}}
    if(perm!=="granted"){showToast("Allow notifications in your browser settings",false);setNotifOn(false);LS.s("mt-notif-enabled",false);return;}
    setNotifOn(true);LS.s("mt-notif-enabled",true);showToast("Notifications on");
    notify("MoneyTrack","Notifications enabled ✓ — you'll be pinged when your bank syncs.");
  };
  // Overlay `sym` from the built-in CATS so categories stored in localStorage before
  // the symbol set existed still render SVG glyphs; custom user cats keep their emoji.
  const getCat=id=>{
    const c=cats.find(x=>x.id===id)||CATS.find(x=>x.id===id);
    if(!c)return{icon:"📦",sym:"box",color:"#9ca3af",label:id||"Other"};
    return c.sym?c:{...c,sym:CATS.find(x=>x.id===id)?.sym};
  };

  // ── Cloud sync of the learning stores (mt_user_prefs) ──
  // prefsRef always mirrors the latest four stores; schedulePush debounces an upsert so a
  // burst of taps writes once. syncPrefsFromCloud pulls on sign-in: cloud wins if it has
  // data (this device joins the synced state), else we seed the cloud from local.
  const prefsRef=useRef({});
  useEffect(()=>{prefsRef.current={payeeStats,txDecisions,shareOverrides,ownerName};},[payeeStats,txDecisions,shareOverrides,ownerName]);
  const pushTimer=useRef(null);
  const schedulePush=()=>{
    if(!sbUser)return;
    clearTimeout(pushTimer.current);
    pushTimer.current=setTimeout(()=>{savePrefs(prefsRef.current);},800);
  };
  const hasData=o=>o&&Object.keys(o).length>0;
  const syncPrefsFromCloud=async()=>{
    try{
      const row=await fetchPrefs();
      if(row&&(hasData(row.payee_stats)||hasData(row.tx_decisions)||hasData(row.share_overrides)||row.owner_name)){
        setPayeeStats(row.payee_stats||{});LS.s("mt-payee-stats",row.payee_stats||{});
        setTxDecisions(row.tx_decisions||{});LS.s("mt-tx-decisions",row.tx_decisions||{});
        setShareOverrides(row.share_overrides||{});LS.s("mt-share-overrides",row.share_overrides||{});
        setOwnerName(row.owner_name||"");LS.s("mt-owner-name",row.owner_name||"");
      }else{
        savePrefs(prefsRef.current); // no cloud data yet → seed it from this device
      }
    }catch(e){console.warn("prefs sync failed",e);}
  };

  // Suggest a category from a merchant name as you type. Used by the manual add/edit form,
  // so people who never connect a bank still get the merchant prior + their own learning.
  // Your taught category wins over the shipped list.
  const suggestCat=merchant=>{
    const m=(merchant||"").trim();
    if(m.length<3)return null;
    const key=counterpartyKey({merchant:m});
    return (key&&payeeStats[key]?.cat)||merchantCategory(m)||null;
  };

  // Persisting setters for the classification stores (keyed independently of the txs
  // array, so they survive bank re-syncs that replace transaction rows).
  const savePayeeStats=v=>setPayeeStats(prev=>{const next=typeof v==="function"?v(prev):v;LS.s("mt-payee-stats",next);schedulePush();return next;});
  const saveTxDecisions=v=>setTxDecisions(prev=>{const next=typeof v==="function"?v(prev):v;LS.s("mt-tx-decisions",next);schedulePush();return next;});
  const saveShareOverrides=v=>setShareOverrides(prev=>{const next=typeof v==="function"?v(prev):v;LS.s("mt-share-overrides",next);schedulePush();return next;});
  const saveOwnerName=v=>{setOwnerName(v);LS.s("mt-owner-name",v);schedulePush();};

  // ── The effective-transaction layer ──
  // ctxs = txs re-labelled by the evidence engine (lib/classify.js). Bank credits that
  // aren't real income get an effective type of "credit" (money in, excluded from income).
  // The RAW cash direction still drives the balance (see getBal), so your balance always
  // matches the real bank; only the income/spend STATS change. Rent pass-through netting
  // sets _shareAmt on the landlord debit (your true share = paid − collected), which
  // personalAmt() picks up everywhere. Mutations still operate on the raw txs by id.
  const ctxs=useMemo(()=>{
    const res=classifyAll(txs,{ownerName,payeeStats,txDecisions});
    // Bug 3: cards that opted into auto-matching credit-card bill payments. A bank debit
    // whose merchant/notes contain a card's billPayee snippet is rewritten (in this derived
    // view only — raw txs untouched) into a transfer that pays down that card.
    const payCards=accs.filter(isCredit).filter(a=>(a.billPayee||"").trim()).map(a=>({id:a.id,needle:a.billPayee.trim().toLowerCase()}));
    const matchCard=t=>{
      if(!payCards.length)return null;
      if(t.accountId&&accs.find(a=>a.id===t.accountId&&isCredit(a)))return null; // never re-map a charge on the card itself
      const hay=`${t.merchant||""} ${t.notes||""}`.toLowerCase();
      return payCards.find(c=>c.id!==t.accountId&&hay.includes(c.needle))||null;
    };
    return txs.map(t=>{
      const c=res.get(t.id);
      const ov=shareOverrides[t.id];
      const card=(t.type==="expense"||t.type==="debit")?matchCard(t):null;
      if(!c&&ov==null&&!card)return t;
      const next={...t};
      if(c){
        next._rawType=t.type;next._rawCat=t.category;next._needsReview=!!c.needsReview;next._clsReason=c.reason;next._conf=c.confidence;next._suggest=c.suggest;next._key=counterpartyKey(t);
        if(c.type)next.type=c.type;
        if(c.category)next.category=c.category;
        if(c.shareAmt!=null)next._shareAmt=c.shareAmt;
      }
      // Card bill payment auto-match: turn the debit into a transfer into the card. Transfers
      // are excluded from spend totals, so the bill is never double-counted as spending, and
      // cardStats() credits it against the card's balance automatically.
      if(card){
        if(next._rawType==null)next._rawType=t.type;
        if(next._rawCat==null)next._rawCat=t.category;
        next.type="transfer";next.toAccountId=card.id;next.category="transfer";next._cardPay=true;next._needsReview=false;
      }
      // Manual "my share" wins over the automatic netting.
      if(ov!=null)next._shareAmt=parseFloat(ov)||0;
      return next;
    });
  },[txs,ownerName,payeeStats,txDecisions,shareOverrides,accs]);

  // Bank credits the classifier isn't sure about — surfaced in the Review inbox. Excluded
  // from income until you confirm (they sit as neutral "credit" meanwhile).
  const reviewTxs=useMemo(()=>ctxs.filter(t=>t._needsReview),[ctxs]);

  const getBal=useMemo(()=>(aid)=>{
    const a=accs.find(x=>x.id===aid);if(!a)return 0;
    let b=parseFloat(a.ib)||0;
    ctxs.forEach(t=>{
      const v=parseFloat(t.amount)||0;
      // Money IN (real income OR a non-income credit) raises the balance; money OUT lowers it.
      if((t.type==="income"||t.type==="credit")&&t.accountId===aid)b+=v;
      if((t.type==="expense"||t.type==="debit")&&t.accountId===aid)b-=v;
      if(t.type==="transfer"&&t.accountId===aid)b-=v;
      if(t.type==="transfer"&&t.toAccountId===aid)b+=v;
    });
    return b;
  },[accs,ctxs]);

  // FIX: totBal uses same memo as getBal — no stale closure
  // Cards carry a negative balance, so this is TRUE net worth (cash minus card debt).
  const totBal=useMemo(()=>accs.reduce((s,a)=>s+getBal(a.id),0),[getBal,accs]);

  // --- Credit cards ---
  const cards=useMemo(()=>accs.filter(isCredit),[accs]);
  const cardIds=useMemo(()=>new Set(cards.map(c=>c.id)),[cards]);
  const cardStatsList=useMemo(()=>cards.map(c=>({card:c,...cardStats(c,ctxs)})),[cards,ctxs]);
  // Assets = cash only; creditOwed = what the cards owe. totBal is assets − creditOwed.
  const assets=useMemo(()=>accs.filter(a=>!isCredit(a)).reduce((s,a)=>s+getBal(a.id),0),[getBal,accs]);
  const creditOwed=useMemo(()=>cardStatsList.reduce((s,c)=>s+Math.max(c.currentBalance,0),0),[cardStatsList]);
  const dueCards=useMemo(()=>cardStatsList.filter(c=>c.dueSoon||c.overdue).sort((a,b)=>a.daysToDue-b.daysToDue),[cardStatsList]);

  // V11 Home chart: total balance per day, last 60 days. Transfers move money between
  // own accounts so they cancel at the total level and are skipped. Days before the
  // window are folded into the starting value; days without activity carry forward.
  const balSeries=useMemo(()=>{
    const DAYS=60;
    const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const deltas={};
    ctxs.forEach(t=>{
      const v=parseFloat(t.amount)||0;
      const d=(t.type==="income"||t.type==="credit")?v:(t.type==="expense"||t.type==="debit")?-v:0;
      if(d)deltas[t.date]=(deltas[t.date]||0)+d;
    });
    const dates=Object.keys(deltas).sort();
    const n=new Date(),start=new Date(n);start.setDate(n.getDate()-(DAYS-1));
    const startIso=iso(start);
    let run=accs.reduce((s,a)=>s+(parseFloat(a.ib)||0),0),di=0;
    while(di<dates.length&&dates[di]<startIso){run+=deltas[dates[di]];di++;}
    const out=[];
    for(let i=0;i<DAYS;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);const k=iso(d);
      while(di<dates.length&&dates[di]<=k){run+=deltas[dates[di]];di++;}
      out.push({d:k,v:Math.round(run*100)/100});
    }
    return out;
  },[accs,ctxs]);

  const mLbl=new Date().toLocaleString("default",{month:"long"});
  const now0=new Date();
  const monthKey=tod().slice(0,7);
  const daysInMonth=new Date(now0.getFullYear(),now0.getMonth()+1,0).getDate();
  const dayOfMonth=now0.getDate();
  const daysLeft=Math.max(daysInMonth-dayOfMonth+1,1);

  const mSt=useMemo(()=>{
    const m=ctxs.filter(t=>t.date.startsWith(monthKey));
    return{
      inc:m.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount),0),
      // FIX: use personal share for expenses
      spt:m.filter(t=>t.type==="expense").reduce((s,t)=>s+personalAmt(t),0),
    };
  },[ctxs]);

  // How much of this month's spend went on a card (money still owed) vs. cash you had.
  const creditSplit=useMemo(()=>{
    const m=ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(monthKey));
    const credit=m.filter(t=>cardIds.has(t.accountId)).reduce((s,t)=>s+personalAmt(t),0);
    const cash=m.filter(t=>!cardIds.has(t.accountId)).reduce((s,t)=>s+personalAmt(t),0);
    const tot=credit+cash;
    return{credit,cash,creditPct:tot>0?credit/tot:0,cashPct:tot>0?cash/tot:0};
  },[ctxs,cardIds,monthKey]);

  const chartD=useMemo(()=>{
    const n=new Date();
    return Array.from({length:12},(_,i)=>{
      const d=new Date(n.getFullYear(),n.getMonth()-(11-i),1);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      return{
        label:d.toLocaleString("default",{month:"short"}),
        income:ctxs.filter(t=>t.type==="income"&&t.date.startsWith(k)).reduce((s,t)=>s+parseFloat(t.amount),0),
        // FIX: personal share for expenses in chart
        spent:ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(k)).reduce((s,t)=>s+personalAmt(t),0),
      };
    });
  },[ctxs]);

  const catD=useMemo(()=>{
    const map={};
    ctxs.filter(t=>t.type==="expense").forEach(t=>{
      const c=t.category||"other";
      if(!map[c])map[c]={total:0,merchants:{}};
      // FIX: personal share
      const a=personalAmt(t);
      map[c].total+=a;
      const m=t.merchant||"Unknown";
      map[c].merchants[m]=(map[c].merchants[m]||0)+a;
    });
    return Object.entries(map).sort(([,a],[,b])=>b.total-a.total).map(([id,v])=>({id,...v,...getCat(id)}));
  },[ctxs,cats]);

  // Bug 5: month-scoped spending breakdown for Insights → Spending (catD above stays
  // all-time for Home's "top category"). spendMonth "all" = every month combined.
  const spendMonths=useMemo(()=>{
    const set=new Set();
    ctxs.forEach(t=>{if(t.type==="expense"&&t.date)set.add(t.date.slice(0,7));});
    set.add(tod().slice(0,7));
    return [...set].sort().reverse();
  },[ctxs]);
  const spendCatD=useMemo(()=>{
    const map={};
    ctxs.filter(t=>t.type==="expense"&&(spendMonth==="all"||t.date.startsWith(spendMonth))).forEach(t=>{
      const c=t.category||"other";
      if(!map[c])map[c]={total:0,merchants:{}};
      const a=personalAmt(t);
      map[c].total+=a;
      const m=t.merchant||"Unknown";
      map[c].merchants[m]=(map[c].merchants[m]||0)+a;
    });
    return Object.entries(map).sort(([,a],[,b])=>b.total-a.total).map(([id,v])=>({id,...v,...getCat(id)}));
  },[ctxs,cats,spendMonth]);
  const spendMxCat=spendCatD[0]?.total||1;
  const spendTotal=useMemo(()=>spendCatD.reduce((s,c)=>s+c.total,0),[spendCatD]);

  const filtTxs=useMemo(()=>
    [...ctxs].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>{
      if(search&&!t.merchant?.toLowerCase().includes(search.toLowerCase()))return false;
      if(fCat&&t.category!==fCat)return false;
      if(fAcc&&t.accountId!==fAcc)return false;
      if(fType&&t.type!==fType)return false;
      return true;
    }),[ctxs,search,fCat,fAcc,fType]);

  const filtSummary=useMemo(()=>{
    if(fType==="income")   return {sum:filtTxs.reduce((s,t)=>s+(parseFloat(t.amount)||0),0),verb:"in"};
    if(fType==="credit")   return {sum:filtTxs.reduce((s,t)=>s+(parseFloat(t.amount)||0),0),verb:"received"};
    if(fType==="expense")  return {sum:filtTxs.reduce((s,t)=>s+personalAmt(t),0),verb:"spent"};
    if(fType==="transfer") return {sum:filtTxs.reduce((s,t)=>s+(parseFloat(t.amount)||0),0),verb:"moved"};
    return {sum:filtTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+personalAmt(t),0),verb:"spent"};
  },[filtTxs,fType]);

  const recTxs=useMemo(()=>[...ctxs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5),[ctxs]);
  // Frequency-ordered categories for TxSheet's chip picker (every cat always included).
  const orderedCats=useMemo(()=>{
    const cnt={};
    txs.forEach(t=>{cnt[t.category]=(cnt[t.category]||0)+1;});
    return [...cats].sort((a,b)=>(cnt[b.id]||0)-(cnt[a.id]||0));
  },[txs,cats]);
  // Up to 8 most-recent distinct merchant names for one-tap entry in TxSheet.
  const recentMerchants=useMemo(()=>{
    const seen=new Set(),out=[];
    for(const t of [...txs].sort((a,b)=>(b.date||"").localeCompare(a.date||""))){
      const m=(t.merchant||"").trim();if(!m)continue;
      const k=m.toLowerCase();if(seen.has(k))continue;
      seen.add(k);out.push(m);if(out.length>=8)break;
    }
    return out;
  },[txs]);
  const activeDebts=useMemo(()=>debts.filter(d=>!d.settled),[debts]);
  const settledDebts=useMemo(()=>debts.filter(d=>d.settled),[debts]);
  const totalDebt=useMemo(()=>activeDebts.reduce((s,d)=>s+(d.totalAmount-d.paidBack),0),[activeDebts]);

  const monthCatSpent=useMemo(()=>{
    const m={};
    ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(monthKey)).forEach(t=>{
      m[t.category||"other"]=(m[t.category||"other"]||0)+personalAmt(t);
    });
    return m;
  },[ctxs]);

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
    dueCards.forEach(c=>a.push({k:"card-"+c.card.id+"-"+c.close,icon:c.overdue?I.alert:I.card,tone:c.overdue?"red":"blue",
      title:`${c.card.name} · ${fmt(c.amountDue)} ${c.overdue?"overdue":"due"}`,
      sub:c.overdue?`${Math.abs(c.daysToDue)} days late · tap to pay`:c.daysToDue===0?"Due today · tap to pay":`Due in ${c.daysToDue} days`,
      card:c.card.id}));
    cardStatsList.filter(c=>c.overLimit).forEach(c=>a.push({k:"cardlim-"+c.card.id,icon:I.alert,tone:"red",
      title:`${c.card.name} over limit`,sub:`${fmt(c.currentBalance-c.limit)} above ${fmt(c.limit)}`,card:c.card.id}));
    overBudget.forEach(b=>a.push({k:"ob-"+b.label,icon:I.alert,tone:"red",title:b.label+" over budget",sub:Math.round(b.pct*100)+"% used",tab:"stats",ana:"budget"}));
    reachedGoals.forEach(g=>a.push({k:"g-"+g.id,icon:I.spark,tone:"green",title:g.name+" reached!",sub:"Savings goal complete",tab:"goals"}));
    activeDebts.slice(0,2).forEach(d=>a.push({k:"debt-"+d.id,icon:I.wallet,tone:"red",title:`Owe ${d.personName} ${fmt(d.totalAmount-d.paidBack)}`,sub:"Tap to log repayment",tab:"splits",pv:"debts"}));
    return a.filter(n=>!dismissedNotifs.includes(n.k));
  },[dueCards,cardStatsList,overBudget,reachedGoals,activeDebts,dismissedNotifs]);

  const insights=useMemo(()=>{
    const list=[];
    const dailyAvg=mSt.spt/Math.max(dayOfMonth,1);
    const lm=new Date(now0.getFullYear(),now0.getMonth()-1,1);
    const lmKey=`${lm.getFullYear()}-${String(lm.getMonth()+1).padStart(2,"0")}`;
    const lmSpent=ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(lmKey)).reduce((s,t)=>s+personalAmt(t),0);
    const expTx=ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(monthKey));
    // projection from MEDIAN daily spend so one-off big expenses don't explode the forecast
    const byDay={};expTx.forEach(t=>{byDay[t.date]=(byDay[t.date]||0)+personalAmt(t);});
    const dTot=Object.values(byDay).sort((a,b)=>a-b);
    const medDay=dTot.length?dTot[Math.floor(dTot.length/2)]:0;
    const projected=mSt.spt+medDay*(daysInMonth-dayOfMonth);
    if(mSt.inc>0){const r=Math.round((mSt.inc-mSt.spt)/mSt.inc*100);list.push({icon:I.gem,label:"Savings rate",value:r+"%",sub:r>=20?"Great!":"Aim for 20%+",tone:r>=20?"green":r>=0?"blue":"red"});}
    // FIX: only show projected spend if at least 5 days have passed (avoids day-1 scariness)
    if(mSt.spt>0&&dayOfMonth>=5)list.push({icon:I.trendUp,label:"Projected spend",value:fmt(projected),sub:"at typical pace",tone:"blue"});
    if(lmSpent>0){const diff=Math.round((mSt.spt-lmSpent)/lmSpent*100);list.push({icon:diff<=0?I.spark:I.alert,label:"vs last month",value:(diff>0?"+":"")+diff+"%",sub:diff<=0?"less spending":"more spending",tone:diff<=0?"green":"red"});}
    list.push({icon:I.calendar,label:"Daily average",value:fmt(dailyAvg),sub:`over ${dayOfMonth} days`,tone:"blue"});
    if(expTx.length){const big=expTx.reduce((a,b)=>personalAmt(b)>personalAmt(a)?b:a);list.push({icon:I.flame,label:"Biggest expense",value:fmt(personalAmt(big)),sub:big.merchant||"—",tone:"red"});}
    return list;
  },[ctxs,mSt,dayOfMonth,daysInMonth]);

  const calData=useMemo(()=>{
    const m={};
    ctxs.filter(t=>t.type==="expense"&&t.date.startsWith(calMonth)).forEach(t=>{
      m[t.date]=(m[t.date]||0)+personalAmt(t);
    });
    return m;
  },[ctxs,calMonth]);

  const closeM=()=>{setModal(null);setEditId(null);setTxForm(iTx);setAccForm(iAcc);setGoalForm(iGoal);setDebtForm(iDebt);setRepayForm(iRepay);setCatForm(iCat);};

  const doAddTx=()=>{
    if(!txForm.amount||!txForm.accountId)return;
    // FIX: guard transfer toAccountId in save function too
    if(txForm.type==="transfer"&&!txForm.toAccountId)return;
    const {_settleIds,_share,_catTouched,...cleanForm}=txForm;
    const tx={...cleanForm,id:editId||uid(),amount:parseFloat(txForm.amount)||0,splitPeople:1,category:txForm.type==="transfer"?"transfer":txForm.category};
    // Manual "my share": store it only when it's a real partial (0 ≤ share < full) on an
    // expense; otherwise clear any prior override so the full amount (or auto-netting) applies.
    const shareN=parseFloat(_share);
    if(tx.type==="expense"&&_share!==""&&!isNaN(shareN)&&shareN>=0&&shareN<(parseFloat(tx.amount)||0))
      saveShareOverrides(prev=>({...prev,[tx.id]:shareN}));
    else
      saveShareOverrides(prev=>{if(prev[tx.id]==null)return prev;const n={...prev};delete n[tx.id];return n;});
    const oldTx=editId?txs.find(t=>t.id===editId):null;
    // The form is prefilled from ctxs (the EFFECTIVE row), so "did you actually change
    // anything?" has to be judged against the effective row, not the raw one.
    const effOld=editId?ctxs.find(t=>t.id===editId):null;
    // V11.3: a BANK row's cash facts belong to the bank. Your edit re-labels the row; it
    // must never rewrite the direction/amount/date, or the app's balance silently stops
    // matching your real account (and the next sync would fight the edit anyway). The
    // relabel is kept as a decision below and re-applied on every sync.
    if(oldTx&&oldTx._bank){
      tx.type=oldTx.type;tx.amount=oldTx.amount;tx.date=oldTx.date;
      tx.accountId=oldTx.accountId;tx.toAccountId=oldTx.toAccountId||"";
    }
    // Teach-on-correct: when you re-type/re-categorise a BANK transaction, remember it so
    // the classifier respects this exact row AND auto-applies your choice to this payee
    // in future syncs (no re-correcting the same friend every month).
    if(oldTx&&oldTx._bank&&effOld&&(effOld.type!==txForm.type||effOld.category!==txForm.category)){
      const decision={type:txForm.type,category:txForm.category};
      saveTxDecisions(prev=>({...prev,[tx.id]:decision}));
      const key=counterpartyKey(tx);
      const label=Object.keys(LABEL_CLS).find(l=>LABEL_CLS[l].type===txForm.type&&LABEL_CLS[l].category===txForm.category);
      if(key&&label)savePayeeStats(prev=>bumpPayeeStats(prev,key,label));
    }
    // Learn the expense CATEGORY for this payee — from bank corrections AND plain manual
    // entries, so people who never connect a bank still get a app that learns their shops
    // (it then auto-suggests next time they type that merchant).
    const ckey=counterpartyKey(tx);
    if(ckey&&tx.type==="expense"&&tx.category&&tx.category!=="other")
      savePayeeStats(prev=>setPayeeCat(prev,ckey,tx.category));
    const base=editId?txs.map(t=>t.id===editId?tx:t):[tx,...txs];
    st(base);
    try{localStorage.setItem("mt-last-account",tx.accountId);localStorage.setItem("mt-last-category",tx.category);}catch{}
    showToast(editId?"Transaction updated":"Transaction added",true,()=>st(prev=>
      oldTx?prev.map(t=>t.id===tx.id?oldTx:t):prev.filter(t=>t.id!==tx.id)
    ));
    closeM();
  };

  const doDeleteTx=id=>{
    const old=txs.find(t=>t.id===id);if(!old)return;
    st(txs.filter(t=>t.id!==id));
    showToast("Transaction deleted",true,()=>st(prev=>[old,...prev]));
  };
  // Open the EFFECTIVE (classified) transaction so a re-labelled bank credit shows as
  // Received/Reimbursement/Refund in the form — not as the bank's raw "income". Strip the
  // internal overlay fields so they don't get written back onto the saved transaction, and
  // seed the "my share" field from the current effective share (auto-netted or manual).
  const doEditTx=t=>{
    const{_rawType,_rawCat,_needsReview,_clsReason,_conf,_suggest,_key,_shareAmt,...clean}=t;
    const share=_shareAmt!=null&&_shareAmt!==(parseFloat(t.amount)||0)?String(_shareAmt):"";
    // _catTouched: editing an existing tx must never auto-rewrite the category you already chose.
    setTxForm({...iTx,...clean,_share:share,_catTouched:true});setEditId(t.id);setModal("tx");
  };
  const openAddPrefill=()=>{
    const la=localStorage.getItem("mt-last-account");
    const lc=localStorage.getItem("mt-last-category");
    setTxForm({...iTx,accountId:la||accs[0]?.id||"",category:lc||"other"});
    setEditId(null);setModal("tx");
  };

  const doAddAcc=()=>{
    if(!accForm.name)return;
    const cred=accForm.kind==="credit";
    // A card's balance is NEGATIVE when you owe — the form asks for the friendly
    // "balance owed" figure, so flip its sign into ib and drop the form-only fields.
    const {owed,_balMode,_currentBal,...rest}=accForm;
    // "Balance today" mode: back-calculate the starting balance so the account's COMPUTED
    // current balance equals what the user typed — newIb = oldIb + (target − currentComputed).
    // Lets a user set the right balance without knowing their balance on the first synced day.
    const cashIb=()=>{
      if(_balMode!=="current")return parseFloat(accForm.ib)||0;
      const target=parseFloat(_currentBal)||0;
      if(!editId)return target;                       // no transactions yet ⇒ start = today
      const oldIb=parseFloat(accs.find(x=>x.id===editId)?.ib)||0;
      return Math.round((oldIb+(target-getBal(editId)))*100)/100;
    };
    const a=cred
      ? {...rest,id:editId||uid(),kind:"credit",ib:-Math.abs(parseFloat(owed)||0),
         creditLimit:parseFloat(accForm.creditLimit)||0,
         statementDay:Math.min(Math.max(parseInt(accForm.statementDay)||1,1),31),
         dueDay:Math.min(Math.max(parseInt(accForm.dueDay)||1,1),31),
         apr:parseFloat(accForm.apr)||0,
         billPayee:(accForm.billPayee||"").trim(),
         autopay:!!accForm.autopay&&!!accForm.payFromId}
      : {...rest,id:editId||uid(),kind:"cash",ib:cashIb()};
    sa(editId?accs.map(x=>x.id===editId?{...x,...a}:x):[...accs,a]);
    // Bank accounts: persist balance/name/color to the cloud so they sync to every device you sign in on.
    if(editId&&String(editId).startsWith("sb-"))updateBankAccount(editId,{ib:a.ib,name:a.name,color:a.color}).catch(e=>console.error("cloud account update failed",e));
    showToast(editId?(cred?"Card updated":"Account updated"):(cred?"Card added":"Account added"));closeM();
  };
  const delAcc=id=>{
    const a=accs.find(x=>x.id===id);if(!a)return;
    const isBank=String(id).startsWith("sb-");
    if(!confirm(isBank?`Delete "${a.name}"? This disconnects the bank and removes its synced transactions.`:`Delete "${a.name}"?`))return;
    sa(prev=>prev.filter(x=>x.id!==id));
    if(isBank){
      setTxs(prev=>{const next=prev.filter(t=>t.accountId!==id&&t.toAccountId!==id);LS.s("mt-txs",next);return next;});
      deleteBankAccount(id).then(refreshBank).catch(e=>console.error("cloud account delete failed",e));
      showToast("Bank account disconnected");
    }else{
      showToast("Account deleted",true,()=>sa(prev=>[a,...prev]));
    }
  };
  const doEditAcc=a=>{
    setAccForm(isCredit(a)
      ? {...iAcc,name:a.name,color:a.color,kind:"credit",ib:String(a.ib),
         owed:String(Math.abs(parseFloat(a.ib)||0)),creditLimit:String(a.creditLimit??""),
         statementDay:String(a.statementDay??""),dueDay:String(a.dueDay??""),
         apr:a.apr?String(a.apr):"",payFromId:a.payFromId||"",autopay:!!a.autopay,billPayee:a.billPayee||""}
      : {...iAcc,name:a.name,color:a.color,kind:"cash",ib:String(a.ib),
         // Bank accounts have synced transactions, so "balance today" is the intuitive way to
         // set them — prefill it with the current computed balance (saving unchanged = no-op).
         _balMode:String(a.id).startsWith("sb-")||String(a.id).startsWith("eb-")?"current":"start",
         _currentBal:String(getBal(a.id))});
    setEditId(a.id);setModal("acc");
  };

  // Quick-create from the [+] sheet's category row. Unlike doAddCat this guards against
  // id collisions (a second "Dining" would otherwise append a duplicate `dining` id),
  // and returns the id so the caller can select it straight away.
  const addQuickCat=({label,sym,color})=>{
    const base=label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||uid();
    let id=base,n=2;
    while(cats.some(c=>c.id===id))id=`${base}-${n++}`;
    sc(prev=>[...prev,{id,label:label.trim(),icon:"",sym,color}]);
    return id;
  };

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
  // `sym` must be carried through: doAddCat merges with {...x,...c}, so omitting it here
  // would overwrite a built-in category's symbol with undefined and drop it back to emoji.
  const doEditCat=c=>{setCatForm({label:c.label,icon:c.icon,sym:c.sym||"",color:c.color});setEditId(c.id);setModal("cat");};

  const doAddGoal=()=>{
    if(!goalForm.name||!goalForm.targetAmount)return;
    const g={...goalForm,id:editId||uid(),targetAmount:parseFloat(goalForm.targetAmount)||0,savedAmount:parseFloat(goalForm.savedAmount)||0};
    sg(editId?goals.map(x=>x.id===editId?g:x):[...goals,g]);
    const reached=g.targetAmount>0&&g.savedAmount>=g.targetAmount;
    if(reached)fireConfetti();
    showToast(reached?"Goal reached!":editId?"Goal updated":"Goal added");closeM();
  };
  const delGoal=id=>{
    const g=goals.find(x=>x.id===id);if(!g||!confirm(`Delete "${g.name}"?`))return;
    sg(prev=>prev.filter(x=>x.id!==id));showToast("Goal deleted",true,()=>sg(prev=>[g,...prev]));
  };
  // doAddGoal replaces the goal wholesale, so every field must be listed here or it's
  // destroyed on edit — `sym` included.
  const doEditGoal=g=>{setGoalForm({name:g.name,targetAmount:String(g.targetAmount),savedAmount:String(g.savedAmount),icon:g.icon,sym:g.sym||"",color:g.color});setEditId(g.id);setModal("goal");};

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
    if(nowSettled){fireConfetti();showToast(`${debt.personName} fully paid!`);}
    else if(requested>remaining)showToast(`Capped at ${fmt(amount)} · debt cleared`);
    else showToast(`Logged · ${fmt(debt.totalAmount-newPaid)} left`);
    closeM();
  };

  // Review inbox: apply a classification choice to an uncertain bank credit. Records both a
  // per-tx decision (this row) and a learned payee rule (all future money from this payee),
  // then confirms — so it leaves the review list and never asks again.
  const classifyReview=(t,choice)=>{
    let category=choice.cls.category;
    if(choice.key==="income"){
      // Preserve an already-detected income sub-category (salary/freelance) if present.
      const guessed=t.category!=="other"?t.category:t._rawCat;
      if(["salary","freelance"].includes(guessed))category=guessed;
    }
    const decision={type:choice.cls.type,category};
    saveTxDecisions(prev=>({...prev,[t.id]:decision}));
    // teach the payee prior: one tap (weight 3) dominates; mixed histories stay mixed
    const key=t._key||counterpartyKey(t);
    const label=choice.key==="income"?(category==="freelance"?"freelance":"salary"):choice.key;
    if(key)savePayeeStats(prev=>bumpPayeeStats(prev,key,label));
    haptic(10);
  };
  const undoReview=t=>{
    saveTxDecisions(prev=>{const n={...prev};delete n[t.id];return n;});
  };

  const doExport=()=>{
    const data={accs,cats,txs,goals,recurring,debts,budgets,currency:curId,payeeStats,txDecisions,shareOverrides,ownerName,exportedAt:new Date().toISOString(),version:"2.6"};
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
        if(data.payeeStats)savePayeeStats(data.payeeStats);
        else if(data.payeeRules)savePayeeStats(migrateRulesToStats(data.payeeRules));
        if(data.txDecisions)saveTxDecisions(data.txDecisions);
        if(data.shareOverrides)saveShareOverrides(data.shareOverrides);
        if(data.ownerName!=null)saveOwnerName(data.ownerName);
        if(data.currency&&CURRENCIES.some(c=>c.id===data.currency))setCur(data.currency);
        showToast("Data restored!");closeM();
      }catch{showToast("Invalid backup file",false);}
    };
    reader.readAsText(file);e.target.value="";
  };
  const exportCSV=()=>{
    const rows=[...ctxs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,200);
    const hdr=["Date","Description","Amount","Category"];
    const esc=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';const out=r=>(r.type==="expense"||r.type==="debit"||(r.type==="transfer"))?-Math.abs(r.amount):Math.abs(r.amount);const csv=[hdr.join(","),...rows.map(r=>[r.date,esc(r.merchant),out(r),esc(getCat(r.category).label)].join(","))];
    const blob=new Blob([csv.join("\n")],{type:"text/csv"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="transactions.csv";a.click();URL.revokeObjectURL(url);
  };
  const setBudget=(catId,val)=>{const next={...budgets},n=parseFloat(val);if(!val||isNaN(n)||n<=0)delete next[catId];else next[catId]=n;sb(next);};
  const lockNow=()=>{if(pin){haptic(12);setLocked(true);}};
  const goTxs=(type="")=>{haptic(8);setFType(type);setSearch("");setFCat("");setFAcc("");setTab("txs");};
  // V11 navigation shim: accounts, debts and goals now live inside the Wallet tab.
  // Every pre-V11 call site (tabs, sheets, notification targets) still navigates with the
  // old ids — this remaps them to the right Wallet section so nothing needs rewriting.
  const navTab=id=>{
    if(id==="accs"){setWalletView("accounts");setTab("wallet");return;}
    if(id==="splits"){setWalletView("debts");setTab("wallet");return;}
    if(id==="goals"){setWalletView("goals");setTab("wallet");return;}
    if(id==="categories"){setWalletView("categories");setTab("wallet");return;}
    setTab(id);
  };

  const openCard=id=>{setCardId(id);setModal("card");};
  // Paying a card bill is just a transfer cash → card. It's NOT a new expense: the
  // spend was already counted when you charged it, and transfers are excluded from
  // every spend total, so nothing double-counts.
  const payBill=card=>{
    const s=cardStats(card,ctxs);
    const from=card.payFromId||accs.find(a=>!isCredit(a)&&a.id!==card.id)?.id||"";
    setTxForm({...iTx,type:"transfer",amount:String(s.amountDue.toFixed(2)),merchant:`${card.name} bill`,
      category:"transfer",accountId:from,toAccountId:card.id,notes:`Statement of ${s.close}`,date:tod()});
    setEditId(null);setModal("tx");
  };

  // Auto-pay: on/after the due date, log the statement payment once per cycle. The
  // lastAutopay stamp (the statement's close date) is what stops it firing twice.
  useEffect(()=>{
    if(!ready)return;
    const today=tod(),pend=[];
    accs.filter(isCredit).forEach(c=>{
      if(!c.autopay||!c.payFromId)return;
      const s=cardStats(c,ctxs,today);
      if(s.amountDue<=0||s.daysToDue>0||c.lastAutopay===s.close)return;
      pend.push({card:c,close:s.close,amount:s.amountDue});
    });
    if(!pend.length)return;
    st(prev=>[...pend.map(p=>({id:uid(),type:"transfer",amount:p.amount,merchant:`${p.card.name} bill`,category:"transfer",
      accountId:p.card.payFromId,toAccountId:p.card.id,notes:"Auto-paid",date:today,isSplit:false,splitPeople:1,splitSettled:false})),...prev]);
    sa(prev=>prev.map(a=>{const p=pend.find(x=>x.card.id===a.id);return p?{...a,lastAutopay:p.close}:a;}));
    showToast(pend.length===1?`Auto-paid ${pend[0].card.name} · ${fmt(pend[0].amount)}`:`Auto-paid ${pend.length} card bills`);
  },[ready,accs,ctxs]);

  const net=mSt.inc-mSt.spt,netPos=net>=0;
  const inp={display:"block",width:"100%",background:T.inp,color:T.txt,border:`1.5px solid ${T.inpB}`,borderRadius:12,padding:"13px 14px",fontSize:16,outline:"none",WebkitAppearance:"none",appearance:"none"};

  // Theme-NEUTRAL loading screen: the server always renders "light" but the client may
  // have dark stored, so any T.* color here would hydration-mismatch. #8e8e93 reads fine
  // on both canvases.
  if(!ready)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100dvh",background:"var(--mt-bg)",gap:12}}>
      <div>{I.wallet("#8e8e93",52)}</div>
      <div style={{color:"#8e8e93",fontSize:14}}>Loading MoneyTrack…</div>
    </div>
  );

  // V11 tab bar: Home · Activity · [+] · Insights · Wallet. The center slot is the
  // add button (rendered specially); Wallet gathers accounts + cards + debts + goals.
  const TABS=[
    {id:"home",lbl:"Home",ic:I.home},
    {id:"txs",lbl:"Activity",ic:I.list},
    {id:"__add",lbl:"",ic:I.plus},
    {id:"stats",lbl:"Insights",ic:I.chart},
    {id:"wallet",lbl:"Wallet",ic:I.wallet},
  ];

  const _onbVer=LS.g("mt-onboarded");
  const onbMode=onbDone?null:(_onbVer==null?(txs.length===0?"full":"guide"):(_onbVer!==MT_VERSION?"guide":null));

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:"var(--mt-bg)",color:T.txt}}>
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
        <div className="mt-col" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 6px"}}>
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
        <AnimatePresence mode="wait">
        <motion.div key={tab} className="mt-col" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.16}} style={{padding:"6px 16px calc(env(safe-area-inset-bottom) + 126px)"}}>

        {/* ══ HOME ══ */}
        {tab==="home"&&(
          <HomeTab
            T={T} dark={dark} fmt={fmt} totBal={totBal} accs={accs} mSt={mSt} netPos={netPos} net={net} mLbl={mLbl}
            activeDebts={activeDebts} debtBannerSeen={debtBannerSeen} setDebtBannerSeen={setDebtBannerSeen} totalDebt={totalDebt}
            safeToday={safeToday} daysLeft={daysLeft} totalBudget={totalBudget} totalBudgetSpent={totalBudgetSpent} overBudget={overBudget}
            insights={insights} chartD={chartD} recTxs={recTxs} getCat={getCat} goals={goals} catD={catD} mxCat={mxCat}
            assets={assets} creditOwed={creditOwed} dueCards={dueCards} openCard={openCard}
            reviewCount={reviewTxs.length} openReview={()=>setModal("review")}
            balSeries={balSeries} sbUser={sbUser} openBankSync={()=>setModal("banksync")}
            setTab={navTab} setPeopleView={setPeopleView} setAnaView={setAnaView} setDrillCat={setDrillCat} goTxs={goTxs} doEditTx={doEditTx} haptic={haptic}
          />
        )}

        {/* ══ ACTIVITY ══ */}
        {tab==="txs"&&(
          <ActivityTab
            T={T} dark={dark} fmt={fmt} search={search} setSearch={setSearch} fType={fType} setFType={setFType}
            filtTxs={filtTxs} filtSummary={filtSummary} fCat={fCat} setFCat={setFCat} cats={cats}
            fAcc={fAcc} setFAcc={setFAcc} accs={accs} getCat={getCat} doEditTx={doEditTx} doDeleteTx={doDeleteTx} haptic={haptic}
          />
        )}

        {/* ══ WALLET — accounts · cards · debts · goals, the "things you have" tab ══ */}
        {tab==="wallet"&&(<>
          <SubNav view={walletView} setView={setWalletView} items={[["accounts","Accounts"],["debts","Debts"],["goals","Goals"],["categories","Categories"]]} T={T} haptic={haptic}/>
          {walletView==="accounts"&&(
            <AccountsPanel
              T={T} fmt={fmt} totBal={totBal} assets={assets} creditOwed={creditOwed} openCard={openCard}
              accs={accs} txs={ctxs} getBal={getBal} setAccForm={setAccForm} iAcc={iAcc} setEditId={setEditId} setModal={setModal} doEditAcc={doEditAcc} delAcc={delAcc}
              setFType={setFType} setSearch={setSearch} setFCat={setFCat} setFAcc={setFAcc} setTab={navTab} haptic={haptic}
              openBankSync={()=>setModal("banksync")}
            />
          )}
          {walletView==="debts"&&(
            <PeopleTab
              T={T} dark={dark} fmt={fmt} totalDebt={totalDebt} getCat={getCat}
              activeDebts={activeDebts} accs={accs} setDebtForm={setDebtForm} iDebt={iDebt} setEditId={setEditId} setModal={setModal} openRepay={openRepay} doEditDebt={doEditDebt} delDebt={delDebt} settledDebts={settledDebts} haptic={haptic}
            />
          )}
          {walletView==="goals"&&(
            <GoalsTab T={T} fmt={fmt} goals={goals} setGoalForm={setGoalForm} iGoal={iGoal} setEditId={setEditId} setModal={setModal} doEditGoal={doEditGoal} delGoal={delGoal} haptic={haptic}/>
          )}
          {walletView==="categories"&&(
            <CategoriesPanel T={T} cats={cats} setCatForm={setCatForm} iCat={iCat} setEditId={setEditId} setModal={setModal} doEditCat={doEditCat} delCat={delCat}/>
          )}
        </>)}

        {/* Legacy standalone routes — nothing links here since the Wallet merge (navTab
            remaps splits/goals/accs), kept renderable as a safety net. */}
        {tab==="splits"&&(
          <PeopleTab
            T={T} dark={dark} fmt={fmt} totalDebt={totalDebt} getCat={getCat}
            activeDebts={activeDebts} accs={accs} setDebtForm={setDebtForm} iDebt={iDebt} setEditId={setEditId} setModal={setModal} openRepay={openRepay} doEditDebt={doEditDebt} delDebt={delDebt} settledDebts={settledDebts} haptic={haptic}
          />
        )}

        {tab==="goals"&&(
          <GoalsTab T={T} fmt={fmt} goals={goals} setGoalForm={setGoalForm} iGoal={iGoal} setEditId={setEditId} setModal={setModal} doEditGoal={doEditGoal} delGoal={delGoal} haptic={haptic}/>
        )}

        {tab==="accs"&&(
          <AccountsPanel
            T={T} fmt={fmt} totBal={totBal} assets={assets} creditOwed={creditOwed} openCard={openCard} openBankSync={()=>setModal("banksync")}
            accs={accs} txs={ctxs} getBal={getBal} setAccForm={setAccForm} iAcc={iAcc} setEditId={setEditId} setModal={setModal} doEditAcc={doEditAcc} delAcc={delAcc}
            setFType={setFType} setSearch={setSearch} setFCat={setFCat} setFAcc={setFAcc} setTab={navTab} haptic={haptic}
          />
        )}

        {tab==="categories"&&(
          <CategoriesPanel T={T} cats={cats} setCatForm={setCatForm} iCat={iCat} setEditId={setEditId} setModal={setModal} doEditCat={doEditCat} delCat={delCat}/>
        )}

        {tab==="stats"&&(
          <AnalyticsTab
            T={T} dark={dark} fmt={fmt} anaView={anaView} setAnaView={setAnaView} drillCat={drillCat} setDrillCat={setDrillCat} catD={spendCatD} txs={ctxs} setSearch={setSearch} setFCat={setFCat} setTab={navTab} mxCat={spendMxCat}
            spendMonth={spendMonth} setSpendMonth={setSpendMonth} spendMonths={spendMonths} spendTotal={spendTotal}
            totalBudget={totalBudget} totalBudgetSpent={totalBudgetSpent} cats={cats} budgets={budgets} monthCatSpent={monthCatSpent} setBudget={setBudget}
            calMonth={calMonth} setCalMonth={setCalMonth} calData={calData} creditSplit={creditSplit} haptic={haptic}
          />
        )}


        </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab bar — Home · Activity · [+] · Insights · Wallet. The + is the one accent
          on screen: raised, always one thumb-tap away for manual entry. */}
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:90,paddingBottom:"calc(env(safe-area-inset-bottom) + 10px)",pointerEvents:"none"}}>
        <div className="mt-col" style={{padding:"0 14px"}}>
          <div style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:2,background:dark?"rgba(22,22,24,.85)":"rgba(255,255,255,.86)",backdropFilter:"saturate(180%) blur(22px)",WebkitBackdropFilter:"saturate(180%) blur(22px)",borderRadius:26,padding:"7px 6px",boxShadow:dark?"0 8px 32px rgba(0,0,0,.55)":"0 8px 32px rgba(28,25,18,.14)",border:`1px solid ${dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.05)"}`}}>
            {TABS.map(({id,lbl,ic})=>{
              if(id==="__add")return(
                <button key={id} onClick={()=>{haptic(10);openAddPrefill();}} className="mt-press" aria-label="Add transaction"
                  style={{width:52,height:52,margin:"-10px 4px 0",borderRadius:26,flexShrink:0,background:`linear-gradient(180deg,${T.acc},${dark?"#0050c8":"#0051d5"})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 20px ${T.acc}59`,touchAction:"manipulation"}}>
                  {I.plus("#fff",26)}
                </button>
              );
              const act=tab===id,col=act?T.acc:T.txt3;
              const badge=id==="wallet"&&(activeDebts.length>0||dueCards.length>0);
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

      <TxSheet modal={modal} closeM={closeM} editId={editId} T={T} dark={dark} fmt={fmt} txForm={txForm} setTxForm={setTxForm} accs={accs} cats={cats} inp={inp} doAddTx={doAddTx} suggestCat={suggestCat} orderedCats={orderedCats} recentMerchants={recentMerchants} addQuickCat={addQuickCat}/>

      <DebtSheet modal={modal} closeM={closeM} editId={editId} T={T} dark={dark} fmt={fmt} debtForm={debtForm} setDebtForm={setDebtForm} accs={accs} inp={inp} doAddDebt={doAddDebt}/>

      <RepaySheet modal={modal} closeM={closeM} T={T} dark={dark} fmt={fmt} debts={debts} repayForm={repayForm} setRepayForm={setRepayForm} accs={accs} inp={inp} doRepay={doRepay}/>

      <AccSheet modal={modal} closeM={closeM} editId={editId} T={T} accForm={accForm} setAccForm={setAccForm} inp={inp} doAddAcc={doAddAcc} accs={accs}/>

      <CardSheet modal={modal} closeM={closeM} T={T} dark={dark} fmt={fmt} card={accs.find(a=>a.id===cardId)} txs={ctxs} getCat={getCat} accs={accs} onPayBill={payBill} doEditAcc={doEditAcc} haptic={haptic}/>

      <CatSheet modal={modal} closeM={closeM} editId={editId} T={T} catForm={catForm} setCatForm={setCatForm} inp={inp} doAddCat={doAddCat}/>

      <GoalSheet modal={modal} closeM={closeM} editId={editId} T={T} goalForm={goalForm} setGoalForm={setGoalForm} inp={inp} doAddGoal={doAddGoal}/>


      <NotifsSheet modal={modal} closeM={closeM} T={T} notifs={notifs} sdn={sdn} setTab={navTab} setAnaView={setAnaView} setPeopleView={setPeopleView} openCard={openCard}/>

      <SettingsSheet
        modal={modal} closeM={closeM} T={T} dark={dark} fileRef={fileRef} doImport={doImport} doExport={doExport} exportCSV={exportCSV} setTab={navTab} setAnaView={setAnaView} setModal={setModal} sbUser={sbUser}
        curId={curId} setCur={setCur} pin={pin} setPinFlow={setPinFlow} notifOn={notifOn} setNotif={setNotif}
        txs={txs} accs={accs} goals={goals} debts={debts} recurring={recurring} sa={sa} st={st} sg={sg} sr={sr} sd={sd} sb={sb} setOnbDone={setOnbDone} showToast={showToast}
      />

      <BankSyncSheet
        modal={modal} closeM={closeM} T={T} sbUser={sbUser} bankConns={bankConns} recoveryMode={recoveryMode}
        onSignIn={onSignIn} onStartConnect={onStartConnect} onFinishConnect={onFinishConnect}
        onSignOut={onSignOut} onChangePassword={onChangePassword} onSendReset={onSendReset} onCompleteReset={onCompleteReset}
        onRefresh={refreshBank} showToast={showToast}
      />

      {/* Picking a currency returns you to Settings, where you opened it from. */}
      <CurrencySheet modal={modal} onClose={()=>setModal("settings")} T={T} curId={curId} setCur={setCur}/>

      <ReviewSheet modal={modal} closeM={closeM} T={T} dark={dark} fmt={fmt} reviewTxs={reviewTxs} ctxs={ctxs} accs={accs} getCat={getCat}
        classifyReview={classifyReview} undoReview={undoReview} ownerName={ownerName} saveOwnerName={saveOwnerName} doEditTx={doEditTx}/>


    </div>
  );
}
