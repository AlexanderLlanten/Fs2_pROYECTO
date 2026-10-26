import { useSyncExternalStore } from "react";
import { readRoutine, refreshRoutine, subscribeRoutine } from "../services/routineStore.js";

function useRoutine() {
    const resource = useSyncExternalStore(subscribeRoutine, readRoutine, readRoutine);
    return { ...resource, reload: refreshRoutine };
}

export default useRoutine;
