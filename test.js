import {
    fetchViewData,
    fetchAllViewNames,
    fetchQueryData,
    fetchProducerData,
    fetchAllStoredProcedures
} from './dbManager.js';

console.log(await fetchProducerData("CALL onep_opdvisit(?)"));     