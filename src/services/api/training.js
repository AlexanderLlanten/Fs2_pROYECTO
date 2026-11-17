import { api } from "./client.js";
import { apiSession } from "./session.js";
import { apiBaseUrl } from "../../config/apiUrl.js";

const origin = apiBaseUrl.origin;
export const exerciseImage = exercise => ({ ...exercise, image: exercise.image?.startsWith("/media/training/") ? origin + exercise.image : exercise.image });
export const readExercises = async path => {
    const data = await (path.startsWith("/admin/") ? apiSession.authorized(path) : api(path));
    return Array.isArray(data) ? data.map(exerciseImage) : exerciseImage(data);
};
export async function writeExercise(path, options) {
    try {
        const data = await apiSession.authorized(path, options); return { success:true, exercise:data };
    } catch(error) { return { success:false, message:error.message, errors:error.errors, conflict:error.status===409 }; }
}
export function exercisePayload(values) {
    const data = { ...values, name:values.name.trim(), description:values.description.trim(), muscle:values.muscle.trim(), equipment:values.equipment.trim(),
        defaultSets:Number(values.defaultSets), defaultReps:Number(values.defaultReps) };
    if (data.image?.startsWith(origin+"/media/training/")) data.image = data.image.slice(origin.length);
    delete data.id; delete data.active; return data;
}
