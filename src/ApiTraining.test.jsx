import {beforeEach,afterEach,afterAll,describe,it,expect,vi} from "vitest";
import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(()=>vi.stubEnv("VITE_DATA_SOURCE","api"));
import App from "./App.jsx";
import {apiSession} from "./services/api/session.js";
import {remoteCatalog} from "./services/api/catalogStore.js";
const original={id:1,name:"Press de banca",description:"Descripción del servidor",muscle:"Pecho",difficulty:"Intermedio",equipment:"Barra",icon:"bi-activity",image:"/media/training/press-banca.jpg",defaultSets:4,defaultReps:10,active:true,version:0};
let library,routines,role,calls,conflict,offline;
beforeEach(async()=>{
    library=[structuredClone(original)];routines=[];role="Administrador";calls=[];conflict=false;offline=false;localStorage.clear();sessionStorage.clear();
    vi.stubGlobal("fetch",vi.fn(async(address,options)=>{
        const url=new URL(address),path=url.pathname.replace("/api/v1","");const data=options.body?JSON.parse(options.body):null;calls.push({path,method:options.method,data,token:options.headers.Authorization});let result;
        if(path==="/auth/csrf")result={token:"csrf"};
        else if(path==="/auth/login"||path==="/auth/refresh")result={accessToken:"training-token",expiresIn:600,user:{id:17,firstName:"Daniela",role,email:"test@example.com"}};
        else if(path==="/auth/me")result={id:17,firstName:"Daniela",role};
        else if(path==="/products")result=[];
        else if(path==="/cart")result={version:0,items:[],totalItems:0,subtotal:0,shipping:0,total:0,canCheckout:false,warnings:[]};
        else if(path==="/exercises"){if(offline)throw new TypeError("Failed to fetch");result=library.filter(e=>e.active);}
        else if(path.startsWith("/admin/exercises")){
            const id=Number(path.split("/")[3]);const found=library.find(e=>e.id===id);
            if(options.method==="GET")result=Number.isNaN(id)?library:found;
            else if(options.method==="POST"){result={...data,id:9,active:true,version:0};library.push(result);}
            else if(options.method==="DELETE"){found.active=false;found.version++;return {ok:true,status:204};}
            else {if(path.endsWith("activation"))found.active=true;else Object.assign(found,data);found.version++;result=found;}
        } else if(path==="/routines"){
            if(options.method==="POST"){result={id:routines.length+1,name:data.name,version:0,items:[]};routines.push(result);}else result=routines;
        } else if(path.startsWith("/routines/")){
            const id=Number(path.split("/")[2]),itemId=Number(path.split("/")[4]);const routine=routines.find(r=>r.id===id);
            if(options.method==="GET")result=routine;
            else {
                if(conflict)return {ok:false,status:409,json:async()=>({detail:"Los datos cambiaron. Recarga antes de guardar."})};
                if(path.includes("/items")){
                    if(options.method==="POST"){const exercise=library.find(e=>e.id===itemId);routine.items.push({id:itemId,sets:exercise.defaultSets,reps:exercise.defaultReps,exercise});}
                    else if(options.method==="PUT")Object.assign(routine.items.find(i=>i.id===itemId),{sets:data.sets,reps:data.reps});
                    else routine.items=Number.isNaN(itemId)?[]:routine.items.filter(i=>i.id!==itemId);
                }else if(options.method==="PUT")routine.name=data.name;
                else {routines=routines.filter(r=>r.id!==id);return {ok:true,status:204};}
                routine.version++;result=routine;
            }
        } else throw new Error(`Ruta no prevista ${options.method} ${path}`);
        return {ok:true,status:200,json:async()=>structuredClone(result)};
    }));
    await apiSession.login("test@example.com","ClavePrueba2026!");await remoteCatalog.reload();
});
afterEach(()=>{apiSession.invalidate();vi.unstubAllGlobals();window.history.replaceState({},"","/");});afterAll(()=>vi.unstubAllEnvs());
function open(path){window.history.replaceState({},"",path);return render(<App/>);}
describe("Entrenamiento conectado",()=>{
    it("muestra la biblioteca del servidor y exige crear una rutina antes de agregar",async()=>{
        open("/entrenamiento");expect(await screen.findByRole("heading",{name:"Press de banca"})).toBeInTheDocument();expect(await screen.findByText(/Crea una rutina para comenzar/)).toBeInTheDocument();expect(screen.getByRole("button",{name:"Agregar Press de banca a mi rutina"})).toBeDisabled();
        expect(screen.getByAltText("Press de banca")).toHaveAttribute("src","http://localhost:8080/media/training/press-banca.jpg");
    });
    it("crea dos rutinas, elige destino y guarda el ejercicio con sugerencias",async()=>{
        open("/rutina");const user=userEvent.setup();const name=await screen.findByRole("textbox",{name:"Nombre de la nueva rutina"});
        await user.type(name,"Fuerza");await user.click(screen.getByRole("button",{name:"Crear rutina",exact:true}));await screen.findByRole("heading",{name:"Fuerza",exact:true});
        await user.type(screen.getByRole("textbox",{name:"Nombre de la nueva rutina"}),"Movilidad");await user.click(screen.getByRole("button",{name:"Crear rutina",exact:true}));await screen.findByRole("heading",{name:"Movilidad",exact:true});
        await user.selectOptions(screen.getByRole("combobox",{name:"Seleccionar rutina"}),"1");await screen.findByRole("heading",{name:"Fuerza",exact:true});await user.click(screen.getByRole("link",{name:"Agregar ejercicios",exact:true}));
        await user.click(await screen.findByRole("button",{name:"Agregar Press de banca a mi rutina"}));expect(await screen.findByText("Press de banca fue agregado a tu rutina.")).toBeInTheDocument();
        expect(calls.find(c=>c.method==="POST"&&c.path==="/routines/1/items/1")).toMatchObject({data:{version:0},token:"Bearer training-token"});expect(localStorage.getItem("kynex_routine")).toBeNull();
    });
    it("edita series por HTTP sin modificar los valores sugeridos del catálogo",async()=>{
        routines=[{id:3,name:"Fuerza",version:2,items:[{id:1,sets:4,reps:10,exercise:original}]}];open("/rutina");const user=userEvent.setup();const sets=await screen.findByRole("spinbutton",{name:"Series",exact:true});
        await user.clear(sets);await user.type(sets,"6");await user.tab();await vi.waitFor(()=>expect(routines[0].items[0].sets).toBe(6));
        expect(calls.find(c=>c.method==="PUT"&&c.path==="/routines/3/items/1").data).toEqual({sets:6,reps:10,version:2});expect(library[0].defaultSets).toBe(4);
    });
    it("mantiene el valor escrito y bloquea reintentos si hay conflicto",async()=>{
        routines=[{id:3,name:"Fuerza",version:2,items:[{id:1,sets:4,reps:10,exercise:original}]}];open("/rutina");const user=userEvent.setup();const sets=await screen.findByRole("spinbutton",{name:"Series",exact:true});conflict=true;
        await user.clear(sets);await user.type(sets,"6");await user.tab();expect(await screen.findByRole("alert")).toHaveTextContent("Los datos cambiaron");expect(sets).toHaveValue(6);expect(sets).toBeDisabled();
    });
    it("confirma vaciar y eliminar como operaciones diferentes",async()=>{
        routines=[{id:3,name:"Fuerza",version:2,items:[{id:1,sets:4,reps:10,exercise:original}]}];open("/rutina");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Vaciar rutina",exact:true}));
        await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Cancelar",exact:true}));expect(routines[0].items).toHaveLength(1);
        await user.click(screen.getByRole("button",{name:"Vaciar rutina",exact:true}));await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Vaciar rutina",exact:true}));expect(await screen.findByText("Rutina vaciada correctamente.")).toBeInTheDocument();expect(routines).toHaveLength(1);
        await user.click(screen.getByRole("button",{name:"Eliminar rutina",exact:true}));await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Eliminar rutina",exact:true}));expect(await screen.findByText("Rutina eliminada correctamente.")).toBeInTheDocument();expect(routines).toHaveLength(0);
    });
    it("conserva ejercicios desactivados en la rutina y muestra su estado",async()=>{
        routines=[{id:3,name:"Fuerza",version:2,items:[{id:1,sets:4,reps:10,exercise:{...original,active:false}}]}];open("/rutina");expect(await screen.findByText(/fue desactivado del catálogo/)).toBeInTheDocument();expect(screen.getByRole("spinbutton",{name:"Series",exact:true})).toHaveValue(4);
    });
    it("ofrece acceso al visitante y protege las rutinas antes de consultar datos",async()=>{
        apiSession.invalidate();open("/rutina");expect(await screen.findByRole("button",{name:"Iniciar sesión",exact:true})).toBeInTheDocument();expect(calls.some(c=>c.path==="/routines")).toBe(false);
    });
    it("permite consultar la biblioteca sin sesión y dirige al login al agregar",async()=>{
        apiSession.invalidate();open("/entrenamiento");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Agregar Press de banca a mi rutina"}));expect(await screen.findByRole("button",{name:"Iniciar sesión",exact:true})).toBeInTheDocument();expect(calls.some(c=>c.path==="/routines")).toBe(false);
    });
    it.each(["Cliente","Vendedor"])("oculta y protege la administración al perfil %s",async next=>{
        role=next;await apiSession.identity();open("/admin/ejercicios");await vi.waitFor(()=>expect(window.location.pathname).toBe(next==="Cliente"?"/productos":"/admin"));expect(calls.some(c=>c.path==="/admin/exercises")).toBe(false);expect(screen.queryByRole("link",{name:"Ejercicios",exact:true})).not.toBeInTheDocument();
    });
    it("administra la baja y reactivación desde el servidor",async()=>{
        open("/admin/ejercicios");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Desactivar Press de banca"}));await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Desactivar ejercicio",exact:true}));expect(await screen.findByText("Ejercicio desactivado. Las rutinas existentes se conservan.")).toBeInTheDocument();
        await user.click(await screen.findByRole("button",{name:"Reactivar Press de banca"}));expect(await screen.findByText("Ejercicio reactivado correctamente.")).toBeInTheDocument();
    });
    it("crea y edita un ejercicio con versión y datos normalizados",async()=>{
        open("/admin/ejercicios/nuevo");const user=userEvent.setup();await user.type(await screen.findByRole("textbox",{name:"Nombre del ejercicio"}),"Ejercicio nuevo");
        await user.type(screen.getByRole("textbox",{name:"Descripción",exact:true}),"Descripción nueva");await user.type(screen.getByRole("textbox",{name:"Grupo muscular"}),"Piernas");await user.type(screen.getByRole("textbox",{name:"Equipamiento"}),"Barra");
        await user.click(screen.getByRole("button",{name:"Guardar ejercicio",exact:true}));expect(await screen.findByText("Ejercicio creado correctamente.")).toBeInTheDocument();
        expect(calls.find(c=>c.method==="POST"&&c.path==="/admin/exercises")).toMatchObject({token:"Bearer training-token",data:{name:"Ejercicio nuevo",defaultSets:3,defaultReps:10}});
        await user.click(await screen.findByRole("link",{name:"Editar Ejercicio nuevo",exact:true}));const name=await screen.findByRole("textbox",{name:"Nombre del ejercicio"});await user.clear(name);await user.type(name,"Ejercicio editado");await user.click(screen.getByRole("button",{name:"Guardar ejercicio",exact:true}));
        expect(await screen.findByText("Ejercicio actualizado correctamente.")).toBeInTheDocument();expect(calls.find(c=>c.method==="PUT"&&c.path==="/admin/exercises/9").data).toMatchObject({version:0,name:"Ejercicio editado"});
    });
    it("renombra una rutina sin modificar sus ejercicios",async()=>{
        routines=[{id:3,name:"Fuerza",version:2,items:[{id:1,sets:4,reps:10,exercise:original}]}];open("/rutina");const user=userEvent.setup();const field=await screen.findByRole("textbox",{name:"Nombre de la rutina",exact:true});
        await user.clear(field);await user.type(field,"Fuerza actualizada");await user.click(screen.getByRole("button",{name:"Guardar nombre",exact:true}));expect(await screen.findByText("Nombre de rutina actualizado.")).toBeInTheDocument();expect(routines[0].items).toHaveLength(1);
    });
    it("distingue una caída de la API de una biblioteca vacía",async()=>{
        offline=true;open("/entrenamiento");expect(await screen.findByText(/No fue posible conectar con el servidor/)).toBeInTheDocument();expect(screen.queryByText(/No se encontraron ejercicios/)).not.toBeInTheDocument();
    });
});
