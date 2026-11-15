import {useState} from "react";
import {Link,useLocation} from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import {readExercises,writeExercise} from "../services/api/training.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ConfirmDeleteDialog from "../components/molecules/ConfirmDeleteDialog.jsx";

export default function AdminExercisesPage(){
    const resource=useApiResource("/admin/exercises",readExercises);const {state}=useLocation();const [notice,setNotice]=useState(state?.notice||"");const [error,setError]=useState("");const [selected,setSelected]=useState(null);const [busy,setBusy]=useState(false);
    async function change(exercise,activate=false){if(busy)return;setBusy(true);setError("");try{
        const result=await writeExercise(activate?`/admin/exercises/${exercise.id}/activation`:`/admin/exercises/${exercise.id}?version=${exercise.version}`,activate?{method:"PUT",body:{version:exercise.version}}:{method:"DELETE"});
        if(result.success){setSelected(null);setNotice(activate?"Ejercicio reactivado correctamente.":"Ejercicio desactivado. Las rutinas existentes se conservan.");await resource.reload();}else setError(result.message);
    }finally{setBusy(false);}}
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">ENTRENAMIENTO KYNEX</p><h1>Ejercicios</h1><p>Gestiona la biblioteca de entrenamiento.</p></div><Link className="btn btn-success" to="/admin/ejercicios/nuevo">Nuevo ejercicio</Link></header>
        {notice&&<p className="auth-form-success" role="status">{notice}</p>}{error&&!selected&&<p className="auth-form-alert" role="alert">{error}</p>}
        {resource.loading||resource.error?<ApiResourceState resource={resource}/>:<>
            <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region" aria-label="Listado de ejercicios"><table className="table align-middle kynex-users-table"><thead><tr>{["Nombre","Grupo","Dificultad","Estado","Acciones"].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead>
                <tbody>{resource.data.map(e=><tr key={e.id}><th scope="row">{e.name}</th><td>{e.muscle}</td><td>{e.difficulty}</td><td>{e.active?"Activo":"Inactivo"}</td><td><div className="kynex-user-actions"><Link className="btn btn-outline-light btn-sm" to={`/admin/ejercicios/${e.id}/editar`} aria-label={`Editar ${e.name}`}>Editar</Link>
                    <button className={e.active?"btn btn-outline-danger btn-sm":"btn btn-outline-success btn-sm"} disabled={busy} aria-label={`${e.active?"Desactivar":"Reactivar"} ${e.name}`} onClick={()=>{setError("");e.active?setSelected(e):void change(e,true);}}>{e.active?"Desactivar":"Reactivar"}</button></div></td></tr>)}</tbody></table></div>
            {!resource.data.length&&<p role="status">No hay ejercicios registrados.</p>}
            <button className="btn btn-outline-light mt-3" disabled={busy} onClick={resource.reload}>Actualizar ejercicios</button>
        </>}
        {selected&&<ConfirmDeleteDialog title="Desactivar ejercicio" confirmLabel="Desactivar ejercicio" busyLabel="Desactivando…" busy={busy} error={error} description="El ejercicio dejará de ofrecerse para agregar, pero se conservará en las rutinas existentes." onCancel={()=>{setSelected(null);setError("");}} onConfirm={()=>change(selected)}/>}
    </>;
}
