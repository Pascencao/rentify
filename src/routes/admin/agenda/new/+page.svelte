<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onAuthStateChanged } from 'Firebase/auth';
    import Currency from "$lib/helper/currency.svelte";
    import ChevronLeft from "$lib/icons/chevron_left.svelte";
    import { Button, ComboBox, DatePicker, DatePickerInput, Form, FormGroup, NumberInput, TextArea, Tile, ToastNotification } from "carbon-components-svelte";

    import { TextInput } from "carbon-components-svelte";
    import type { ComboBoxItem } from "carbon-components-svelte/types/ComboBox/ComboBox.svelte";
    import { Add, RecentlyViewed, TrashCan } from "carbon-icons-svelte";
    import moment from "moment";
    import { onMount } from "svelte";
    import { getClients } from "../../../../service/clients/service";
    import { getEquipments } from "../../../../service/equipments/service";
    import { getRents, setRent, type IRent } from "../../../../service/rents/service";
    import { session } from "../../../../service/stores";
    import { auth } from "../../../../service/firebase";
    import { getUser, type IProfile } from "../../../../service/users/service";
    moment.defineLocale('es', {
        parentLocale: 'en',
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mie._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
      }
    );
    interface IRents {
        date: string;
        equipments: string[];
        description: string;
        price: number;
        error?: any|any[];
    }
    let clientError:boolean = false;
    let formError: boolean = false;
    let clients:ComboBoxItem[] = [];
    let equipments:ComboBoxItem[] = [];
    let selectedClient = '';
    let rents: any[] = [];
    let otherRents: any[] = [];
    let profile: IProfile;
    
    onMount(async ()=>{
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    profile = await getUser(user.uid);
                    equipments = await (await getEquipments())
                    .filter((e)=>profile.equipments.includes(e.id||''))
                    .sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1).map(x => ({id: x.id, text: x.name, price: x.rent_price}));
                }
            }
        );
        otherRents = await getRents();
        clients = await (await getClients()).sort((a,b) => a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1).map(x => ({id: x.id, text: x.name}));
        // this is the URL preloaders 	
        // 03/01 Platinum, Vela Yami, Mio Up
        // 03/03 Laser ADS, Mioup 2, Vela Yami
        $page.url.searchParams.forEach((val,key)=>{
            let dateObj = {
                date: moment(key, 'ddd DD/MM').locale('es-ES').format('DD/MM/YYYY'), 
                equipments: val.split(',').map((id:string) => ({id, price: 0})), 
                description: ''}
            rents.push(dateObj)
        })
        if(!rents.length){
            rents.push({
                date: '', 
                equipments: [{id: '', price: 0}], 
                description: ''})
        }
    })
    const addRent = ()=>{
        rents.push({date: '', equipments: [{id:'', price: 0}], description: '', error: null});
        rents = rents
    }
    const validateForm = (client:string)=>{
        let hasErrorOnRents = false;
        clientError = !client
        rents = rents.map((rent:IRents) => {
            let err = []
            if(!rent.date) err.push('Falta la fecha');
            if(rent.equipments.find((x:any)=>!x.id) !== undefined) err.push('Te falta elegir al menos un equipo');
            hasErrorOnRents = hasErrorOnRents || !!err.length;
            rent.error = err.length ? err : null;
            return rent;
        })
        return clientError || hasErrorOnRents;
    }
    const prepareDataToSave = async (client:string, rents:IRents[])=>{
        
        let rentsToSave:IRent[] = [];
        rents.map((rent: IRents) =>{
            let toSave:IRent = {
                createdAt: new Date().toString(),
                createdBy: $session.user.uid,
                client,
                date: moment(rent.date, 'DD/MM/YYYY').toString(),
                description: rent.description,
                rent_price: 0,
                paid: false,
                equipment: ''
            }
            rent.equipments.map((equip:any) => rentsToSave.push({...toSave, equipment: equip.id, rent_price: equip.price}))
        })
        await rentsToSave.map(async (rent:IRent)=>await setRent(rent))
        goto('/admin/agenda')
    }
    const calcRentPrice = (rent:any) => {
        let price = 0
        rent.equipments.map((e:any) => price += parseFloat(e.price));
        return price
    }
    const equipByDates = (equips: any, date: string)=>{
        const currentDates = otherRents?.filter((rent)=>moment(rent.date).isSame(moment(date, 'DD/MM/YYYY')))
        .map(rent =>rent.equipment);
        
        equips.map((e:any) => {
            e.disabled = currentDates.includes(e.id)
            return e;
        })
        
        return equips
    }
$: rents
</script>

<svelte:head>
	<title>Rentify | Nuevo Alquiler</title>
</svelte:head>
<section class="p-4 relative">
    <h4><Button kind="ghost" icon={ChevronLeft} iconDescription="Volver" href="/admin/agenda"/> Nuevo alquiler</h4>

    <div class="flex w-11/12 sm:w-2/4">
        <ComboBox
            invalid={clientError}
            titleText="Cliente"
            invalidText="Necesitas elegir un cliente"
            bind:selectedId={selectedClient}
            shouldFilterItem={(item, value)=>{
                if (!value) return true;
                return item.text.toLowerCase().includes(value.toLowerCase());
            }}
            items={clients}
        />
        <span class="h-auto ml-4 flex items-center">
            <Button icon={Add} iconDescription="Agregar fecha" size="field" on:click={()=>addRent()}></Button>
        </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
        {#each rents as rent}
            <Tile>
                <Form >
                    <div class="w-auto my-4">
                        <DatePicker dateFormat="d/m/20y" datePickerType="single" class="!w-full" bind:value={rent.date} on:change={()=>{
                            rent.equipments = [{id: '', price: 0}]
                        }}>
                            <DatePickerInput class="!w-full" size="sm" labelText="Fecha" placeholder="dd/mm/yyyy" />
                        </DatePicker>

                    </div>
                    {#each rent.equipments as equip, i}
                    <FormGroup legendText={`Equipos ${i+1}`}>
                        <div class="grid grid-cols-6 my-4 border border-indigo-200">
                            <div class="col-span-5">
                                <ComboBox
                                    titleText="Equipo"
                                    items={equipByDates(equipments, rent.date)}
                                    bind:selectedId={equip.id}
                                    shouldFilterItem={(item, value)=>{
                                        if (!value) return true;
                                        return item.text.toLowerCase().includes(value.toLowerCase());
                                    }}
                                    on:select={()=>{
                                        if(equip.id){
                                            const sel = equipments.find((eq) => eq.id === equip.id);
                                            // @ts-ignore
                                            equip.price = sel.price;
                                        }else {
                                            equip.price = 0;
                                        }
                                    }}
                                    on:clear={()=>equip.id = ''}
                                    
                                />
                                <NumberInput label="A cobrar" bind:value={equip.price} />
                            </div>
                            <div class="col-span-1">
                                <Button kind="ghost" icon={Add} size="small" iconDescription="Agregar" on:click={()=>{
                                    rent.equipments.push({id: '', price: 0})
                                    rent.equipments = rent.equipments
                                }}></Button>
                                {#if i!==0}
                                    <Button kind="ghost" size="small" icon={TrashCan} iconDescription="Eliminar"
                                    on:click={()=>{
                                        rent.equipments.splice(i,1)
                                        rent.equipments = rent.equipments
                                    }}></Button>
                                {/if}
                                
                            </div>
                        </div>
                    </FormGroup>
                    {/each}
                    <TextArea rows={2} class="h-4 my-4" labelText="Descripcion" bind:value={rent.description}/>
                    {#if rent.error?.length}
                        <ul class="text-red-600 my-2">
                            {#each rent.error as err}
                                <li class="my-2">- {err}</li>
                            {/each}
                        </ul>
                    {/if}
                </Form>
                <p>Total Fecha: <Currency amount={calcRentPrice(rent)} /></p>
            </Tile>
        {/each}
    </div>
    <Button on:click={()=>{
        formError = validateForm(selectedClient)
        if(!formError){
            prepareDataToSave(selectedClient, rents);
        }
        
    }}>Guardar</Button>
    {#if formError }
        <ToastNotification timeout={2000} class="absolute bottom-4 right-4" lowContrast kind="error">
            <strong slot="title">Error: </strong>
            <strong slot="subtitle">Hay algunos campos imcompletos</strong>
        </ToastNotification>
    {/if}
</section>