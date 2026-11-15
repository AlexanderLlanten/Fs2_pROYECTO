import {describe,it,expect,vi} from "vitest";
import {createRoutineStore} from "./routines.js";
import {apiSession} from "./session.js";
import {ApiError} from "./client.js";
const exercise={id:1,name:"Press de banca",active:true,image:"/media/training/press-banca.jpg"};
const detail=(version=0,sets=4)=>({id:3,name:"Fuerza",version,items:[{id:1,sets,reps:10,exercise}]});
describe("Rutinas privadas HTTP",()=>{
    it("recupera lista y detalle sin escribir datos privados en el navegador",async()=>{
        localStorage.clear();const request=vi.fn(async path=>path==="/routines"?[{id:3,name:"Fuerza"}]:detail());
        const store=createRoutineStore({request});await store.reload();expect(store.read().items[0].exercise.image).toBe("http://localhost:8080/media/training/press-banca.jpg");expect(localStorage.length).toBe(0);
    });
    it("crea una rutina y envía un nombre normalizado sin propietario",async()=>{
        const request=vi.fn(async(path,options)=>options?.method==="POST"?detail():[]);const store=createRoutineStore({request});await store.reload();await store.create(" Fuerza ");
        expect(request).toHaveBeenLastCalledWith("/routines",{method:"POST",body:{name:"Fuerza"}});expect(store.read().selected.id).toBe(3);
    });
    it("envía la prescripción completa y su versión",async()=>{
        const request=vi.fn(async(path,options)=>options?detail(1,6):path==="/routines"?[{id:3}]:detail());const store=createRoutineStore({request});await store.reload();await store.update(1,"sets","6");
        expect(request).toHaveBeenLastCalledWith("/routines/3/items/1",{method:"PUT",body:{sets:6,reps:10,version:0}});
    });
    it("conserva los datos al recibir un conflicto y no reintenta una escritura",async()=>{
        const request=vi.fn(async(path,options)=>{if(options)throw new ApiError("La rutina cambió",409);return path==="/routines"?[{id:3}]:detail();});const store=createRoutineStore({request});await store.reload();
        expect((await store.update(1,"sets",6)).success).toBe(false);expect(store.read()).toMatchObject({conflict:true,items:[{sets:4}]});
        await store.update(1,"sets",7);expect(request.mock.calls.filter(([,options])=>options)).toHaveLength(1);await store.reload();expect(store.read().conflict).toBe(false);
    });
    it("distingue la falta de conexión de una cuenta sin rutinas",async()=>{
        const store=createRoutineStore({request:async()=>{throw new ApiError("Sin conexión");}});await store.reload();expect(store.read()).toMatchObject({success:false,loading:false,message:"Sin conexión"});
    });
    it("detiene una operación de una sesión anterior",async()=>{
        const request=vi.fn(async path=>path==="/routines"?[{id:3}]:detail());const store=createRoutineStore({request});await store.reload();apiSession.invalidate();
        expect((await store.add(2)).success).toBe(false);expect(request.mock.calls.filter(([,options])=>options)).toHaveLength(0);
    });
    it("el aviso entre pestañas conserva el detalle hasta la recarga explícita",async()=>{
        const store=createRoutineStore({request:async path=>path==="/routines"?[{id:3}]:detail()});await store.reload();store.invalidate();expect(store.read()).toMatchObject({conflict:true,items:[{sets:4}]});
    });
});
