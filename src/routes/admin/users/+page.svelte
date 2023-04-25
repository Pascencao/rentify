<script lang="ts">
    import { Button, DataTable, Row } from "carbon-components-svelte";
    import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
    import { Delivery, UserAdmin } from "carbon-icons-svelte";
    import moment from "moment";
    import { onMount } from "svelte";
    import { getUsers, setRole, type IProfile } from "../../../service/users/service";

    const rolesDic = {
        ADMIN: 'Administrador',
        DELIVERY: 'Trasporte'
    }
    let users: DataTableRow[] = [];
    onMount(async ()=>{
        //@ts-ignore
        users = await (await getUsers()) as DataTableRow[];
    });
    const updateProfile = (id: string, role:string)=>{
        setRole(id, role)
    }
</script>
<section class="m-4">

    <h1 class="mb-4">Usuarios</h1>
    <DataTable headers={[
        {key: 'email', value: 'Email'},
        {key: 'role', value: 'Rol'},
        {key: 'lastLogin', value: 'Ultimo acceso'},
        {key: 'actions', value: ''}
    ]} rows={users}>
        <svelte:fragment slot="cell" let:cell let:row >
            {#if cell.key === 'role'}
                {rolesDic[cell.value]}
            {:else if cell.key === 'lastLogin'}
                {moment(cell.value).format('DD/MM/YYYY hh:mm')}
            {:else if cell.key ==='actions'}
                <Button size="small" on:click={()=>{
                    updateProfile(row.id, row.role === 'ADMIN' ? 'DELIVERY' : 'ADMIN')
                }} icon={row.role === 'ADMIN' ? Delivery : UserAdmin} iconDescription={row.role === 'ADMIN' ? 'Convertir en transportista' : 'Convertir en Administrador'} />
            {:else}
                {cell.value || row.uid}
            {/if}
        </svelte:fragment>
    </DataTable>
</section>