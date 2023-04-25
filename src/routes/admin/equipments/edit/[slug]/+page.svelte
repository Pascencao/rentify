<script lang="ts" async>
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { page } from '$app/stores'

    import { Button, Form, TextInput, Tile } from "carbon-components-svelte";
    import { getEquipmentById, updateEquipment, type IEquipment } from "../../../../../service/equipments/service";
    import { onMount } from "svelte";

    let equipId = '';
    let equipment:IEquipment = {name: '', type: '', rent_price: 0};
    let error = {name: false, type: false, rent_price: false}
    export function load({ params }: any) { return {id: params.slug}; }
    const getData = async ()=>{
        equipId = $page.params.slug;
        equipment = await getEquipmentById($page.params.slug)
        
    }
    onMount(async()=> await getData());
    const save = async ()=>{
        await updateEquipment(equipId,equipment)
    }
    const isValid = ()=>{
        error.name = !equipment.name;
        error.type = !equipment.type;
        error.rent_price = !equipment.rent_price;
        return !(error.name || error.type || error.rent_price);
    }
    const save_exit = async () => {
        if(isValid()){
            await save();
            goto('/admin/equipments');
        }

    }
    const save_reset = () => {
        if(isValid()){
            save();
            equipment.name = '';
            equipment.type = '';
            equipment.rent_price = 0;
        }
    }

</script>
<svelte:head>
	<title>Rentify | Editar Equipo</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/equipments"/>Editar equipo</h4>
    <Form>
        <Tile class="sm:w-1/2">
            <TextInput class="mb-4" size="sm" bind:invalid={error.name} labelText="Nombre" bind:value={equipment.name}/>
            <TextInput class="mb-4" size="sm" bind:invalid={error.type} labelText="Direccion" bind:value={equipment.type}/>
            <TextInput class="mb-4" size="sm" bind:invalid={error.rent_price} labelText="Contacto" bind:value={equipment.rent_price}/>
        </Tile>
        <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
            <Button class="w-full sm:w-auto" kind="ghost" href="/admin/equipments">Salir</Button>
            <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar</Button>

        </div>
    </Form>
</section>