<script lang="ts">
    import type { IRent } from "../service/rents/service";
    import { DataTable, Link, Button, Toolbar, ToolbarContent, Checkbox } from "carbon-components-svelte";
    import type { IEquipment } from "../service/equipments/service";
    import moment from "moment";
    import { onMount } from "svelte";
    import Copy from "./icons/copy.svelte";
    import { goto } from "$app/navigation";
    moment.defineLocale('es', {
        parentLocale: 'en',
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mie._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
      }
    );
    moment.locale('es');
    export let rents:IRent[] = [];
    export let equipments:IEquipment[] = [];
    export let month:number = moment().month();
    export let year:number = moment().year();
    let tableData:any[] = [],newRentActive: boolean = false;
    
    const getFreeDates = (freeRents:IRent[])=>{
        const thisMonth = moment().year(year).month(month);
        const days = thisMonth.daysInMonth();
        let result:any[] = []
        for(let i=1; i<= days; i++){
            if(
                !freeRents.find(({date}) => moment(date).date() === i)
            ){
                result.push({label: thisMonth.date(i).locale('es-ES').format('ddd DD/MM'), checked: false})
            }
        }
        return result;
    }
    const setTableData = ()=>{
        tableData = equipments.map(equip => {
            const dates = rents.filter(rent => {return rent.equipment?.id === equip.id})
            return {
                id: equip.id,
                equip: equip.name,
                freeDate: dates
            }
        })
    }
    const copyDates = (dates:string[], equip: string)=>{
        navigator.clipboard.writeText([equip, ...dates.map(({label}:any) => label)].join(', '))
        
    };
    const createDate = ()=>{
        let query:any = {};
        for (let key in selectedDates){
            selectedDates[key].map((dat:any) => query[dat] = query[dat] ? [...query[dat], key] : [key]);
        }
        const params = new URLSearchParams(query).toString()
        goto(`/admin/agenda/new?${params}`)
    }
    let selectedDates:any = {
    }
    //onMount(setTableData)
    $: year, month, equipments, rents, setTableData();
</script>

<DataTable headers={[
    {key: 'equip', value: 'Equipo'},
    {key: 'freeDate', value: 'Fechas Libres'},
]} rows={tableData}>
<svelte:fragment slot="cell" let:cell let:row>
    {#if cell.key === "freeDate" }
    <span class="relative">
        <ul class="grid grid-cols-4">
            {#each getFreeDates(cell.value) as date}
                <li class="mx-2"><Checkbox bind:checked={date.checked} on:check={()=>{
                    if(date.checked){
                        selectedDates[row?.id] = selectedDates[row?.id] ? [...selectedDates[row?.id], date.label] : [date.label]
                    } else {
                        selectedDates[row?.id].splice(selectedDates[row?.id].indexOf(date.label),1)
                    }
                }} labelText={date.label}/> </li>
            {/each}
        </ul>
        <span class="absolute top-1/2 -m-4 right-0">
            <Button size="small" on:click={()=>copyDates(getFreeDates(cell.value), row.equip)} icon={Copy} iconDescription="Copiar"></Button>
        </span>
    </span>
    {:else}
        {cell.value}
    {/if}
</svelte:fragment>

<Toolbar>
    <ToolbarContent>
      <Button on:click={()=>createDate()}>Nuevo Alquiler</Button>
    </ToolbarContent>
</Toolbar>
</DataTable>