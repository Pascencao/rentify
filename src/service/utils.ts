import type { IClient } from "./clients/service"
import type { IEquipment } from "./equipments/service"
import type { IExpense } from "./expenses/service";
import type { IRent } from "./rents/service"

export const joinRent = (rents: IRent[]=[], equips: IEquipment[]=[], clients: IClient[]=[]) =>{
    const result = rents.map(rent => {
        rent.equipment = equips.find(({id}) => id === rent.equipment) || rent.equipment;
        rent.client = clients.find(({id}) => id === rent.client) || rent.client;
        return rent;
    }) as IRent[];
    return result;
}
export const joinExpense = (expense: IExpense[]=[], equips: IEquipment[]=[]) =>{
    const result = expense.map(exp => {
        exp.equipment = equips.find(({id}) => id === exp.equipment) || exp.equipment;
        return exp;
    }) as IExpense[];
    return result;
}
export const MonthsLabel = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export interface IFIlter {
    year: number;
    month: number;
    equipment: String[];
    client: string;
}  