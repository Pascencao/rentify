import { child, get, push, remove, update } from "Firebase/database";
import { refDb } from "../firebase";

export interface IClient {
    id?: string;
    address: string;
    contact: string;
    name: string;
}


const getClients = async ()=> {
    const snap = await get(child(refDb, 'clients'))
    let data:IClient[] = []
    if(snap.exists()){
        snap.forEach(item => {
            data.push({
                id: item.key,
                ...item.val()
            })
        })
        return data 
    } else {
        return [];
    }
    
}
const setClient = async (clientData: IClient)=>{
    return await push(child(refDb, 'clients'),clientData);
};
const getClientById = async (id: string)=>{
    const snap = await get(child(refDb, `clients/${id}`))
    return (snap.exists() ? snap.val() : {}) as IClient;
};
const updateClient = async (id: string, data: IClient)=>{
    return await update(child(refDb, `clients/${id}`), data);
};
const deleteClient = async (id: string)=>{
    return await remove(child(refDb, `clients/${id}`))
};

export {
    getClients,
    setClient,
    getClientById,
    updateClient,
    deleteClient
}