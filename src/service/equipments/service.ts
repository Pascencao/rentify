import {refDb} from '../firebase';
import { child, get, push, remove, update } from "Firebase/database";
export interface IEquipment {
    id?: string;
    name:string;
    rent_price:number;
    type:string;
}


const getEquipments = async ()=> {
    const snap = await get(child(refDb, 'equipments'))
    let data:IEquipment[] = []
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
const setEquipment = async (EquipData: IEquipment)=>{
    const user = JSON.parse(localStorage.getItem('user')||'{}')

    return await push(child(refDb, 'equipments'),{
        ...EquipData,
        createdBy: user.displayName || user.email, 
        createdAt: new Date().toString()
    });
};
const getEquipmentById = async (id: string)=>{
    const snap = await get(child(refDb, `equipments/${id}`))
    return (snap.exists() ? snap.val() : {}) as IEquipment;
};

const updateEquipment = async (id: string, data: IEquipment)=>{
    const user = JSON.parse(localStorage.getItem('user')||'{}')
    return await update(child(refDb, `equipments/${id}`), {
        ...data,
        editedBy: user.displayName || user.email, 
        editedAt: new Date().toString()
    });
};
const deleteEquipment = async (id: string)=>{
    return await remove(child(refDb, `equipments/${id}`))
};

export {
    getEquipments,
    setEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
}