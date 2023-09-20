import {refDb} from '../firebase';
import { child, get, update } from "Firebase/database";
import moment from 'moment';

const ROLES = ['ADMIN', 'DELIVERY'];

export interface IProfile {
    id?: string;
    lastLogin: string;
    role: string;
    email: string;
    uid: string;
    equipments:string[];
}

const userExist = async (uid: string)=>{
    const snap = await get(child(refDb, `profiles/${uid}`))
    return snap.exists();
}
const setNewUser = async (uid: string, email: string)=>{
    return await update(child(refDb, `profiles/${uid}`), {
        lastLogin: moment().toString(),
        role: 'DELIVERY',
        email
    });
}
const setRole = async (uid:string, role:string)=>{
    if(ROLES.includes(role)){
        return await update(child(refDb, `profiles/${uid}`), {
            role
        });
    }
}
const setEquipments = async (uid:string, equipList:string[])=>{
    return await update(child(refDb, `profiles/${uid}`), {
        equipments: equipList
    });
    
}
const getUser = async (uid: string)=>{
    const snap = await get(child(refDb, `profiles/${uid}`))
    return (snap.exists() ? {...snap.val(), uid} : {}) as IProfile;

}
const setLogin = async (uid: string)=>{
    return await update(child(refDb, `profiles/${uid}`), {
        lastLogin: moment().toString()
    });
}
const getUsers = async ()=>{
    const snap = await get(child(refDb, `profiles`))
    let data:IProfile[] = []
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
    
};
/*
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
*/
export {
    getUser,
    userExist,
    setNewUser,
    setRole,
    setLogin,
    getUsers,
    setEquipments
}