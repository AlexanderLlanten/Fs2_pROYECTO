import {beforeEach,afterEach,afterAll,describe,it,expect,vi} from "vitest";
import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(()=>vi.stubEnv("VITE_DATA_SOURCE","api"));
import App from "./App.jsx";
import {apiSession} from "./services/api/session.js";
import {remoteCatalog} from "./services/api/catalogStore.js";

let categories,role,mutations,requests,conflict,offline;
const product={id:2,code:"KYN002",name:"Creatina del servidor",description:"Descripción",category:"Creatinas",categoryId:2,price:21990,stock:25,criticalStock:5,version:0,image:"",featured:true};
beforeEach(async()=>{
    categories=[{id:2,name:"Creatinas",version:0},{id:9,name:"Accesorios",version:3}];role="Administrador";mutations=[];requests=[];conflict=false;offline=false;localStorage.clear();sessionStorage.clear();
    vi.stubGlobal("fetch",vi.fn(async(address,options)=>{
        const url=new URL(address),path=url.pathname.replace("/api/v1","");requests.push(path);const body=options.body?JSON.parse(options.body):null;let result;
        if(path==="/auth/csrf")result={token:"csrf"};
        else if(path==="/auth/login"||path==="/auth/refresh")result={accessToken:"category-token",expiresIn:600,user:{id:17,firstName:"Administración",lastName:"KYNEX",role,email:"admin@example.com"}};
        else if(path==="/auth/me")result={id:17,firstName:"Administración",role};
        else if(path==="/cart")result={version:0,items:[],totalItems:0,subtotal:0,shipping:0,total:0,canCheckout:false,warnings:[]};
        else if(path==="/products"||path==="/products/2"){
            const current={...product,category:categories.find(c=>c.id===2)?.name||"Creatinas"};result=path==="/products"?[current]:current;
        } else if(path.startsWith("/categories")){
            if(offline)throw new TypeError("Failed to fetch");
            const id=path==="/categories"?null:Number(path.split("/")[2]);const category=categories.find(c=>c.id===id);
            if(options.method==="GET")result=id===null?structuredClone(categories):category?structuredClone(category):null;
            else {
                mutations.push({path,method:options.method,body,version:url.searchParams.get("version"),token:options.headers.Authorization});
                if(conflict&&category){category.name="Cambio externo";category.version++;return {ok:false,status:409,json:async()=>({detail:"El recurso cambió. Recarga antes de guardar."})};}
                if(options.method==="DELETE"){
                    if(id===2)return {ok:false,status:409,json:async()=>({detail:"La categoría todavía tiene productos activos."})};
                    categories=categories.filter(c=>c.id!==id);return {ok:true,status:204};
                }
                if(categories.some(c=>c.id!==id&&c.name.toLowerCase()===body.name.toLowerCase()))return {ok:false,status:409,json:async()=>({detail:"Ya existe una categoría con ese nombre."})};
                if(id===null){result={id:33,name:body.name,version:0};categories.push(result);}
                else {category.name=body.name;category.version++;result=structuredClone(category);}
            }
        } else throw new Error(`Ruta no prevista: ${options.method} ${path}`);
        return {ok:result!==null,status:result===null?404:200,json:async()=>result===null?{detail:"El recurso no existe."}:result};
    }));
    await apiSession.login("admin@example.com","ClavePruebas2026!");await remoteCatalog.reload();
});
afterEach(()=>{apiSession.invalidate();vi.unstubAllGlobals();window.history.replaceState({},"","/");});
afterAll(()=>vi.unstubAllEnvs());
function open(path){window.history.replaceState({},"",path);return render(<App/>);}
describe("Categorías conectadas",()=>{
    it("presenta los datos del servidor y sus accesos administrativos",async()=>{
        open("/admin/categorias");expect(await screen.findByRole("table")).toHaveTextContent("Accesorios");
        expect(screen.getByRole("link",{name:"Categorías",exact:true})).toHaveAttribute("aria-current","page");
        expect(screen.getByRole("link",{name:"Nueva categoría",exact:true})).toBeInTheDocument();expect(localStorage.getItem("kynex_products")).toBeNull();
    });
    it("crea un nombre normalizado con JWT y lo incorpora al selector de productos",async()=>{
        open("/admin/categorias/nuevo");const field=await screen.findByRole("textbox",{name:"Nombre de la categoría"});const user=userEvent.setup();
        await user.type(field,"  Recuperación  ");await user.click(screen.getByRole("button",{name:"Guardar categoría",exact:true}));
        expect(await screen.findByText("Categoría creada correctamente.")).toBeInTheDocument();expect(mutations[0]).toMatchObject({method:"POST",body:{name:"Recuperación"},token:"Bearer category-token"});
        await user.click(screen.getByRole("link",{name:"Productos",exact:true}));await user.click(await screen.findByRole("link",{name:/Nuevo producto/}));
        expect(await screen.findByRole("option",{name:"Recuperación",exact:true})).toBeInTheDocument();
    });
    it("rechaza un nombre vacío sin enviar una escritura",async()=>{
        open("/admin/categorias/nuevo");const field=await screen.findByRole("textbox",{name:"Nombre de la categoría"});
        await userEvent.type(field,"   ");await userEvent.click(screen.getByRole("button",{name:"Guardar categoría"}));
        expect(screen.getByText("El nombre de la categoría es obligatorio.")).toBeInTheDocument();expect(field).toHaveFocus();expect(mutations).toHaveLength(0);
    });
    it("permite corregir un duplicado conservando el nombre escrito",async()=>{
        open("/admin/categorias/nuevo");const field=await screen.findByRole("textbox",{name:"Nombre de la categoría"});const user=userEvent.setup();
        await user.type(field,"cReAtInAs");await user.click(screen.getByRole("button",{name:"Guardar categoría"}));
        expect(await screen.findByText("Ya existe una categoría con ese nombre.")).toBeInTheDocument();expect(field).toHaveValue("cReAtInAs");
        await user.clear(field);await user.type(field,"Nombre corregido");await user.click(screen.getByRole("button",{name:"Guardar categoría"}));expect(await screen.findByText("Categoría creada correctamente.")).toBeInTheDocument();
    });
    it("renombra con versión y actualiza los productos de la tienda",async()=>{
        open("/admin/categorias/2/editar");const field=await screen.findByDisplayValue("Creatinas");const user=userEvent.setup();
        await user.clear(field);await user.type(field,"Creatinas renovadas");await user.click(screen.getByRole("button",{name:"Guardar categoría"}));
        expect(await screen.findByText("Categoría actualizada correctamente.")).toBeInTheDocument();expect(mutations[0].body).toEqual({name:"Creatinas renovadas",version:0});
        expect(remoteCatalog.read().products[0].category).toBe("Creatinas renovadas");
        await user.click(screen.getByRole("link",{name:"Volver a la tienda",exact:true}));expect(await screen.findByRole("option",{name:"Creatinas renovadas"})).toBeInTheDocument();
    });
    it("conserva el borrador y exige recargar tras un conflicto de versión",async()=>{
        open("/admin/categorias/9/editar");const field=await screen.findByDisplayValue("Accesorios");const user=userEvent.setup();
        await user.clear(field);await user.type(field,"Mi borrador");conflict=true;await user.click(screen.getByRole("button",{name:"Guardar categoría"}));
        expect(await screen.findByText("El recurso cambió. Recarga antes de guardar.")).toBeInTheDocument();expect(field).toHaveValue("Mi borrador");
        expect(screen.getByRole("button",{name:"Guardar categoría"})).toBeDisabled();await user.click(screen.getByRole("button",{name:"Recargar datos"}));
        expect(await screen.findByDisplayValue("Cambio externo")).toBeInTheDocument();
    });
    it("cancela o confirma la baja y envía la versión seleccionada",async()=>{
        open("/admin/categorias");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Desactivar categoría Accesorios"}));
        await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Cancelar",exact:true}));expect(mutations).toHaveLength(0);
        await user.click(screen.getByRole("button",{name:"Desactivar categoría Accesorios"}));await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Desactivar categoría",exact:true}));
        expect(await screen.findByText("Categoría desactivada correctamente.")).toBeInTheDocument();expect(mutations[0]).toMatchObject({method:"DELETE",version:"3"});
        await vi.waitFor(()=>expect(screen.queryByRole("button",{name:"Desactivar categoría Accesorios"})).not.toBeInTheDocument());
    });
    it("conserva la categoría y explica que tiene productos activos",async()=>{
        open("/admin/categorias");const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Desactivar categoría Creatinas"}));
        await user.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Desactivar categoría",exact:true}));
        expect(await screen.findByText("La categoría todavía tiene productos activos.")).toBeInTheDocument();expect(categories.some(c=>c.id===2)).toBe(true);
    });
    it.each(["Vendedor","Cliente"])("oculta y protege la gestión para %s",async next=>{
        role=next;await apiSession.identity();open("/admin/categorias/9/editar");
        await vi.waitFor(()=>expect(window.location.pathname).toBe(next==="Vendedor"?"/admin":"/productos"));
        expect(screen.queryByRole("link",{name:"Categorías",exact:true})).not.toBeInTheDocument();expect(requests).not.toContain("/categories/9");
    });
    it("distingue servidor desconectado de una lista vacía y permite reintentar",async()=>{
        offline=true;open("/admin/categorias");expect(await screen.findByText(/No fue posible conectar con el servidor/)).toBeInTheDocument();
        expect(screen.queryByText(/No hay categorías activas/)).not.toBeInTheDocument();offline=false;await userEvent.click(screen.getByRole("button",{name:"Reintentar consulta"}));expect(await screen.findByRole("table")).toBeInTheDocument();
    });
    it("presenta un estado recuperable al abrir una categoría inexistente",async()=>{
        open("/admin/categorias/999/editar");expect(await screen.findByText("El recurso no existe.")).toBeInTheDocument();expect(screen.queryByRole("button",{name:"Guardar categoría"})).not.toBeInTheDocument();
    });
    it("reconsulta el catálogo al volver a la ventana",async()=>{
        open("/productos");await screen.findByRole("option",{name:"Creatinas"});categories[0].name="Cambio desde otro equipo";
        window.dispatchEvent(new Event("focus"));expect(await screen.findByRole("option",{name:"Cambio desde otro equipo"})).toBeInTheDocument();
    });
});
