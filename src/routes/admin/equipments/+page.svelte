<script lang="ts">
    import { onMount } from "svelte";

    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../../../service/firebase";
    
    import { Button, DataTable, Pagination, Toolbar, ToolbarBatchActions, ToolbarContent } from "carbon-components-svelte";
    import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
    import Edit from "carbon-icons-svelte/lib/Edit.svelte";
    import { deleteEquipment, getEquipments, type IEquipment } from "../../../service/equipments/service";
    
    import Currency from "$lib/helper/currency.svelte";
    import { goto } from "$app/navigation";
    import { getUser } from "../../../service/users/service";
    import { userRole } from "../../../service/stores";

    let pageSize:number = 10,page:number = 1, active:boolean = false, selectedRowIds:any[] = [];
    let equipments: IEquipment[] = [];
    
    onMount(()=>{
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    localStorage.setItem('user', JSON.stringify(user))
                    const profile = await getUser(user.uid);
                    userRole.set(profile)
                    equipments = await getEquipments();
                    
                }
            }
        )
    })
</script>

<svelte:head>
	<title>Rentify | Equipos</title>
</svelte:head>
<section class="p-4 pb-8">
    <h2 class="mb-4">Equipos</h2>
    <DataTable headers={[
            {key: 'name', value:'Nombre'},
            {key: 'type', value:'Typo'},
            {key: 'rent_price', value:'Precio Alquiler'}
        ]} rows={equipments} 
        bind:selectedRowIds
        radio
        {pageSize}
        {page}
        bind:selectable={active}
    >
    <svelte:fragment slot="cell" let:cell >
        {#if cell.key === 'rent_price'}
            <Currency amount={cell.value}></Currency>
        {:else}
        {cell.value}
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
                on:click={() => {
                    goto(`/admin/equipments/edit/${selectedRowIds[0]}`)
                    selectedRowIds = [];
                }}
            >
                Editar
            </Button>
            <Button
                icon={TrashCan}
                kind="danger"
                disabled={selectedRowIds.length === 0}
                on:click={() => {
                    deleteEquipment(selectedRowIds[0])
                    var index = equipments.findIndex(eq => eq.id === selectedRowIds[0]);
                    if (index !== -1) {
                        equipments.splice(index, 1);
                        equipments = equipments
                    }
                    selectedRowIds = [];
                }}
            >
                Eliminar
            </Button>
        </ToolbarBatchActions>
        <ToolbarContent>
          <Button on:click={() => (active = true)}>Edit rows</Button>
          <Button href="/admin/equipments/new">Nuevo Equipo</Button>
        </ToolbarContent>
      </Toolbar>
    </DataTable>
    <Pagination bind:pageSize
        bind:page
        totalItems={equipments.length}
        pageSizeInputDisabled
    ></Pagination>
</section>