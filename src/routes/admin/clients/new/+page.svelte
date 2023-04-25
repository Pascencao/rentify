<script lang="ts">
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";


    import { Button, Form, FormGroup, TextInput, Tile } from "carbon-components-svelte";
    import { setClient, type IClient } from "../../../../service/clients/service";
    let client:IClient = { name: '', contact: '', address: ''}
    let error = {name: false, contact: false, address: false}
    const save = async ()=>{
        await setClient(client)
    }
    const isValid = ()=>{
        error.name = !client.name;
        error.address = !client.address;
        error.contact = !client.contact;
        return !(error.name || error.address || error.contact);
    }
    const save_exit = () => {
        if(isValid()){
            save();
            goto('/admin/clients');
        }

    }
    const save_reset = () => {
        if(isValid()){
            save();
            client.name = '';
            client.address = '';
            client.contact = '';
        }
    }
</script>

<svelte:head>
	<title>Rentify | Nuevo Cliente</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/clients"/> Nuevo cliente</h4>
    <Form>
        <Tile class="sm:w-1/2">
            <TextInput class="mb-4" size="sm" bind:invalid={error.name} labelText="Nombre" bind:value={client.name}/>
            <TextInput class="mb-4" size="sm" bind:invalid={error.address} labelText="Direccion" bind:value={client.address}/>
            <TextInput class="mb-4" size="sm" bind:invalid={error.contact} labelText="Contacto" bind:value={client.contact}/>
        </Tile>
        <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
            <Button class="w-full sm:w-auto" on:click={()=>save_reset()}>Agregar una mas</Button>
            <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar y salir</Button>

        </div>
    </Form>
</section>