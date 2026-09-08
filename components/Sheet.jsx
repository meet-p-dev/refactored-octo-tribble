"use client";

import { motion, AnimatePresence, useDragControls } from "motion/react";
import { I } from "@/lib/icons";

export function Sheet({open,onClose,title,T,children}){
  const dragControls=useDragControls();
  return(
    <AnimatePresence>
      {open&&(
        <motion.div style={{position:"fixed",inset:0,zIndex:300}}>
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}}
            style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}
            onClick={onClose}
          />
          <motion.div
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{top:0,bottom:0}}
            dragElastic={{top:0,bottom:.5}}
            onDragEnd={(e,info)=>{
              if(info.offset.y>100||info.velocity.y>500)onClose();
            }}
            initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
            transition={{type:"spring",damping:32,stiffness:380}}
            style={{position:"absolute",bottom:0,left:0,right:0,background:T.card,borderRadius:"22px 22px 0 0",paddingBottom:"calc(env(safe-area-inset-bottom) + 12px)",maxHeight:"calc(100vh - env(safe-area-inset-top) - 32px)",display:"flex",flexDirection:"column",boxShadow:"0 -4px 30px rgba(0,0,0,.3)"}}
          >
            <div
              onPointerDown={e=>dragControls.start(e)}
              style={{width:36,height:4,background:T.border,borderRadius:99,margin:"12px auto 2px",flexShrink:0,cursor:"grab",touchAction:"none"}}
            />
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontWeight:700,fontSize:18,color:T.txt}}>{title}</span>
              <button onClick={onClose} style={{background:T.cardH,border:"none",borderRadius:99,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.x(T.txt2)}</button>
            </div>
            <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 4px"}}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
