import {useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import {readExercises,writeExercise} from "../services/api/training.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ExerciseForm from "../components/organisms/ExerciseForm.jsx";

function Editor({id}){
    const editing=id!==undefined;const resource=useApiResource(editing?`/admin/exercises/${id}`:null,readExercises);const [stale,setStale]=useState(false);const navigate=useNavigate();
    async function submit(data){
        const result=await writeExercise(editing?`/admin/exercises/${id}`:"/admin/exercises",{method:editing?"PUT":"POST",body:data});
        if(result.success)navigate("/admin/ejercicios",{replace:true,state:{notice:editing?"Ejercicio actualizado correctamente.":"Ejercicio creado correctamente."}});
        else if(editing&&result.conflict)setStale(true);return result;
    }
    return <><header className="kynex-admin-heading"><div><p className="kynex-eyebrow">BIBLIOTECA KYNEX</p><h1>{editing?"Editar ejercicio":"Nuevo ejercicio"}</h1></div></header>
        {resource.loading||resource.error?<ApiResourceState resource={resource}/>:<div className="auth-form-panel kynex-admin-user-form">
            {stale&&<div className="auth-form-alert" role="status"><p>El ejercicio cambió o tiene datos en conflicto. Se conservó tu formulario.</p><button className="btn btn-outline-light" onClick={()=>{setStale(false);void resource.reload();}}>Recargar datos</button></div>}
            <ExerciseForm exercise={resource.data} disabled={stale} onSubmit={submit}/>
        </div>}
    </>;
}
export default function AdminExerciseFormPage(){const {id}=useParams();return <Editor key={id||"new"} id={id}/>;}
