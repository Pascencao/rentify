<script lang="ts">
    import moment from "moment";
    import { DataTable } from "carbon-components-svelte";
    import { MonthsLabel } from "../service/utils";
    import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
    import type { IRent } from "../service/rents/service";
    
    import Currency from './helper/currency.svelte';
    import { afterUpdate, onMount } from "svelte";
    import type { IExpense } from "../service/expenses/service";

    export let rents: IRent[] = [];
    export let tickets: IExpense[] = [];
    let monthlyData:DataTableRow[] = [];

    onMount(()=>{
        setData()
        
    })
    afterUpdate(()=>{
        setData()
    })
    const setData= ()=>{
        rents.map(rent =>{
            const rentMonth = moment(rent.date).month();
            monthlyData[rentMonth] = monthlyData[rentMonth] || {};
            monthlyData[rentMonth].id = rentMonth;
            monthlyData[rentMonth].label = MonthsLabel[rentMonth];
            monthlyData[rentMonth].estimated = (monthlyData[rentMonth].estimated || 0) +rent.rent_price ;
            monthlyData[rentMonth].paid = (monthlyData[rentMonth].paid || 0) + (rent.paid ? rent.rent_price : 0);
            monthlyData[rentMonth].outs = 0;
        })
        tickets.map(exp => {
            const expMonth = moment(exp.date).month();
            monthlyData[expMonth] = monthlyData[expMonth] || {outs: 0};
            if(typeof exp.price === 'string') console.log('BAD PRICE',exp)
            monthlyData[expMonth].outs += exp.price;

        })
    }
</script>
<div class="w-full ">
    <DataTable size="medium" 
    title="Ganancia estimada" 
    headers={[
        { key: "label", value: "Mes" },
        { key: "estimated", value: "Estimado" },
        { key: "paid", value: "Ingreso" },
        { key: "outs", value: "Egreso" }
    ]} rows={monthlyData.filter(x=> x)}>
        <svelte:fragment slot="cell" let:row let:cell>
            {#if cell.key !== "label" }
            <Currency amount={cell.value} />
            {:else}
            {cell.value}
            {/if}
        </svelte:fragment>
    </DataTable>

</div>
