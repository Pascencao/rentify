<script lang="ts">
    import "@carbon/charts/styles.css";
    import { PieChart } from "@carbon/charts";
    import { onMount } from "svelte";
    import { getExpenses, type IExpense } from "../../../service/expenses/service";
    import { joinRent, type IFIlter } from "../../../service/utils";
    import { groupBy, sumBy, isArray } from 'lodash';
    import moment from "moment";
    import { getRents, type IPaid, type IRent } from "../../../service/rents/service";
    import { DataTable, Tile, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import { getEquipments, type IEquipment } from "../../../service/equipments/service";
    import { getClients, type IClient } from "../../../service/clients/service";
    import Currency from "$lib/helper/currency.svelte";
    import MainFilters from "$lib/MainFilters.svelte";
    let equipments: IEquipment[]=[];
    let clients:IClient[]=[];
    let expenses:IExpense[] = [];
    let rents: IRent[] =[];
    let gfilters:IFIlter = {} as IFIlter;
    let tableData:any = [];
    let filteredRowIds:any[] = [];

    const options = {
        "resizable": true,
        "height": "400px"
    };
    onMount(() => {
    });
    const getFitlerDate = () =>{
        let result = moment()
        if(gfilters.year >= 0){
            result.year(gfilters.year);
        }
        if(gfilters.month >= 0){
            result.month(gfilters.month)
        }
        return result
    }
    
    onMount(async ()=>{
        equipments = await getEquipments();
        clients = await getClients()
        expenses = await getExpenses();
        rents = joinRent(await getRents(),equipments,clients);
        setExpenseData();
        setPaymentsData();
        tableData = tableData.sort((a:any,b:any)=>moment(a.date).isSameOrBefore(b.date) ? -1 : 1)

    })
    const setExpenseData = async ()=>{
        if(!expenses.length || !document) return;
        let curentFilterDate = getFitlerDate();
        let filtered = expenses.filter((x:any) => moment(x.date).isSame(curentFilterDate,'month')).filter(({category})=> category !== 'Deposito');
        if(gfilters.equipment.length){
            filtered = filtered.filter((x:any) => gfilters.equipment.includes(x.equipment.id))
        }
        let data:any[] = [];
        document.querySelectorAll('#expeses-pie-chart *')?.forEach((el)=>el.remove());
        filtered.map((item,i) => {
            tableData.push({
                id: `exp-${i}`,
                date: item.date,
                description: `${item.category} - ${item.description}`,
                in: 0,
                out: item.price
            });
        })
        const grouped = groupBy(filtered,'category')
        for(let key in grouped){
            await data.push({group: key, value: sumBy(grouped[key], 'price')})
        }

        const chartHolder = document.getElementById("expeses-pie-chart") as HTMLElement;
        new PieChart(chartHolder, {data,options:{
            ...options,
            title: "Distribución de gastos",
        }});
        
    }
    const filterRents = (rents:IRent[])=>{
        let curentFilterDate = getFitlerDate();
        let results = rents.filter((x:any) => moment(x.date).isSame(curentFilterDate,'month'));
        if(gfilters.equipment.length){
            results = results.filter((x:any) => gfilters.equipment.includes(x.equipment.id))
        }
        return results
    }
    const setPaymentsData = async () =>{
        document.querySelectorAll('#paid-pie-chart *')?.forEach((el)=>el.remove());
        const dataHelper:any = {};
        const filtered = filterRents(rents);

        filtered.map(({paid, rent_price})=>{
            if(isArray(paid)){
                (paid as IPaid[]).map(({type, amount})=>{
                    dataHelper[type] = dataHelper[type] ? dataHelper[type] + amount : amount;
                })
            } else {
                dataHelper['cash'] = dataHelper['cash'] ? dataHelper['cash'] + rent_price : rent_price;
            }
        })
        filtered.map((item,i) => {
            tableData.push({
                id: `paid-${i}`,
                date: item.date,
                description: `${item.client.name} - ${item.equipment.name}`,
                out: 0,
                in: item.rent_price
            });
        })
        const chartHolder = document.getElementById("paid-pie-chart") as HTMLElement;
        new PieChart(chartHolder, {
            data: [{group: 'Efectivo', value: dataHelper.cash || 0},{group: 'Transferencia', value: dataHelper.transfer||0}],
            options:{
            ...options,
            title: "Distribución de pagos",
        }
        });
    }
    const setFilters = ({detail: elFilters}: {detail: IFIlter}) => {
        gfilters = elFilters
        tableData = []
        setExpenseData();
        setPaymentsData();
        tableData = tableData.sort((a:any,b:any)=>moment(a.date).isSameOrBefore(b.date) ? -1 : 1)
    }
</script>

<svelte:head>
	<title>Rentify | Administración</title>
</svelte:head>
<main class="px-4">
    <MainFilters on:filter={setFilters} config={{equipment: true, month: true, year: true}} />
    <section class="grid grid-cols-2">
        <div id="expeses-pie-chart"></div>
        <div id="paid-pie-chart"></div>
    </section>
    {#key tableData}
    <section class="my-4">
        <Tile>
            <h4>Ingresos: <Currency styles="text-green-600" amount={sumBy(tableData, 'in')}/></h4>
            <h4>Egresos: <Currency styles="text-red-600" amount={sumBy(tableData, 'out')}/></h4>
            <h4>Total: <Currency amount={sumBy(tableData, 'in') - sumBy(tableData, 'out')}/></h4>
        </Tile>
        <DataTable 
            sortable
            headers={[
                {key: 'date', value: 'Fecha'},
                {key: 'description', value: 'Descipcion'},
                {key: 'in', value: 'Ingreso'},
                {key: 'out', value: 'Egreso'}
            ]}
            rows={tableData}
        >
            <svelte:fragment slot="cell" let:cell >
                {#if cell.key === 'in'}
                <span class="text-green-600">{#if cell.value} <Currency amount={cell.value}></Currency> {/if}</span>
                {:else if cell.key === 'out'}
                    <span class="text-red-600">{#if cell.value} <Currency amount={cell.value}></Currency> {/if}</span>
                {:else if cell.key === 'date'}
                    {moment(cell.value).format('DD/MM/YYYY')}
                {:else}
                    {cell.value || '--'}
                {/if}
            </svelte:fragment>

            <Toolbar>
                <ToolbarContent>
                <ToolbarSearch
                    persistent
                    shouldFilterRows
                    bind:filteredRowIds
                />
                </ToolbarContent>
            </Toolbar>
        </DataTable>
    </section>
    {/key}
</main>