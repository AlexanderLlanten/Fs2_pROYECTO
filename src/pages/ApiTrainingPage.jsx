import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useRoutine from "../hooks/useRoutine.js";
import useApiResource from "../hooks/useApiResource.js";
import { readExercises } from "../services/api/training.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ExerciseLibrary from "../components/organisms/ExerciseLibrary.jsx";
import FormField from "../components/molecules/FormField.jsx";

export default function ApiTrainingPage(){
    const resource=useApiResource("/exercises",readExercises);const routine=useRoutine();const {user}=useAuth();const navigate=useNavigate();const [notice,setNotice]=useState(null);
    async function add(exercise){
        if(!user){navigate("/login",{state:{from:{pathname:"/entrenamiento"}}});return;}
        const result=await routine.add(exercise.id);setNotice({success:result.success,message:result.success?`${exercise.name} fue agregado a tu rutina.`:result.message});
    }
    return <>
        <section className="auth-page-header"><div className="container training-heading"><div><p className="kynex-eyebrow">KYNEX TRAINING</p><h1>Entrenamiento</h1><p>Explora la biblioteca y agrega ejercicios a tus rutinas.</p></div><Link className="btn btn-outline-light" to="/rutina">Ver mis rutinas</Link></div></section>
        <div className="container pt-4">
            {!user?<p><Link to="/login" state={{from:{pathname:"/entrenamiento"}}}>Inicia sesión para guardar tus rutinas</Link></p>
                :routine.loading?<p role="status">Cargando tus rutinas…</p>:!routine.success?<div role="alert"><p>{routine.message}</p><button className="btn btn-outline-light" onClick={()=>routine.reload()}>Actualizar rutinas</button></div>
                :!routine.routines.length?<p>Crea una rutina para comenzar. <Link to="/rutina">Crear mi primera rutina</Link></p>
                :<FormField label="Rutina de destino" as="select" value={routine.selected?.id||""} disabled={routine.busy||routine.conflict} onChange={event=>{setNotice(null);void routine.reload(Number(event.target.value));}}>
                    {routine.routines.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                </FormField>}
            {routine.conflict&&<div role="alert"><p>{routine.message}</p><button className="btn btn-outline-light" onClick={()=>routine.reload()}>Actualizar rutinas</button></div>}
            {notice&&<p className={notice.success?"auth-form-success":"auth-form-alert"} role={notice.success?"status":"alert"}>{notice.message}</p>}
        </div>
        {resource.loading||resource.error?<div className="container my-4"><ApiResourceState resource={resource}/></div>
            :<ExerciseLibrary exercises={resource.data} items={routine.items} disabled={!!user&&(!routine.selected||routine.loading||routine.busy||routine.conflict||!routine.success)} onAdd={add}/>}
    </>;
}
