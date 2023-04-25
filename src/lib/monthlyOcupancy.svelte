<script lang="ts">
    import type { IRent } from "../service/rents/service";
    import { DataTable } from "carbon-components-svelte";
    import moment from "moment";
    import { afterUpdate, onMount } from "svelte";
    import Currency from "./helper/currency.svelte";
    

    export let rents:IRent[] = [];
    export let month: number = 0;
    let data:any = [];
    let dataHelper:any = {};
    
    onMount(()=>setData())
    afterUpdate(()=>setData())
    
    const setData = ()=>{
        data =[];
        dataHelper = {};
        rents.map((rent, i)=>{
            dataHelper[rent.equipment?.id] = {
                id: `ocupancy-${i}`,
                name: rent.equipment?.name,
                profit: (dataHelper[rent.equipment?.id]?.profit || 0 ) + (rent.paid ? rent.rent_price : 0),
                ocuppied: (dataHelper[rent.equipment?.id]?.ocuppied||0)+1,
                free: (dataHelper[rent.equipment?.id]?.free ||moment().month(month).daysInMonth()) -1
            }
        })
    
        for (const [key, value] of Object.entries(dataHelper)) {
            data.push({
                id: key,
                //@ts-ignore
                ...value
           })
        }

    }
    
</script>
<div>
    <DataTable title="Ocupacion mensual" size="medium" headers={[
        { key: "name", value: "Equipo" },
        { key: "ocuppied", value: "Fechas Ocupadas" },
        { key: "free", value: "Fechas Disponibles" },
        { key: "profit", value: "Ingresos" }
    ]} rows={data}>
     <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === "profit" }
        <Currency amount={cell.value} />
        {:else}
        {cell.value}
        {/if}
    </svelte:fragment>
    </DataTable>
</div>