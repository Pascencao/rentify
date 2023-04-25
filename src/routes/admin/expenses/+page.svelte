<script lang="ts">
    import { Button, DataTable, Pagination, Toolbar, ToolbarBatchActions, ToolbarContent } from "carbon-components-svelte";
    import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
    import Edit from "carbon-icons-svelte/lib/Edit.svelte";
    
    import Currency from "$lib/helper/currency.svelte";
    import { deleteExpense, getExpenses, type IExpense } from "../../../service/expenses/service";
    import moment from "moment";
    import MainFilters from "$lib/MainFilters.svelte";
    import { joinExpense, type IFIlter } from "../../../service/utils";
    import { goto } from "$app/navigation";
    import { getEquipments } from "../../../service/equipments/service";

    let pageSize:number = 100,page:number = 1, active:boolean = false, selectedRowIds:any[] = [];
    let totalExpenses = 0;
    let expenses: IExpense[] = [];
    
    const setfilter=({detail: filters}:{detail: IFIlter})=>{
        setData(filters)
    }
    const setData = async (filters?:IFIlter)=>{
        totalExpenses = 0
        const equipments = await getEquipments();
        const expenseData = await (await getExpenses()).sort((a,b) => moment(a.date).isSameOrBefore(b.date) ? 1 : -1)
        if(filters){
            let filteredDate = moment();
            filters.year && filteredDate.year(filters.year);
            filters.month >= 0 && filteredDate.month(filters.month);

            expenses = joinExpense(expenseData.filter(expense => {
                const isDate = moment(expense.date).isSame(filteredDate, 'month');
                const isEquip = filters.equipment.length ? filters.equipment.includes(expense.equipment as string) : true;
                return isDate && isEquip;
            }), equipments)
            expenses.map(exp => {
            totalExpenses += exp.price
        });
        } else {
            expenses = expenseData
        }
    }
</script>
<svelte:head>
	<title>Rentify | Gastos</title>
</svelte:head>
<section class="p-4 pb-8">
    <h2 class="mb-4">Gastos</h2>
    <MainFilters config={{year: true, month: true, equipment: true}} on:filter={setfilter}/>
    <div class=" grid  justify-items-end mb-4">
        <h4 class="flex flex-row"><strong>Total de gastos:</strong>&nbsp;<Currency amount={totalExpenses}/></h4>
    </div>
    <DataTable headers={[
            {key: 'date', value:'Fecha'},
            {key: 'category', value: 'Categoria'},
            {key: 'description', value: 'Descripcion'},
            {key: 'price', value: 'Precio'},
            {key: 'equipment.name', value: 'Equipo'}
        ]} rows={expenses} 
        bind:selectedRowIds
        bind:selectable={active}
        radio
        {pageSize}
        {page}
    >
    <svelte:fragment slot="cell" let:cell >
        {#if cell.key === 'price'}
            <Currency amount={cell.value}></Currency>
        {:else if cell.key === 'date'}
            {moment(cell.value).format('DD/MM/YYYY')}
        {:else}
            {cell.value || '--'}
        {/if}
    </svelte:fragment>
    <Toolbar>
        <ToolbarBatchActions
          bind:active
          on:cancel={(e) => {
            e.preventDefault();
            active = false;
          }}
        >
            <Button
                icon={Edit}
                disabled={selectedRowIds.length === 0}
                on:click={() => goto(`/admin/expenses/edit/${selectedRowIds[0]}`)}
            >Editar</Button>
            <Button
                icon={TrashCan}
                kind="danger"
                disabled={selectedRowIds.length === 0}
                on:click={() => {
                    deleteExpense(selectedRowIds[0]);
                    var index = expenses.findIndex(ex => ex.id === selectedRowIds[0]);
                    if (index !== -1) {
                        expenses.splice(index, 1);
                        expenses = expenses
                    }
                    selectedRowIds = [];
                }}
            >Eliminar</Button>
        </ToolbarBatchActions>
        <ToolbarContent>
          <Button on:click={() => (active = true)}>Edit rows</Button>
          <Button href="/admin/expenses/new">Nuevo gasto</Button>
        </ToolbarContent>
      </Toolbar>
    </DataTable>
    <Pagination bind:pageSize
        bind:page
        totalItems={expenses.length}
        pageSizeInputDisabled
    ></Pagination>
</section>