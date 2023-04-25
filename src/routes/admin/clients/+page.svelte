<script lang="ts">
    import { onMount } from "svelte";

    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../../../service/firebase";
    import { deleteClient, getClients, type IClient } from "../../../service/clients/service";
    import { Button, DataTable, Pagination, Toolbar, ToolbarBatchActions, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
    import Edit from "carbon-icons-svelte/lib/Edit.svelte";
    import { goto } from "$app/navigation";
    import MainFilters from "$lib/MainFilters.svelte";
    import type { IFIlter } from "../../../service/utils";
    import { getUser } from "../../../service/users/service";
    import { userRole } from "../../../service/stores";
    import { Map, Table } from "carbon-icons-svelte";
    import Mapa from "$lib/mapa/mapa.svelte";
    import { PUBLIC_GOOGLE_API_KEY } from "$env/static/public";
	

    let pageSize:number = 20,page:number = 1, active:boolean = false, selectedRowIds:any[] = [];
    let clientsList: IClient[] = [];
    let clients:IClient[] = [];
    let view: string = 'TABLE';
    onMount(()=>{
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    localStorage.setItem('user', JSON.stringify(user))
                    const profile = await getUser(user.uid);
                    userRole.set(profile)
                    clients = await (await getClients()).sort((clia, clib) => clia.name.toLowerCase() >= clib.name.toLowerCase() ? 1 : -1);
                    clientsList = clients;
                }
            }
        )
    })
    const filterClients = ({detail: filters}: {detail: IFIlter})=>{
        if(filters.client){
            clientsList = clients.filter(x=>x.id === filters.client)
        } else {
            clientsList = clients
        }
    }
</script>
<svelte:head>
	<title>Rentify | Clientes</title>
    {#if PUBLIC_GOOGLE_API_KEY}
    <script defer async
    src={`https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GOOGLE_API_KEY}&callback=initMap`}>
    </script>
    {/if}
</svelte:head>
    
<section class="p-4 pb-8">
    <h2 class="mb-4">Clientes</h2>
    <MainFilters on:filter={filterClients} config={{clients: true}}></MainFilters>
    {#if PUBLIC_GOOGLE_API_KEY}
    <div class="flex justify-end mb-2">
        <Button class="!ml-1" on:click={()=> view = 'MAP'} selected={view === 'MAP'} disabled={view === 'MAP'} icon={Map} iconDescription="Ver Mapa"/>
        <Button class="!ml-1" on:click={()=> view = 'TABLE'} selected={view === 'TABLE'} disabled={view === 'TABLE'} icon={Table} iconDescription="Ver Tabla"/>
    </div>
    {/if}
    {#if view === 'TABLE'}
        <DataTable headers={[
                {key: 'name', value:'Nombre'},
                {key: 'address', value:'Direccion'},
                {key: 'contact', value:'Telefono'}
            ]} rows={clientsList}
            radio
            bind:selectedRowIds
            {pageSize}
            {page}
            bind:selectable={active}
        >
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
                    size="small"
                    disabled={selectedRowIds.length === 0}
                    on:click={() => {
                        goto(`/admin/clients/edit/${selectedRowIds[0]}`)
                    }}
                >
                    Editar
                </Button>
                <Button
                    icon={TrashCan}
                    size="small"
                    kind="danger"
                    disabled={selectedRowIds.length === 0}
                    on:click={() => {
                        deleteClient(selectedRowIds[0])
                        var index = clients.findIndex(cli => cli.id === selectedRowIds[0]);
                        if (index !== -1) {
                            clients.splice(index, 1);
                            clients = clients
                        }
                        selectedRowIds = [];
                    }}
                >
                    Eliminar
                </Button>
            </ToolbarBatchActions>
            <ToolbarContent>
                <ToolbarSearch
                    size={1}
                    persistent
                    shouldFilterRows
                />
                {#if $userRole.role === 'ADMIN'}
                <Button 
                size="small"
                on:click={() => (active = true)}>Edit rows</Button>
                <Button 
                size="small"
                href="/admin/clients/new">Nuevo Cliente</Button>
                {/if}
            </ToolbarContent>
    
        </Toolbar>
        </DataTable>
        <Pagination bind:pageSize
            bind:page
            totalItems={clients.length}
            pageSizeInputDisabled
        ></Pagination>
    {:else}
        <h3>Ubicacion en Mapa</h3>
        <p>Seleccione el cliente que desea ubicar</p>
        <Mapa {clients}></Mapa>
    {/if}
</section>