import {refDb} from '../firebase';
import { child, get, push, remove, set, update} from "Firebase/database";
import type { IEquipment } from "../equipments/service"
import type { IClient } from '../clients/service';
export interface IPaid {
    type: string;
    amount: number;
}
export interface IRent {
    id?: string;
    client:string|IClient;
    createdAt:string;
    createdBy:string;
    date:string
    description:string
    equipment:string|IEquipment;
    paid: boolean|IPaid[];
    rent_price: number;
    deliver: {
        delivery: string,
        takeOff: string
    }
}


const getRents = async ()=> {
    const snap = await get(child(refDb, 'rents'))
    let data:IRent[] = []
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
const setRent = async (rentData: IRent)=>{
    return await push(child(refDb, 'rents'),rentData);
};
const getRentById = async (id: string)=>{
    const snap = await get(child(refDb, `rents/${id}`))
    return (snap.exists() ? snap.val() : {}) as IRent;
};
const updateRent = async (id: string, data: IRent)=>{
    return await update(child(refDb, `rents/${id}`), data);
};
const deleteRent = async (id: string)=>{
    return await remove(child(refDb, `rents/${id}`))
};
const setDeliver = async (id: string, data: any)=>{
    return await set(child(refDb, `rents/${id}/deliver`), {delivery: data.delivery || '', takeOff: data.takeOff || ''});
}
export {
    getRents,
    setRent,
    getRentById,
    updateRent,
    deleteRent,
    setDeliver
}