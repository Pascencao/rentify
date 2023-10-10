
<script lang="ts">

    import { Button, Form, Dropdown, ComboBox, MultiSelect } from "carbon-components-svelte";
    import { createEventDispatcher } from "svelte";
    import moment from "moment";
    import { MonthsLabel, type IFIlter } from "../service/utils";
    import { onMount } from "svelte";
    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../service/firebase";
    import { getEquipments, type IEquipment } from "../service/equipments/service";
    import type { DropdownItem } from "carbon-components-svelte/types/Dropdown/Dropdown.svelte";
    import { getClients, type IClient } from "../service/clients/service";
    import { Close } from "carbon-icons-svelte";
    import { getUser } from "../service/users/service";
    import { page } from '$app/stores';
    import { goto } from "$app/navigation";

    interface IFilterConfigs {
        month?: boolean;
        year?: boolean;
        clients?: boolean;
        equipment?: boolean;
    }
    export let config:IFilterConfigs ={
        month: true,
        year: true,
        clients: true,
        equipment: true,
    }

    let clear= false,urlParams:URLSearchParams;
    const yearHelper = [
        moment().subtract(1, "year").year(),
        moment().year(),
        moment().add(1, "year").year()];
    
    let dispatch = createEventDispatcher(), equipments: DropdownItem[], clients: DropdownItem[];
    let year=moment().year(), month = moment().month(), equipment:string[] = [], client:string = '';
    const setParams = ()=>{
        if(month){
            $page.url.searchParams.set('month', JSON.stringify(month))
        } else { $page.url.searchParams.delete('month')}
        if(year){
            $page.url.searchParams.delete('year')
        } else { $page.url.searchParams.set('year', JSON.stringify(year))}
        if(client){
            $page.url.searchParams.set('client', client)
        } else {
            $page.url.searchParams.delete('client')}
        if(equipment && equipment.length){
            $page.url.searchParams.set('equipment', equipment.join(','))
        } else { 
            $page.url.searchParams.delete('equipment')
        }
    }
    const filter = (isDefault?: boolean)=>{
        clear = !isDefault;
        setParams()
        goto(`?${$page.url.searchParams.toString()}`);
        dispatch("filter", {year, month, equipment, client} as IFIlter)
    }
    const clearSearch = ()=>{
        clear = false;
        year = moment().year(), month = moment().month(), equipment = [], client = '';
        dispatch("filter", {year, month, equipment, client} as IFIlter);
        $page.url.searchParams.delete('month')
        $page.url.searchParams.delete('year')
        $page.url.searchParams.delete('client')
        $page.url.searchParams.delete('equipment')
    }
    
    onMount(()=>{
        month = $page.url.searchParams.get('month') ? parseInt($page.url.searchParams.get('month')||'') : month;
        year = $page.url.searchParams.get('year') ? parseInt($page.url.searchParams.get('year') || '') : year;
        client = $page.url.searchParams.get('client') || client;
        equipment = $page.url.searchParams.get('equipment') ? $page.url.searchParams.get('equipment')?.split(',')||[] : equipment||[];
        
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    const profile = await getUser(user.uid);
                    equipments = await (await getEquipments()).filter((equips)=>profile.equipments.includes(equips.id||''))
                        .sort((a:IEquipment,b:IEquipment)=> a.name.toLowerCase() >= b.name.toLowerCase()? 1 : -1)
                        .map(equip => ({id: equip.id, text: equip.name}));
                    clients = await (await getClients())
                        .sort((a:IClient,b:IClient)=>a.name.toLowerCase() >= b.name.toLowerCase()? 1 : -1)
                        .map(client => ({id: client.id, text: client.name}));
                    equipments.unshift({id: '', text: ''})
                    clients.unshift({id: '', text: ''})
                    
                }
            }
        )
        filter(true);
    })
</script>
<section class="w-full p-4">
    <Form class="grid grid-cols-2 sm:grid-cols-5 gap-4 place-content-around">
        {#if config.month}
        <Dropdown size="sm"
            titleText="Mes"
            bind:selectedId={month}
            items={[' ',...MonthsLabel].map((str,index)=>({id: index-1, text: str}) ) }
        />
        {/if}
        {#if config.year}
        <Dropdown size="sm"
            titleText="Año"
            bind:selectedId={year}
            items={yearHelper.map(val=>({id: val, text: `${val}`}))}
        />
        {/if}

        {#if config.equipment}
        <MultiSelect
            size="sm"
            spellcheck="false"
            filterable
            bind:selectedIds={equipment}
            titleText="Equipo"
            items={equipments}
        />
        {/if}
        {#if config.clients}
        <ComboBox size="sm"
            titleText="Cliente"
            shouldFilterItem={(item, value)=>{
                if (!value) return true;
                return item.text.toLowerCase().includes(value.toLowerCase());
            }}
            bind:selectedId={client}
            items={clients}
        />
        {/if}
        <div class="flex items-end">
            {#if clear}
                <Button size="small" kind="tertiary" on:click={clearSearch} class="h-8 mr-4" icon={Close}></Button>
            {/if}
            <Button size="small" class="h-8" on:click={()=>filter()}>Filtrar</Button>
        </div>
    </Form>

</section>