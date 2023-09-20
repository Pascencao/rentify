<script lang="ts">
    import { Button, Checkbox, DataTable, Modal, Row } from "carbon-components-svelte";
    import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
    import { CloudLogging, Delivery, InProgress, UserAdmin } from "carbon-icons-svelte";
    import moment from "moment";
    import { onMount } from "svelte";
    import { getUsers, setRole, type IProfile, setEquipments } from "../../../service/users/service";
    import { getEquipments, type IEquipment } from "../../../service/equipments/service";
    import { each } from "svelte/internal";

    const rolesDic = {
        ADMIN: 'Administrador',
        DELIVERY: 'Trasporte'
    }
    let openAssingEquip: boolean = false;
    let equipList: IEquipment[] = [];
    let selectedUser:IProfile = null;
    let selectedUserEquip:string[] = [];
    let checkGroup = []
    let equip: boolean = false;
    let users: DataTableRow[] = [];
    onMount(async ()=>{
        //@ts-ignore
        users = await (await getUsers()) as DataTableRow[];
        equipList = await getEquipments();
        checkGroup = equipList.map((e)=>e.id||'');
    });
    const updateProfile = (id: string, role:string)=>{
        setRole(id, role)
    }
    const userHasEquip = (equipId:string = '')=>{
        return selectedUser.equipments.includes(equipId);
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
                    // @ts-ignore
                    selectedUser = row;
                    selectedUserEquip = row.equipments || [];
                    openAssingEquip=true
                }}
                icon={CloudLogging} iconDescription="Asignar equipos"></Button>
                <Button size="small" on:click={()=>{
                    updateProfile(row.id, row.role === 'ADMIN' ? 'DELIVERY' : 'ADMIN')
                }} icon={row.role === 'ADMIN' ? Delivery : UserAdmin} iconDescription={row.role === 'ADMIN' ? 'Convertir en transportista' : 'Convertir en Administrador'} />
            {:else}
                {cell.value || row.uid}
            {/if}
        </svelte:fragment>
    </DataTable>
</section>

<Modal
    bind:open={openAssingEquip}
    modalHeading="Guardar Pago"
    primaryButtonText="Confirmar"
    secondaryButtonText="Cancelar"
    on:click:button--secondary={() => (openAssingEquip = false)}
    on:open
    on:submit={async ()=>{
        setEquipments(selectedUser.id||'',selectedUserEquip);
        let i = users.findIndex((u)=>u.id=== selectedUser.id);
        users[i]={...users[i], equipments: selectedUserEquip}
        openAssingEquip=false;
    }}
>
    <div class="grid grid-cols-1 sm:grid-cols-2">
        {#each equipList as equip}
            <Checkbox bind:group={selectedUserEquip} labelText={equip.name} value={equip.id}></Checkbox>
        {/each}
    </div>
</Modal>
<!--
    email:"pandresascencao@gmail.com"
    lastLogin:"Mon Sep 18 2023 17:43:58 GMT-0300"
    role:"ADMIN"
-->