<script lang="ts">
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { Button, ComboBox, DatePicker, DatePickerInput, Form, NumberInput, TextInput, Tile } from "carbon-components-svelte";
    import type { ComboBoxItem } from "carbon-components-svelte/types/ComboBox/ComboBox.svelte";
    import moment from "moment";
    import { onMount } from "svelte";
    import { getEquipments } from "../../../../service/equipments/service";
    import { setExpense, type IExpense } from "../../../../service/expenses/service";
    import { getExpensesCategory } from "../../../../service/utils/service";

    let tickets:IExpense = { date:'', equipment: '', description: '', price: 0, category: ''}
    let error = {date: false, equipment: false, price: false, category: false}
    let categories:ComboBoxItem[] = [];
    let equipments:ComboBoxItem[] = [];

    onMount(async () =>{
        equipments = await (await getEquipments())
            .sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1)
            .map(x => ({id: x.id, text: x.name} as ComboBoxItem));
        categories = await (await getExpensesCategory())
            .sort((a,b) => a.label.toLowerCase() >= b.label.toLowerCase() ? 1 : -1)
            .map(x => ({id: x.id, text: x.label} as ComboBoxItem));
    })
    const save = async ()=>{
        const category:string = categories.find((x)=> x.id === tickets.category)?.text as string;
        await setExpense({...tickets, category, date: moment(tickets.date, 'DD/MM/YYYY').toString()})
    }
    const isValid = ()=>{
        error.date = !tickets.date;
        error.category = !tickets.category;
        error.price = !tickets.price;
        return !(error.date || error.category || error.price);
    }
    const save_exit = () => {
        if(isValid()){
            save();
            goto('/admin/expenses');
        }

    }
    const save_reset = () => {
        if(isValid()){
            save();
            tickets.date = '';
            tickets.description = '';
            tickets.category = '';
            tickets.price = 0;
        }
    }
</script>
<svelte:head>
	<title>Rentify | Nuevo Gasto</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/expenses"/> Nuevo gasto</h4>
    <Form>
        <Tile class="sm:w-1/2">
            <DatePicker  dateFormat="d/m/20y" datePickerType="single" class="mb-4" bind:value={tickets.date}>
                <DatePickerInput class="w-full" size="sm" labelText="Fecha" placeholder="dd/mm/yyyy" />
            </DatePicker>
            <ComboBox
                invalid={error.equipment}
                titleText="Equipo"
                bind:selectedId={tickets.equipment}
                shouldFilterItem={(item, value)=>{
                    if (!value) return true;
                    return item.text.toLowerCase().includes(value.toLowerCase());
                }}
                bind:items={equipments}
            />
            <ComboBox
                invalid={error.category}
                titleText="Categoria"
                bind:selectedId={tickets.category}
                shouldFilterItem={(item, value)=>{
                    if (!value) return true;
                    return item.text.toLowerCase().includes(value.toLowerCase());
                }}
                bind:items={categories}
            />
            <TextInput class="mb-4" labelText="Descripcion" bind:value={tickets.description}/>
            <NumberInput size="sm" bind:invalid={error.price} label="Precio" bind:value={tickets.price}/>
        </Tile>
        <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
            <Button class="w-full sm:w-auto" on:click={()=>save_reset()}>Agregar una mas</Button>
            <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar y salir</Button>

        </div>
    </Form>
</section>