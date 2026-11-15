import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import useRoutine from "../hooks/useRoutine.js";
import FormField from "../components/molecules/FormField.jsx";
import RoutineItem from "../components/molecules/RoutineItem.jsx";
import ConfirmDeleteDialog from "../components/molecules/ConfirmDeleteDialog.jsx";

/** La confirmación distingue vaciar ejercicios de eliminar una rutina completa. */
export default function ApiRoutinePage(){
    const routine=useRoutine();const [newName,setNewName]=useState("");const [name,setName]=useState("");const [message,setMessage]=useState("");const [error,setError]=useState("");const [confirm,setConfirm]=useState(null);
    useEffect(()=>setName(routine.selected?.name||""),[routine.selected?.id,routine.selected?.name]);
    const disabled=routine.loading||routine.busy||routine.conflict;
    async function perform(action,notice){setError("");setMessage("");const result=await action();if(result.success){setMessage(notice);setConfirm(null);}else setError(result.message);return result;}
    return <>
        <section className="auth-page-header"><div className="container"><p className="kynex-eyebrow">KYNEX TRAINING</p><h1>Mis rutinas</h1><p>Tus rutinas se guardan en tu cuenta y están disponibles desde otros equipos.</p></div></section>
        <section className="training-section"><div className="container">
            {routine.loading?<p role="status">Cargando rutinas…</p>:!routine.success?<p className="auth-form-alert" role="alert">{routine.message}</p>:<>
                {routine.conflict&&<p className="auth-form-alert" role="alert">{routine.message}</p>}
                <form className="auth-form-panel mb-4" aria-label="Crear rutina" onSubmit={async event=>{event.preventDefault();const result=await perform(()=>routine.create(newName),"Rutina creada correctamente.");if(result.success)setNewName("");}}>
                    <h2>Nueva rutina</h2><FormField label="Nombre de la nueva rutina" required maxLength={100} value={newName} disabled={disabled} onChange={event=>setNewName(event.target.value)}/>
                    <button className="btn btn-success mt-3" disabled={disabled}>Crear rutina</button>
                </form>
                {!!routine.routines.length&&<>
                    <FormField label="Seleccionar rutina" as="select" value={routine.selected?.id||""} disabled={disabled} onChange={event=>{setError("");setMessage("");void routine.reload(Number(event.target.value));}}>
                        {routine.routines.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                    </FormField>
                    {routine.selected&&<>
                        <form className="auth-form-panel my-4" aria-label="Renombrar rutina" onSubmit={event=>{event.preventDefault();void perform(()=>routine.rename(name),"Nombre de rutina actualizado.");}}>
                            <h2>{routine.selected.name}</h2><FormField label="Nombre de la rutina" required maxLength={100} value={name} disabled={disabled} onChange={event=>setName(event.target.value)}/>
                            <button className="btn btn-outline-light mt-3" disabled={disabled}>Guardar nombre</button>
                        </form>
                        <section className="training-routine-summary" aria-label="Resumen de mi rutina"><dl><div><dt>Ejercicios</dt><dd>{routine.items.length}</dd></div><div><dt>Series totales</dt><dd>{routine.items.reduce((sum,item)=>sum+item.sets,0)}</dd></div></dl><Link className="btn btn-success" to="/entrenamiento">Agregar ejercicios</Link></section>
                        {!routine.items.length?<p role="status">Esta rutina está vacía. Agrega ejercicios desde la biblioteca.</p>
                            :<div className="training-routine-list">{routine.items.map(item=><div key={item.id}>
                                {!item.exercise.active&&<p className="auth-form-alert" role="status">{item.exercise.name} fue desactivado del catálogo. Se conserva en tu rutina para que puedas revisarlo.</p>}
                                <RoutineItem exercise={item.exercise} item={item} disabled={disabled} onUpdate={routine.update} onRemove={id=>perform(()=>routine.remove(id),"Ejercicio retirado de la rutina.")}/>
                            </div>)}</div>}
                        <div className="auth-form-actions my-4"><button className="btn btn-outline-light" disabled={disabled||!routine.items.length} onClick={()=>{setError("");setConfirm("clear");}}>Vaciar rutina</button>
                            <button className="btn btn-outline-danger" disabled={disabled} onClick={()=>{setError("");setConfirm("delete");}}>Eliminar rutina</button></div>
                    </>}
                </>}
            </>}
            <button className="btn btn-outline-light my-3" disabled={routine.busy||routine.loading} onClick={()=>{setError("");void routine.reload();}}>Actualizar rutinas</button>
            {message&&<p className="auth-form-success" role="status">{message}</p>}{error&&!confirm&&<p className="auth-form-alert" role="alert">{error}</p>}
            {confirm&&<ConfirmDeleteDialog title={confirm==="clear"?"Vaciar rutina":"Eliminar rutina"} confirmLabel={confirm==="clear"?"Vaciar rutina":"Eliminar rutina"} busy={routine.busy} error={error}
                description={confirm==="clear"?"Se retirarán todos los ejercicios; se conservará el nombre de la rutina.":"Se eliminará esta rutina y sus ejercicios. Las otras rutinas se conservarán."}
                onCancel={()=>{setConfirm(null);setError("");}} onConfirm={()=>perform(confirm==="clear"?routine.clear:routine.removeRoutine,confirm==="clear"?"Rutina vaciada correctamente.":"Rutina eliminada correctamente.")}/>}
        </div></section>
    </>;
}
