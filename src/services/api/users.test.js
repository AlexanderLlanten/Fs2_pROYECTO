import {afterEach,describe,it,expect,vi} from "vitest";
import {accountApi} from "./users.js";
import {apiSession} from "./session.js";
import {ApiError} from "./client.js";
afterEach(()=>vi.restoreAllMocks());
describe("Servicio de cuentas",()=>{
    it("asocia errores de perfil del servidor con los campos visibles",async()=>{
        vi.spyOn(apiSession,"authorized").mockRejectedValue(new ApiError("Revisa los campos",400,{"profile.email":"Correo inválido"}));
        expect(await accountApi.profile(3,{})).toMatchObject({success:false,errors:{email:"Correo inválido"}});
    });
    it("comunica un conflicto sin reenviar automáticamente otra versión",async()=>{
        const request=vi.spyOn(apiSession,"authorized").mockRejectedValue(new ApiError("La cuenta cambió",409));
        expect(await accountApi.deactivate(21,4)).toMatchObject({success:false,code:"CONFLICT"});
        expect(request).toHaveBeenCalledExactlyOnceWith("/admin/users/21?version=4",{method:"DELETE"});
    });
});
