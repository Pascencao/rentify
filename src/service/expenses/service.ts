import {refDb} from '../firebase';
import { child, get, push, remove, update } from "Firebase/database";
import type { IEquipment } from '../equipments/service';
export interface IExpense {
    id?: string;
    date:string;
    equipment:string|IEquipment;
    description:string;
    category: string;
    price:number;
}


const getExpenses = async ()=> {
    const snap = await get(child(refDb, 'tickets'))
    let data:IExpense[] = []
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
const getExpenseById = async (id: string)=>{
    const snap = await get(child(refDb, `tickets/${id}`))
    return (snap.exists() ? snap.val() : {}) as IExpense;
};
const setExpense = async (ticketData: IExpense)=>{
    const user = JSON.parse(localStorage.getItem('user')||'{}')
    return await push(child(refDb, 'tickets'),{
        ...ticketData, 
        createdBy: user.displayName || user.email, 
        createdAt: new Date().toString()
    });
};
const updateExpense = async (id: string, data: IExpense)=>{
    const user = JSON.parse(localStorage.getItem('user')||'{}')
    
    return await update(child(refDb, `tickets/${id}`), {
        ...data, 
        editedBy: user.displayName || user.email, 
        editedAt: new Date().toString()
    });
};
const deleteExpense = async (id: string)=>{
    return await remove(child(refDb, `tickets/${id}`))
};

export {
    getExpenses,
    setExpense,
    getExpenseById,
    updateExpense,
    deleteExpense
}