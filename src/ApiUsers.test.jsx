import { beforeEach,afterEach,afterAll,describe,it,expect,vi } from "vitest";
import { render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(()=>vi.stubEnv("VITE_DATA_SOURCE","api"));
import App from "./App.jsx";
import {apiSession} from "./services/api/session.js";
import {remoteCatalog} from "./services/api/catalogStore.js";
import {registrationData,fillRegistration} from "./test/registration.js";

const initial=[{...registrationData,id:17,firstName:"Administración",email:"admin@example.com",role:"Administrador",active:true,version:0},
    {...registrationData,id:21,run:"123456785",firstName:"Camila",email:"camila@example.com",role:"Cliente",active:true,version:3}];
const roles={ADMINISTRADOR:"Administrador",VENDEDOR:"Vendedor",CLIENTE:"Cliente"};
let records,mutations,conflict,requests;
beforeEach(async()=>{
    records=structuredClone(initial);mutations=[];requests=[];conflict=false;localStorage.clear();sessionStorage.clear();
    vi.stubGlobal("fetch",vi.fn(async(address,options)=>{
        const url=new URL(address),path=url.pathname.replace("/api/v1","");requests.push(path);
        const data=options.body?JSON.parse(options.body):null;let result;
        if(path==="/auth/csrf")result={token:"csrf"};
        else if(path==="/auth/login"||path==="/auth/refresh")result={accessToken:"users-token",expiresIn:600,user:structuredClone(records[0])};
        else if(path==="/auth/me")result=structuredClone(records[0]);
        else if(path==="/products")result=[];
        else if(path==="/cart")result={version:0,items:[],totalItems:0,subtotal:0,shipping:0,total:0,canCheckout:false,warnings:[]};
        else if(path.startsWith("/admin/users")&&records[0].role!=="Administrador")return {status:403,ok:false,json:async()=>({detail:"Sin permiso"})};
        else if(path==="/admin/users"&&options.method==="GET")result=structuredClone(records);
        else if(path==="/admin/users"&&options.method==="POST"){
            mutations.push({path,method:options.method,data,token:options.headers.Authorization});
            result={...data.profile,id:33,role:roles[data.role],active:true,version:0};delete result.password;records.push(result);
        } else if(path==="/profile"||/^\/admin\/users\/\d+(\/activation)?$/.test(path)){
            const id=path==="/profile"?17:Number(path.split("/")[3]);const record=records.find(user=>user.id===id);
            if(options.method==="GET")result=structuredClone(record);
            else {
                mutations.push({path,method:options.method,data,token:options.headers.Authorization,version:url.searchParams.get("version")});
                if(conflict){record.firstName="Cambio externo";record.version++;return {status:409,ok:false,json:async()=>({detail:"La cuenta cambió. Recarga sus datos antes de guardar."})};}
                if(options.method==="DELETE"){record.active=false;record.version++;return {status:204,ok:true};}
                if(path.endsWith("/activation"))record.active=true;
                else {Object.assign(record,data.profile);if(data.role)record.role=roles[data.role];}
                record.version++;result=structuredClone(record);
            }
        } else throw new Error(`Ruta no prevista: ${options.method} ${path}`);
        return {ok:true,status:200,json:async()=>result};
    }));
    await apiSession.login("admin@example.com","ClavePrueba2026!");await remoteCatalog.reload();
});
afterEach(()=>{apiSession.invalidate();vi.unstubAllGlobals();window.history.replaceState({},"","/");});
afterAll(()=>vi.unstubAllEnvs());
function open(path){window.history.replaceState({},"",path);return render(<App/>);}
describe("Cuentas conectadas",()=>{
    it("lista cuentas reales y protege la desactivación propia",async()=>{
        open("/admin/usuarios");const table=await screen.findByRole("table");
        expect(table).toHaveTextContent("camila@example.com");expect(table).toHaveTextContent("Activa");
        expect(screen.queryByRole("button",{name:/Desactivar a Administración/})).not.toBeInTheDocument();
        expect(localStorage.getItem("kynex_users")).toBeNull();
    });
    it("crea con contraseña elegida y rol mediante JWT",async()=>{
        open("/admin/usuarios/nuevo");await screen.findByRole("textbox",{name:"RUN",exact:true});const user=userEvent.setup();await fillRegistration(user);
        await user.selectOptions(screen.getByRole("combobox",{name:"Tipo de usuario"}),"Vendedor");
        await user.type(screen.getByLabelText(/^Contraseña inicial/),"ClaveNueva2026!");await user.type(screen.getByLabelText(/^Confirmar contraseña/),"ClaveNueva2026!");
        await user.click(screen.getByRole("button",{name:"Guardar usuario",exact:true}));
        expect(await screen.findByText("Usuario creado correctamente.")).toBeInTheDocument();
        expect(mutations[0]).toMatchObject({method:"POST",token:"Bearer users-token",data:{role:"VENDEDOR",profile:{...registrationData,password:"ClaveNueva2026!"}}});
        expect(mutations[0].data.profile).not.toHaveProperty("role");
    });
    it("edita rol con versión y conserva la contraseña",async()=>{
        open("/admin/usuarios/21/editar");await screen.findByDisplayValue("Camila");const user=userEvent.setup();
        expect(screen.queryByLabelText(/^Contraseña inicial/)).not.toBeInTheDocument();
        await user.selectOptions(screen.getByRole("combobox",{name:"Tipo de usuario"}),"Vendedor");await user.click(screen.getByRole("button",{name:"Guardar usuario",exact:true}));
        expect(await screen.findByText("Usuario actualizado correctamente.")).toBeInTheDocument();expect(mutations[0].data).toMatchObject({version:3,role:"VENDEDOR"});
        expect(mutations[0].data.profile).not.toHaveProperty("password");
    });
    it("conserva el borrador en un conflicto y permite recargar explícitamente",async()=>{
        open("/admin/usuarios/21/editar");const name=await screen.findByRole("textbox",{name:"Nombre",exact:true});const user=userEvent.setup();
        await user.clear(name);await user.type(name,"Mi borrador");conflict=true;await user.click(screen.getByRole("button",{name:"Guardar usuario",exact:true}));
        expect(await screen.findByText("La cuenta cambió. Recarga sus datos antes de guardar.")).toBeInTheDocument();expect(name).toHaveValue("Mi borrador");
        expect(screen.getByRole("button",{name:"Guardar usuario",exact:true})).toBeDisabled();
        await user.click(screen.getByRole("button",{name:"Recargar datos"}));expect(await screen.findByDisplayValue("Cambio externo")).toBeInTheDocument();
    });
    it("exige confirmación para desactivar y permite reactivar con la nueva versión",async()=>{
        open("/admin/usuarios");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Desactivar a Camila Muñoz Soto"}));
        await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Cancelar",exact:true}));expect(mutations).toHaveLength(0);
        await user.click(screen.getByRole("button",{name:"Desactivar a Camila Muñoz Soto"}));
        expect(screen.getByRole("dialog")).toHaveTextContent("se conservarán sus compras");
        await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Desactivar usuario",exact:true}));
        expect(await screen.findByText("Cuenta desactivada. Su historial se conserva.")).toBeInTheDocument();expect(mutations[0]).toMatchObject({method:"DELETE",version:"3"});
        await user.click(await screen.findByRole("button",{name:"Reactivar a Camila Muñoz Soto"}));
        expect(await screen.findByText("Cuenta reactivada correctamente.")).toBeInTheDocument();expect(mutations[1].data).toEqual({version:4});
    });
    it("actualiza perfil y cabecera sin enviar privilegios ni identidad",async()=>{
        open("/perfil");const field=await screen.findByRole("textbox",{name:"Nombre",exact:true});const user=userEvent.setup();
        expect(screen.queryByRole("combobox",{name:"Tipo de usuario"})).not.toBeInTheDocument();
        await user.clear(field);await user.type(field,"Nombre guardado");await user.click(screen.getByRole("button",{name:"Guardar perfil",exact:true}));
        expect(await screen.findByText("Perfil actualizado correctamente.")).toBeInTheDocument();expect(apiSession.read().user.firstName).toBe("Nombre guardado");
        expect(mutations[0].data).not.toHaveProperty("role");expect(mutations[0].data.profile).not.toHaveProperty("id");expect(mutations[0].data).toMatchObject({version:0});
    });
    it("retiene el perfil escrito si otra pestaña lo modifica",async()=>{
        open("/perfil");const field=await screen.findByRole("textbox",{name:"Dirección",exact:true});const user=userEvent.setup();
        await user.clear(field);await user.type(field,"Dirección del borrador");conflict=true;await user.click(screen.getByRole("button",{name:"Guardar perfil",exact:true}));
        expect(await screen.findByText("El perfil cambió o los datos están en conflicto. Se conservó el formulario.")).toBeInTheDocument();expect(field).toHaveValue("Dirección del borrador");
    });
    it.each(["Cliente","Vendedor"])("impide la gestión de usuarios al perfil %s",async role=>{
        records[0].role=role;await apiSession.identity();open("/admin/usuarios");
        await vi.waitFor(()=>expect(window.location.pathname).toBe(role==="Cliente"?"/productos":"/admin"));
        expect(requests).not.toContain("/admin/users");expect(screen.queryByRole("link",{name:"Nuevo usuario"})).not.toBeInTheDocument();
    });
    it("oculta los datos personales antes de iniciar sesión",async()=>{
        apiSession.invalidate(true);open("/perfil");expect(await screen.findByRole("button",{name:"Iniciar sesión",exact:true})).toBeInTheDocument();
        expect(requests).not.toContain("/profile");expect(screen.queryByRole("textbox",{name:"Dirección",exact:true})).not.toBeInTheDocument();
    });
});
