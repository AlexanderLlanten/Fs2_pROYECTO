import { apiSession } from "./session.js";
import { exerciseImage } from "./training.js";
import { getRoutineValueError } from "../../utils/routine.js";

/** Cada almacén pertenece a una sesión. Las respuestas y borradores no se guardan en LocalStorage. */
export function createRoutineStore({ request = apiSession.authorized, notify = () => {} } = {}) {
    let state = { success:false, loading:true, busy:false, routines:[], selected:null, items:[], message:"", conflict:false };
    let started=false, pending; const listeners=new Set(); const guard=apiSession.guard();
    const publish=next=>{state=next;listeners.forEach(listener=>listener());};
    const accept = detail => ({ selected:detail,items:detail?.items.map(item=>({...item,exercise:exerciseImage(item.exercise)})) || [] });
    async function reload(id=state.selected?.id) {
        if(pending)return pending;
        if(state.busy)return {success:false,message:"Espera a terminar la operación."};
        started=true;publish({...state,loading:true,message:""});
        pending=(async()=>{
            try {
                guard();const routines=await request("/routines");const selectedId=routines.some(item=>item.id===id)?id:routines[0]?.id;
                const detail=selectedId?await request(`/routines/${selectedId}`):null;
                publish({...state,success:true,loading:false,busy:false,routines,...accept(detail),message:"",conflict:false});return {success:true};
            }catch(error){publish({...state,success:false,loading:false,busy:false,message:error.message});return {success:false,message:error.message};}
            finally{pending=undefined;}
        })();return pending;
    }
    async function change(path,options,{deleted=false}={}) {
        if(!state.success||state.loading||state.busy||state.conflict)return {success:false,message:"Actualiza las rutinas antes de modificarlas."};
        publish({...state,busy:true,message:""});
        try {
            guard();const detail=await request(path,options);
            if(deleted){publish({...state,busy:false});await reload();}
            else {
                const summary={id:detail.id,name:detail.name,version:detail.version,totalExercises:detail.items.length,totalSets:detail.items.reduce((sum,item)=>sum+item.sets,0)};
                const routines=state.routines.some(item=>item.id===detail.id)?state.routines.map(item=>item.id===detail.id?summary:item):[...state.routines,summary];
                publish({...state,success:true,busy:false,routines,...accept(detail),message:"",conflict:false});
            }
            notify();return {success:true};
        }catch(error){publish({...state,busy:false,message:error.message,conflict:error.status===409});return {success:false,message:error.message};}
    }
    const selected=()=>state.selected;
    return {
        read:()=>state,
        subscribe(listener){listeners.add(listener);if(!started)void reload();return()=>listeners.delete(listener);},reload,
        invalidate(){if(started)publish({...state,conflict:true,message:"Tus rutinas cambiaron en otra pestaña. Actualiza antes de continuar."});},
        create(name){if(!name.trim()||name.trim().length>100)return Promise.resolve({success:false,message:"Escribe un nombre de hasta 100 caracteres."});return change("/routines",{method:"POST",body:{name:name.trim()}});},
        rename(name){if(!selected()||!name.trim()||name.trim().length>100)return Promise.resolve({success:false,message:"Escribe un nombre de hasta 100 caracteres."});return change(`/routines/${selected().id}`,{method:"PUT",body:{name:name.trim(),version:selected().version}});},
        removeRoutine:()=>selected()?change(`/routines/${selected().id}?version=${selected().version}`,{method:"DELETE"},{deleted:true}):Promise.resolve({success:false}),
        clear:()=>selected()?change(`/routines/${selected().id}/items?version=${selected().version}`,{method:"DELETE"}):Promise.resolve({success:false}),
        add(id){if(!selected())return Promise.resolve({success:false,message:"Crea y selecciona una rutina antes de agregar ejercicios."});return change(`/routines/${selected().id}/items/${id}`,{method:"POST",body:{version:selected().version}});},
        update(id,field,value){
            const error=getRoutineValueError(field,value);if(error)return Promise.resolve({success:false,message:error});
            const item=state.items.find(item=>item.id===id);if(!item||!selected())return Promise.resolve({success:false,message:"El ejercicio ya no está en la rutina."});
            return change(`/routines/${selected().id}/items/${id}`,{method:"PUT",body:{sets:item.sets,reps:item.reps,[field]:Number(value),version:selected().version}});
        },
        remove:id=>selected()?change(`/routines/${selected().id}/items/${id}?version=${selected().version}`,{method:"DELETE"}):Promise.resolve({success:false})
    };
}
