import {useState} from "react";
import {Link} from "react-router-dom";
import FormField from "../molecules/FormField.jsx";
import {exercisePayload} from "../../services/api/training.js";

export default function ExerciseForm({exercise,onSubmit,disabled=false}){
    const [values,setValues]=useState(()=>({name:"",description:"",muscle:"",difficulty:"Principiante",equipment:"",image:"",icon:"bi-activity",defaultSets:3,defaultReps:10,...exercise}));
    const [error,setError]=useState("");const [busy,setBusy]=useState(false);
    const change=event=>{setValues(current=>({...current,[event.target.name]:event.target.value}));setError("");};
    const props=name=>({name,value:values[name],disabled:disabled||busy,onChange:change});
    async function submit(event){event.preventDefault();if(disabled||busy)return;setBusy(true);setError("");try{const result=await onSubmit(exercisePayload(values));if(!result.success)setError(result.message);}catch{setError("No fue posible guardar el ejercicio.");}finally{setBusy(false);}}
    return <form className="auth-form" onSubmit={submit} aria-label="Datos del ejercicio" aria-busy={busy}>
        <FormField {...props("name")} label="Nombre del ejercicio" required maxLength={100}/>
        <FormField {...props("description")} label="Descripción" as="textarea" required maxLength={1000}/>
        <FormField {...props("muscle")} label="Grupo muscular" required maxLength={60}/>
        <FormField {...props("difficulty")} label="Dificultad" as="select" required>{["Principiante","Intermedio","Avanzado"].map(level=><option key={level}>{level}</option>)}</FormField>
        <FormField {...props("equipment")} label="Equipamiento" required maxLength={100}/>
        <FormField {...props("defaultSets")} label="Series sugeridas" type="number" min={1} max={20} step={1} required/>
        <FormField {...props("defaultReps")} label="Repeticiones sugeridas" type="number" min={1} max={100} step={1} required/>
        <FormField {...props("image")} label="Imagen" maxLength={1000} helpText="URL http(s) o imagen disponible en /media/training/."/>
        {error&&<p className="auth-form-alert" role="alert">{error}</p>}
        <div className="auth-form-actions"><button className="btn btn-success" disabled={disabled||busy}>{busy?"Guardando…":"Guardar ejercicio"}</button><Link className="btn btn-outline-light" to="/admin/ejercicios">Volver a ejercicios</Link></div>
    </form>;
}
