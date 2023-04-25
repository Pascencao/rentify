<script async lang="ts">
    import { getRents, type IRent } from "../../../service/rents/service";
    import { getEquipments, type IEquipment } from "../../../service/equipments/service";
    import { joinRent, type IFIlter } from "../../../service/utils";
    import { getClients } from "../../../service/clients/service";
    import { onMount } from "svelte";
    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../../../service/firebase";
    import moment from "moment";
    import MainFilters from "$lib/MainFilters.svelte";
    import MonthlyEstimated from "$lib/monthlyEstimated.svelte";
    import MonthlyOcupancy from "$lib/monthlyOcupancy.svelte";
    import Dailydelivers from "$lib/dailydelivers.svelte";
    import FreeDates from "$lib/freeDates.svelte";
    import { getExpenses, type IExpense } from "../../../service/expenses/service";
    import { getUser } from "../../../service/users/service";
    import { userRole } from "../../../service/stores";
    
    let dashboardRents: IRent[] = [];
    let filterMonthRate: IRent[] = [];
    let filters:IFIlter = {} as IFIlter;
    let expenses: IExpense[] = [];
    let equipments: IEquipment[], rents,clients,currentRents;

    onMount(() => {
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    localStorage.setItem('user', JSON.stringify(user))
                    const profile = await getUser(user.uid);
                    userRole.set(profile)
                    equipments = await getEquipments();
                    setData();
                }
            }
        );
    });
    const setData = async () =>{
        rents = await getRents();
        clients = await getClients()
        expenses = await (await getExpenses()).filter((expense)=>moment(expense.date).year() === filters.year);
        currentRents = joinRent(rents, equipments, clients)
        dashboardRents = currentRents.filter((rent)=>{
            return moment(rent.date).year() === filters.year;
        });
        filterMonthRate = dashboardRents.filter((rent)=>{
            return moment(rent.date).month() === filters.month;
        })

    }
    

    const setFilters = ({detail}: {detail: IFIlter})=>{
        filters = detail;
    }
    $: filters, setData();
</script>

<svelte:head>
	<title>Rentify | Pagina Principal</title>
</svelte:head>
<div>
    <Dailydelivers bind:rents={dashboardRents}></Dailydelivers>
    <MainFilters on:filter={setFilters} config={{month: true, year: true}}/>
    
    {#if $userRole.role === 'ADMIN'}
    <div class="w-full pt-8 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MonthlyEstimated bind:rents={dashboardRents} bind:tickets={expenses}></MonthlyEstimated>
        <MonthlyOcupancy bind:month={filters.month} bind:rents={filterMonthRate}></MonthlyOcupancy>
        
    </div>
    {/if}
    <div class="w-full pt-8 sm:p-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
        <FreeDates 
            bind:rents={filterMonthRate}
            bind:month={filters.month}
            bind:year={filters.year}
            bind:equipments={equipments}></FreeDates>
    </div>
    
</div>