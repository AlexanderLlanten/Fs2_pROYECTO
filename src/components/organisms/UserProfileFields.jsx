// Comparte campos de identidad y dirección entre registro y administración.

import FormField from "../molecules/FormField.jsx";
import { regions } from "../../data/regions.js";

function UserProfileFields({ values, errors, disabled, onChange, onBlur, inputRefs, children }) {
    const communes = regions.find(region => region.name === values.region)?.communes ?? [];
    function fieldProps(name) {
        return { name, value: values[name], error: errors[name], onChange, onBlur, disabled,
            inputRef: element => { inputRefs.current[name] = element; }, required: name !== "birthDate" };
    }

    return (
        <div className="auth-registration-grid">
            <FormField {...fieldProps("run")} label="RUN" autoComplete="off" maxLength={12}
                placeholder="123456785" helpText="Entre 7 y 9 caracteres sin formato. También puedes pegarlo con puntos y guion." />
            <FormField {...fieldProps("firstName")} label="Nombre" autoComplete="given-name" maxLength={50} />
            <FormField {...fieldProps("lastName")} label="Apellidos" autoComplete="family-name" maxLength={100} fieldClassName="auth-field-wide" />
            <FormField {...fieldProps("email")} label="Correo electrónico" type="email" autoComplete="email" maxLength={100}
                helpText="Se permiten cuentas @duoc.cl, @profesor.duoc.cl y @gmail.com." fieldClassName="auth-field-wide" />
            {children}
            <FormField {...fieldProps("birthDate")} label="Fecha de nacimiento" type="date" autoComplete="bday" helpText="Opcional." />
            <FormField {...fieldProps("region")} label="Región" as="select" autoComplete="address-level1">
                <option value="">Selecciona una región</option>
                {regions.map(region => <option key={region.name} value={region.name}>{region.name}</option>)}
            </FormField>
            <FormField {...fieldProps("commune")} label="Comuna" as="select" autoComplete="address-level2" disabled={disabled || !values.region}>
                <option value="">{values.region ? "Selecciona una comuna" : "Selecciona primero una región"}</option>
                {communes.map(commune => <option key={commune} value={commune}>{commune}</option>)}
            </FormField>
            <FormField {...fieldProps("address")} label="Dirección" as="textarea" rows={3} autoComplete="street-address" maxLength={300} fieldClassName="auth-field-wide" />
        </div>
    );
}

export default UserProfileFields;
