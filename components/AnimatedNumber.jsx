"use client";

import { useEffect, useState } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";

export function AnimatedNumber({value,format,style,className}){
  const spring=useSpring(value||0,{stiffness:170,damping:26,mass:1});
  const [d,setD]=useState(value||0);
  useEffect(()=>{spring.set(value||0);},[value,spring]);
  useMotionValueEvent(spring,"change",latest=>setD(latest));
  return <span className={className} style={style}>{format?format(d):Math.round(d)}</span>;
}
