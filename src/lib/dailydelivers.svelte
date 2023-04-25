<script lang="ts">
    import { Accordion, AccordionItem, Button } from "carbon-components-svelte";
    import moment from "moment";
    import type { IRent } from "../service/rents/service";
    import ChevronLeft from "./icons/chevron_left.svelte";
    import ChevronRight from "./icons/chevron_right.svelte";
    import { DataTable } from "carbon-components-svelte";
    import Currency from "./helper/currency.svelte";
    import { onMount } from "svelte";
    import { userRole } from "../service/stores";
    
    import { getUsers, type IProfile } from "../service/users/service";
    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../service/firebase";


    export let rents:IRent[] = [];
    let users: IProfile[];
    let filterDate = moment();
    let dailyRent:IRent[] = [];
    let isOpen:boolean = $userRole.role === 'DELIVERY'
    const moveFilter = (type: string)=>{
        if(type === 'down'){
            filterDate = moment(filterDate).subtract(1,'days');
        } else if(type === 'up'){
            filterDate = moment(filterDate).add(1,'days');
        } else {
            filterDate = moment();
        }
        return
    }
    const filterRents = ()=> {
        let part1 = rents.filter(rent => moment(rent.date).isSame(filterDate,'day'));
        if($userRole.role === 'DELIVERY'){
            part1 = part1.filter(rent => {
                return rent.deliver && (rent.deliver.delivery === $userRole.uid || rent.deliver.takeOff === $userRole.uid)
            })
        }
        dailyRent = part1
    };
    onMount(async ()=>{
        onAuthStateChanged(
            auth,
            async () => {
                filterRents();
                users = await getUsers();
            }
        )
    })
    const getUserEmail = (id: string)=>{
        return users.find(u => u.id === id)?.email || '--'
    }
    $: filterDate, filterRents();
    $: rents,  filterRents();
</script>

<article class="sm:my-4 sm:px-4">
    <Accordion>
        <AccordionItem bind:open={isOpen} class="w-full p-0" title="Entregas diarias">
            <div class="flex justify-end mt-4">
                <div class="selector">
                    <Button size="small" kind="tertiary" on:click={()=>moveFilter('down')} iconDescription="Anterior" icon={ChevronLeft} />
                    <Button size="small" kind="tertiary" on:click={()=>moveFilter('today')} >{moment(filterDate).format('DD/MM/YYYY')}</Button>
                    <Button size="small" kind="tertiary" on:click={()=>moveFilter('up')} iconDescription="Siguiente" icon={ChevronRight} />
                </div>
            </div>
            <DataTable class="-ml-4 sm:ml-0" size="medium" headers={[
                { key: "equipment.name", value: "Equipo" },
                { key: "client.name", value: "Cliente" },
                { key: "client.address", value: "Direccion" },
                { key: "rent_price", value: "A cobrar" },
                { key: "deliver.delivery", value: "Entrega" },
                { key: "deliver.takeOff", value: "Retira" },
            ]} rows={dailyRent}>
                <svelte:fragment slot="cell" let:row let:cell>
                    {#if cell.key === "rent_price" }
                    <Currency amount={cell.value} />
                    {:else if cell.key === 'deliver.delivery'}
                        {getUserEmail(cell.value)}
                    {:else if cell.key === 'deliver.takeOff'}
                        {getUserEmail(cell.value)}
                        {:else}
                    {cell.value || '--'}  
                    {/if}
                </svelte:fragment>
            </DataTable>
        </AccordionItem>
    </Accordion>
</article>