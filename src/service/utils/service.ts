import {refDb} from '../firebase';
import { child, get, push, remove, update } from "Firebase/database";
export interface IExpenseCategory{
    label:string;
    id?: string;
}


const getExpensesCategory = async ()=> {
    const snap = await get(child(refDb, 'expenseCategory'))
    let data:IExpenseCategory[] = []
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

export {
    getExpensesCategory
}