<script lang="ts" async>
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { page } from '$app/stores'
    import ExportJsonExcel from 'js-export-excel';

    import { Button, DataTable, Form, TextInput, Tile, Toolbar, ToolbarBatchActions } from "carbon-components-svelte";
    import { getClientById, updateClient, type IClient } from "../../../../../service/clients/service";
    import { onMount } from "svelte";
    import { getRents, type IRent } from "../../../../../service/rents/service";
    import { getEquipments, type IEquipment } from "../../../../../service/equipments/service";
    import { joinRent } from "../../../../../service/utils";
    import moment from "moment";
    import Currency from "$lib/helper/currency.svelte";
    import { IncreaseLevel } from "carbon-icons-svelte";

    let clientId = '';
    let client:IClient = {name: '', contact: '', address: ''};
    let rents:IRent[] =  [];
    let equipments: IEquipment[] = [];
    let selectedRowIds: string[] = []
    let error = {name: false, contact: false, address: false}
    export function load({ params }: any) { return {id: params.slug}; }
    const getData = async ()=>{
        clientId = $page.params.slug;
        client = await getClientById($page.params.slug)
        equipments = await getEquipments();
        rents = joinRent(await getRents(), equipments, []).filter((x)=> {
            return x.client === clientId && moment(x.date).isSame(moment(), 'year')
        }).sort((a,b) => moment(a.date).isSameOrBefore(b.date) ? 1 : -1);
        console.log(rents)
    }
    onMount(async()=> await getData());
    const save = async ()=>{
        await updateClient(clientId,client)
    }
    const isValid = ()=>{
        error.name = !client.name;
        error.address = !client.address;
        error.contact = !client.contact;
        return !(error.name || error.address || error.contact);
    }
    const save_exit = async () => {
        if(isValid()){
            await save();
            goto('/admin/clients');
        }

    }

</script>

<svelte:head>
	<title>Rentify | Editar Cliente</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/clients"/>Editar cliente</h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Form>
            <Tile class="">
                <TextInput class="mb-4" size="sm" bind:invalid={error.name} labelText="Nombre" bind:value={client.name}/>
                <TextInput class="mb-4" size="sm" bind:invalid={error.address} labelText="Direccion" bind:value={client.address}/>
                <TextInput class="mb-4" size="sm" bind:invalid={error.contact} labelText="Contacto" bind:value={client.contact}/>
            </Tile>
            <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
                <Button class="w-full sm:w-auto" kind="ghost" href="/admin/clients">Salir</Button>
                <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar</Button>
    
            </div>
        </Form>
    
        <div>
            <DataTable 
            zebra
            selectable
            batchSelection
            bind:selectedRowIds
            headers={[
    
                {key: 'date', value: 'Fecha'},
                {key: 'equipment.name', value: 'Equipo'},
                {key: 'rent_price', value: 'Precio'}
            ]} rows={rents}>
            <svelte:fragment slot="cell" let:cell >
                {#if cell.key === 'rent_price'}
                    <Currency amount={cell.value}></Currency>
                {:else if cell.key === 'date'}
                    {moment(cell.value).format('DD/MM/YYYY')}
                {:else}
                    {cell.value || '--'}
                {/if}
            </svelte:fragment>
            <Toolbar>
                <ToolbarBatchActions active>
                    <Button on:click={()=>{
                        //@ts-ignore
                        let currentRents = rents.filter(({id}) => selectedRowIds.includes(id));
                        let option = {datas: [{
                            sheetData: currentRents.map((rent1)=>(
                                [
                                    moment(rent1.date).format('DD/MM/YYYY'), 
                                    rent1.equipment.name, 
                                    rent1.rent_price
                                ]
                            )),
                            sheetName: client.name,
                            sheetHeader: ["Fecha", "Equipo", 'Precio'],
                            columnWidths: [7,7,7]
                        }], fileName:`Agenda Cliente ${client.name}`};
                        
                        //currentRents.map((rent)=>{
                            
                        //})
                        
                        var toExcel = new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    }}>Copiar</Button>
                </ToolbarBatchActions>

            </Toolbar>
            </DataTable>
        </div>

    </div>
</section>