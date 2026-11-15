import { createContext,useContext,useEffect,useRef,useState,useSyncExternalStore } from "react";
import { usesApi } from "../config/dataSource.js";
import useAuth from "../hooks/useAuth.js";
import { createRoutineStore } from "../services/api/routines.js";

export const RoutineContext=createContext(null);
function AccountRoutine({children}) {
    const channel=useRef(null);const [store]=useState(()=>createRoutineStore({notify:()=>channel.current?.postMessage({type:"routine-changed"})}));
    useEffect(()=>{
        if(typeof BroadcastChannel!=="undefined"){
            channel.current=new BroadcastChannel("kynex-routine-events");channel.current.onmessage=event=>{if(event.data?.type==="routine-changed")store.invalidate();};
        }
        return()=>{channel.current?.close();channel.current=null;};
    },[store]);
    return <RoutineContext.Provider value={store}>{children}</RoutineContext.Provider>;
}
function ConnectedRoutine({children}) {
    const {user}=useAuth();return user?<AccountRoutine key={user.id}>{children}</AccountRoutine>:<RoutineContext.Provider value={null}>{children}</RoutineContext.Provider>;
}
export default function RoutineProvider({children}){return usesApi?<ConnectedRoutine>{children}</ConnectedRoutine>:children;}
const visitor={success:true,loading:false,busy:false,items:[],routines:[],selected:null,message:"",conflict:false};
const noSubscription=()=>()=>{};
export function useAccountRoutine(){
    const store=useContext(RoutineContext);const state=useSyncExternalStore(store?.subscribe||noSubscription,store?.read||(()=>visitor),store?.read||(()=>visitor));
    return {...state,...(store?{reload:store.reload,create:store.create,rename:store.rename,removeRoutine:store.removeRoutine,clear:store.clear,add:store.add,update:store.update,remove:store.remove}:{})};
}
