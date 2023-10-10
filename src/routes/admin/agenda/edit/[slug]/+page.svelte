<script lang="ts">
    import { goto, afterNavigate } from '$app/navigation';
    import { page } from "$app/stores";
    import { onAuthStateChanged } from 'Firebase/auth';
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { Button, ComboBox, DatePicker, DatePickerInput, Form, FormGroup, NumberInput, TextArea, Tile } from "carbon-components-svelte";
    import type { ComboBoxItem } from "carbon-components-svelte/types/ComboBox/ComboBox.svelte";
    import moment from "moment";
    import { onMount } from "svelte";
    import { getClients } from "../../../../../service/clients/service";
    import { getEquipments } from "../../../../../service/equipments/service";
    import { getRentById, getRents, updateRent, type IRent } from "../../../../../service/rents/service";
    import { getUser, type IProfile } from "../../../../../service/users/service";
    import { auth } from "../../../../../service/firebase";
    import { base } from '$app/paths'

    let id = $page.params.slug
    let rent:IRent = {} as IRent;
    let clients:ComboBoxItem[] = []
    let equipments:ComboBoxItem[] = []
    let formError = {client: false, equipment: false, date: false}
    let otherRents: any[] = [];
    let profile: IProfile;

    let previousPage : string = base ;

    afterNavigate(({from}) => {
        previousPage = `${from?.url.pathname}${from?.url.search}` || previousPage;
    })
    onMount(async ()=> {
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    profile = await getUser(user.uid);
                    equipments = await (await getEquipments())
                    .filter((e)=>profile.equipments.includes(e.id||''))
                    .sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1).map((x:any) => ({id: x.id, text: x.name}));
                }
            }
        );
        otherRents = await getRents();
        clients = await (await getClients()).sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1).map(x => ({id: x.id, text: x.name}));
        let data = await getRentById(id)

        rent = {...data, date: moment(data.date).format('DD/MM/YYYY')}
    })
    const validateForm = ()=>{
        formError.client = !rent.client;
        formError.equipment = !rent.equipment;
        formError.date = !rent.date;
        return formError.client || formError.equipment || formError.date;
    };
    const prepareDataToSave = async ()=>{
        await updateRent(id, {...rent, date: moment(rent.date, 'DD/MM/YYYY').toString()})
        goto(previousPage || '/admin/agenda')
    };
    const equipByDates = (equips: any, date: string)=>{
        const currentDates = otherRents?.filter((rent)=>moment(rent.date).isSame(moment(date, 'DD/MM/YYYY')))
        .map(rent =>rent.equipment);
        
        equips.map((e:any) => {
            e.disabled = currentDates.includes(e.id)
            return e;
        })
        
        return equips
    }
</script>
<svelte:head>
	<title>Rentify | Editar alquiler</title>
</svelte:head>
<div class="my-4 p-4">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href={previousPage||'/admin/agenda'}/>Editar Fecha</h4>
    <Tile class="w-3/4 sm:w-1/2 md:w-1/2">
        <ComboBox
            bind:invalid={formError.client}
            titleText="Cliente"
            invalidText="Necesitas elegir un cliente"
            bind:selectedId={rent.client}
            shouldFilterItem={(item, value)=>{
                if (!value) return true;
                return item.text.toLowerCase().includes(value.toLowerCase());
            }}
            items={clients}
        />
        <Form >
            <div class="w-auto my-4">
                <DatePicker
                dateFormat="d/m/20y" datePickerType="single" class="!w-full" bind:value={rent.date}
                on:change={()=>{
                    rent.equipment = '';
                    rent.rent_price = 0;
                }}
                >
                    <DatePickerInput
                    bind:invalid={formError.date} class="!w-full" size="sm" labelText="Fecha" placeholder="dd/mm/yyyy" />
                </DatePicker>
            </div>
            
            <ComboBox
                titleText="Equipo"
                items={equipByDates(equipments, rent.date)}
                bind:selectedId={rent.equipment}
                bind:invalid={formError.equipment}
                shouldFilterItem={(item, value)=>{
                    if (!value) return true;
                    return item.text.toLowerCase().includes(value.toLowerCase());
                }}
                on:select={()=>{
                    if(rent.equipment){
                        const sel = equipments.find((eq) => eq.id === rent.equipment);
                        // @ts-ignore
                        rent.rent_price = sel.price;
                    }else {
                        rent.rent_price = 0;
                    }
                }}
            />
            <TextArea rows={2} class="h-4 my-4" labelText="Descripcion" bind:value={rent.description}/>
            
            <NumberInput label="A cobrar" bind:value={rent.rent_price} />
        </Form>
    </Tile>
</div>
<Button on:click={()=>{
    
    if(!validateForm()){
        prepareDataToSave();
    }
    
}}>Guardar</Button>