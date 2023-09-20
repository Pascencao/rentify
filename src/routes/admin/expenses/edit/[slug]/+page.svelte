<script lang="ts" async>
    import { goto } from "$app/navigation";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { onAuthStateChanged } from 'Firebase/auth';
    import { page } from '$app/stores'

    import { Button, ComboBox, DatePicker, DatePickerInput, Form, TextInput, Tile } from "carbon-components-svelte";
    import { onMount } from "svelte";
    import { getExpenseById, updateExpense, type IExpense } from "../../../../../service/expenses/service";
    import moment from "moment";
    import type { ComboBoxItem } from "carbon-components-svelte/types/ComboBox/ComboBox.svelte";
    import { getExpensesCategory } from "../../../../../service/utils/service";
    import { getEquipments } from "../../../../../service/equipments/service";
    import { auth } from "../../../../../service/firebase";
    import { getUser, type IProfile } from "../../../../../service/users/service";

    let equipId = '';
    let profile:IProfile;
    let expense:IExpense = {date: '', equipment: '', description: '', price: 0, category: ''};
    let error = {date: false,equipment: false, description: false, price: false, category: false}
    let categories:ComboBoxItem[] = [];
    let equipments:ComboBoxItem[] = [];

    export function load({ params }: any) { return {id: params.slug}; }
    const getData = async ()=>{
        equipId = $page.params.slug;
        expense = await getExpenseById($page.params.slug).then(expense => {
            return {
                ...expense,
                category: categories.find((x) =>  x.text === expense.category)?.id,
                date: moment(expense.date).format('DD/MM/YYYY')
            }
        })
    }
    onMount(async () =>{

        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    profile = await getUser(user.uid);
                    equipments = await (await getEquipments())
                    .filter((e)=>profile.equipments.includes(e.id||''))
                    .sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1)
                    .map(x => ({id: x.id, text: x.name} as ComboBoxItem));
                    categories = await (await getExpensesCategory())
                        .sort((a,b) =>  a.label.toLowerCase() >= b.label.toLowerCase() ? 1 : -1)
                        .map(x => ({id: x.id, text: x.label} as ComboBoxItem));
                        await getData()
                }
            }
        );
    })
    const save = async ()=>{

        const category:string = categories.find((x)=> x.id === expense.category)?.text as string;
        await updateExpense(equipId, {...expense, category, date: moment(expense.date, 'DD/MM/YYYY').toString()})
    }
    const isValid = ()=>{
        error.date = !expense.date;
        error.description = !expense.description;
        error.price = !expense.price;
        return !(error.date || error.description || error.price);
    }
    const save_exit = async () => {
        if(isValid()){
            await save();
            goto('/admin/expenses');
        }

    }
    const save_reset = () => {
        if(isValid()){
            save();
            expense.date = '';
            expense.description = '';
            expense.price = 0;
        }
    }

</script>
<svelte:head>
	<title>Rentify | Editar Gasto</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/expenses"/>Editar equipo</h4>
    <Form>
        <Tile class="sm:w-1/2">
            <DatePicker light dateFormat="d/m/20y" datePickerType="single" class="mb-4" bind:value={expense.date}>
                <DatePickerInput class="w-full" size="sm" labelText="Fecha" placeholder="dd/mm/yyyy" />
            </DatePicker>
            <ComboBox
                invalid={error.equipment}
                titleText="Equipo"
                bind:selectedId={expense.equipment}
                shouldFilterItem={(item, value)=>{
                    if (!value) return true;
                    return item.text.toLowerCase().includes(value.toLowerCase());
                }}
                bind:items={equipments}
            />
            <ComboBox
                invalid={error.category}
                titleText="Categoria"
                bind:selectedId={expense.category}
                shouldFilterItem={(item, value)=>{
                    if (!value) return true;
                    return item.text.toLowerCase().includes(value.toLowerCase());
                }}
                bind:items={categories}
            />
            <TextInput class="mb-4" size="sm" bind:invalid={error.description} labelText="Direccion" bind:value={expense.description}/>
            <TextInput class="mb-4" size="sm" bind:invalid={error.price} labelText="Contacto" bind:value={expense.price}/>
        </Tile>
        <div class="mt-4 flex justify-end sm:space-x-1 space-y-1 sm:space-y-0 flex-col sm:flex-row">
            <Button class="w-full sm:w-auto" kind="ghost" href="/admin/expenses">Salir</Button>
            <Button class="w-full sm:w-auto" on:click={()=>save_exit()}>Guardar</Button>
        </div>
    </Form>
</section>