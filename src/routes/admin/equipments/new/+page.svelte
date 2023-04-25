<script lang="ts">
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { Button, Form, NumberInput, TextInput, Tile } from "carbon-components-svelte";
    import { setEquipment, type IEquipment } from "../../../../service/equipments/service";

    let equipment:IEquipment = { name: '', rent_price: 0, type: ''}
    let error = {name: false, type: false, rent_price: false}

    const save = async ()=>{
        await setEquipment(equipment)
    }
    const isValid = ()=>{
        error.name = !equipment.name;
        error.type = !equipment.type;
        error.rent_price = !equipment.rent_price;
        return !(error.name || error.type || error.rent_price);
    }
    const save_exit = () => {
        if(isValid()){
            save();
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
	<title>Rentify | Nuevo Equipo</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/equipments"/> Nuevo equipo</h4>
    <Form>
        <Tile class="sm:w-1/2">
            <TextInput class="mb-4" light bind:invalid={error.name} labelText="Nombre" bind:value={equipment.name}/>
            <TextInput class="mb-4" light bind:invalid={error.type} labelText="typo" bind:value={equipment.type}/>
            <NumberInput size="sm" light bind:invalid={error.rent_price} label="Precio sugerido" bind:value={equipment.rent_price}/>
        </Tile>
        <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
            <Button class="w-full sm:w-auto" on:click={()=>save_reset()}>Agregar una mas</Button>
            <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar y salir</Button>

        </div>
    </Form>
</section>