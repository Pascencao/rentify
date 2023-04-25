<script lang="ts">
    import MainFilters from "$lib/MainFilters.svelte";
    import EquipRentCurve from "$lib/metrics/equipRentCurve.svelte";
    import TopTenClients from "$lib/metrics/topTenClients.svelte";
    import { onMount } from "svelte";
    import { getClients, type IClient } from "../../../service/clients/service";
    import { getEquipments, type IEquipment } from "../../../service/equipments/service";
    import { getExpenses, type IExpense } from "../../../service/expenses/service";
    import { getRents, type IRent } from "../../../service/rents/service";
    import { joinRent, type IFIlter } from "../../../service/utils";
    let rents: IRent[] = [],
        equipments: IEquipment[] = [],
        expenses: IExpense[] = [],
        clients: IClient[] = [],
        generalFilters:IFIlter = {} as IFIlter;
    onMount(async ()=>{
        equipments = await getEquipments();
        expenses = await getExpenses();
        clients = await getClients();
        rents = await (joinRent(await getRents(),equipments, clients ));
    })
    const setFilters = ({detail:filters}: {detail: IFIlter})=>{
        generalFilters = filters
    }
</script>
<svelte:head>
	<title>Rentify | Metricas</title>
</svelte:head>
<section class="sm:p-4 mb-8 sm:mb-4">
    <MainFilters on:filter={setFilters} />
    <div class="grid grid-cols-2 gap-4 my-4">
        <TopTenClients {rents} {clients} {equipments} filters={generalFilters}/>
        <EquipRentCurve {rents} {clients} {equipments} filters={generalFilters}/>
    </div>
</section>