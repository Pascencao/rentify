<script lang="ts">
    import { onMount } from "svelte";
    import { onAuthStateChanged } from 'Firebase/auth';
    import { deleteRent, getRents, setDeliver, updateRent, type IRent } from "../../../service/rents/service";
    import { joinRent, MonthsLabel, type IFIlter } from "../../../service/utils";
    import { getEquipments, type IEquipment } from "../../../service/equipments/service";
    import { auth } from "../../../service/firebase";
    import { getClients } from "../../../service/clients/service";
    import { Button, Checkbox, ComboBox, DataTable, Form, InlineNotification, Modal, NumberInput, Toolbar, ToolbarContent } from "carbon-components-svelte";
    import { Tile } from "carbon-components-svelte";
    import ExportJsonExcel from 'js-export-excel';
    import Currency from "$lib/helper/currency.svelte";
    import moment from "moment";
    import MainFilters from "$lib/MainFilters.svelte";
    import * as _ from 'lodash';
    import { CurrencyDollar, Delivery, Edit, TrashCan } from "carbon-icons-svelte";
    import { userRole } from "../../../service/stores";
    import { getUser, getUsers, type IProfile } from "../../../service/users/service";
    import type { ComboBoxItem } from "carbon-components-svelte/types/ComboBox/ComboBox.svelte";

    moment.defineLocale('es', {
        parentLocale: 'en',
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mie._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
      }
    );
    moment.locale('es');
      let tableColumns:any[] = [
        {key: 'date', value: 'Dia'},
        {key: 'summaryEquip', value: 'Equipos'}
    ]
    let openDelete:boolean = false;
    let openSetPaid:boolean = false;
    let totalEstimated: number = 0;
    let totalPaid: number = 0;
    let equipments: IEquipment[], rents,clients,currentRents:any[] =[];
    let generalFilters:IFIlter = {year: 0, month: 0, client: '', equipment: ''};
    let rentToRemove: IRent|null = null;
    let rentToPay: IRent|null = null;
    let eftPrice:number = 0;
    let transferPrice:number = 0;
    let updatePrice: boolean = true;
    let openSetDelivery:boolean = false, rentToDeliver: IRent = null;
    let users: ComboBoxItem[] = [];

    onMount(() => {
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    const profile = await getUser(user.uid);
                    users = await (await getUsers()).sort((a:IProfile,b:IProfile)=> a.email?.toLowerCase() >= b.email?.toLowerCase()? 1 : -1)
                        .map(u => ({id: u.id, text: u.email} as ComboBoxItem));
                    
                    if(profile.role === 'ADMIN'){
                        tableColumns = [
                            ...tableColumns, 
                            {key: 'summaryPrice', value: 'Total del  dia'},
                            {key: 'summaryIn', value: 'Cobrado Total'},
                        ]
                    }
                }
            }
        );
    });

    const setData = async (filters?:IFIlter) =>{
        const monthFilter = moment();
        totalEstimated = 0
        totalPaid = 0
        if(filters?.year){
            monthFilter.year(filters?.year)
        }
        if(filters?.month !== undefined && filters?.month >=0 ){
            monthFilter.month(filters?.month);
        }
        let helper: any[] = [];
        equipments = await getEquipments();
        rents = await getRents();
        clients = await getClients()
        const data = await joinRent(rents, equipments, clients).sort((a,b)=>moment(a.date).isSameOrBefore(b.date)? -1 :1);
        data.filter((x:any)=>x.equipment && x.client).filter(rent=>{
            const dateFilter = moment(rent.date).isSame(monthFilter,'month');
            const equipFilter = filters?.equipment?.length ? filters.equipment.includes(rent.equipment.id) : true;
            const clientFilter = filters?.client ? rent.client.id === filters.client : true;
            return dateFilter && equipFilter && clientFilter
        }).map(rent=>{
            const index = moment(rent.date).date()

            if(typeof rent.rent_price === 'string'){console.log(rent)}
            
            totalEstimated += rent.rent_price || 0;
            totalPaid += rent.paid ? rent.rent_price : 0;
            helper[index] = helper[index] || {};
            helper[index] = {
                id: helper[index]?.id || moment(rent.date).format('ddd  DD'),
                date: helper[index]?.date || moment(rent.date).format('ddd  DD'),
                summaryEquip: helper[index]?.summaryEquip ? `${helper[index]?.summaryEquip}, ${rent.equipment?.name}` : rent.equipment?.name,
                summaryPrice: (helper[index]?.summaryPrice || 0) + rent.rent_price || 0,
                summaryIn: (helper[index]?.summaryIn || 0) + (rent.paid ? (rent.rent_price || 0) : 0),
                rents: helper[index]?.rents ? [...helper[index].rents, rent] : [rent]
            }
        })
        currentRents = helper.filter(x=> !!x);
    }
    const filterData = ({detail:filters}: {detail: IFIlter})=>{
        generalFilters=filters;
        setData(filters)
    };
    
    const setPaid = (rent: IRent) => {
        rentToPay = rent;
        eftPrice = rent.rent_price;
        openSetPaid = true;
    }
    const joinRents = (rents: any[]) =>{
        rents = rents.filter((x:any) => x.client && x.equipment)
        let result = [];
        do {
            const first = rents.shift();
            const equals = _.remove(rents, (n:any)=> n.client.id == first.client.id);
            result.push({
                client: first.client,
                description: first.description,
                equipments: [first, ...equals]
            })
        } while (rents.length);
        return result
    }
    const removeRent = async () => {
        await deleteRent(rentToRemove?.id as string);
        setData(generalFilters);
    }
    const setDeliverModal = async (rent: IRent) => {
        openSetDelivery = true;
        rentToDeliver = rent;
        if(!rentToDeliver.deliver){
            rentToDeliver.deliver = {delivery: '', takeOff: ''}
        }
    }
    const askToRemoveRent = (rent: any)=>{
        openDelete = true;
        rentToRemove = rent;
    }
    const exportTable = () => {
        var option:any = {};
        option.datas = []
        option.fileName = `Agenda ${MonthsLabel[generalFilters.month]}`;
        let result: any[] = [];
        currentRents.map((rent)=>{
            rent.rents.map((rent1:IRent)=>{
                result.push([
                    rent.date,
                    rent1.equipment.name, 
                    rent1.client.name, 
                    rent1.client.address, 
                    rent1.client.contact, 
                    rent1.description, 
                    rent1.rent_price
                ])
            })
        })
        option.datas = [{
            sheetData: result,
            sheetHeader: ["Fecha","Equipo", "Cliente", 'Direccion', 'Contacto',"Desripcion","Precio"],
            columnWidths: [7,7,7,7,7,7]
        }];
        
        var toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    }


    function getDeliveryClass(equip: any): string | null | undefined {
        let className = "";
        if(equip.deliver){
            if (equip.deliver.delivery && equip.deliver.takeOff) {
                className = '!bg-emerald-600'
            } else if(equip.deliver.delivery || equip.deliver.takeOff){
                className = '!bg-green-300'
            }
        }
        return className
    }
</script>

<svelte:head>
	<title>Rentify | Agenda</title>
</svelte:head>
<section class="sm:p-4 mb-8 sm:mb-4">
    <h2>Agenda</h2>
    <MainFilters on:filter={filterData}/>
    {#if $userRole.role === 'ADMIN'}
    <div class=" grid  justify-items-end mb-4">
        <h4 class="flex flex-row"><strong>Total Estimado:</strong>&nbsp;<Currency amount={totalEstimated}/></h4>
        <h4 class="flex flex-row"><strong>Total Cobrado:</strong>&nbsp;<Currency amount={totalPaid}/></h4>
    </div>
    {/if}
    <DataTable zebra
    title="Agenda"
        expandable
        size="medium" headers={tableColumns} rows={currentRents}>
     <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === "summaryPrice" }
            <Currency amount={cell.value} />
        {:else if cell.key === "summaryIn" }
            <Currency amount={cell.value} />
        {:else}
            {cell.value}
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="expanded-row" let:row>
        <article class="grid sm:grid-cols-2 md:grid-cols-4 grid-cols-1 gap-3">
            {#each joinRents(row.rents) as rent }
            <Tile class="h-full">
                <h6 class="ellipsis w-full sm:w-3/4">{rent.client.name}</h6>
                <p class="ellipsis w-full sm:w-3/4">{rent.client.address}</p>
                <p class="ellipsis w-full sm:w-3/4">{rent.client.contact}</p>
                <p>{rent.description || ''}</p>
                {#each rent.equipments as equip}
                <Tile light class="my-2">
                    <Currency amount={equip.rent_price}/>
                    <p><strong>{equip.equipment.name}</strong></p>
                    <Button size="small" class={equip.paid ? '!bg-emerald-500' : '!bg-rose-600'} kind="ghost" iconDescription="Confirmar Pago" icon={CurrencyDollar}  on:click={()=> setPaid(equip)}/>
                    {#if $userRole.role === 'ADMIN'}
                        <Button size="small" kind="ghost" iconDescription="Editar" icon={Edit} href={`/admin/agenda/edit/${equip.id}`}/>
                        <Button size="small" kind="danger-ghost" class="!px-2" iconDescription="Eliminar" icon={TrashCan} on:click={()=> askToRemoveRent(equip)}/>
                        <Button size="small" kind="ghost" class={getDeliveryClass(equip)}  icon={Delivery} iconDescription="Transporte" on:click={()=> setDeliverModal(equip)}/>
                    {/if}
                </Tile>
                {/each}
            </Tile>
            {/each}
        </article>
    </svelte:fragment>
    <Toolbar>
    <ToolbarContent>
        {#if $userRole.role === 'ADMIN'}
        <Button href="/admin/agenda/new">Nuevo alquiler</Button>
        {/if}
        <Button on:click={()=>exportTable()}>Exportar</Button>
      </ToolbarContent>
  </Toolbar>
</DataTable>
<Modal
    bind:open={openDelete}
    modalHeading="Eliminar alquiler"
    primaryButtonText="Confirmar"
    secondaryButtonText="Cancelar"
    on:click:button--secondary={() => (openDelete = false)}
    on:open
    on:close={()=>rentToRemove=null}
    on:submit={()=>{
        removeRent()
        openDelete = false
    }}
>
  <p>Seguro que queres eliminar este alquiler</p>
  <Tile light>
      <p>{rentToRemove?.client?.name}</p>
      <p>{rentToRemove?.equipment?.name}</p>
      <Currency amount={rentToRemove?.rent_price} />
  </Tile>
</Modal>
<Modal
    bind:open={openSetPaid}
    modalHeading="Guardar Pago"
    primaryButtonText="Confirmar"
    secondaryButtonText="Cancelar"
    on:click:button--secondary={() => (openSetPaid = false)}
    on:open
    on:close={()=>rentToPay=null}
    on:submit={async ()=>{
        if(!rentToPay) return;
        let resultPayment = [];
        if(eftPrice){
            resultPayment.push({type: 'cash', amount: eftPrice})
        }
        if(transferPrice){
            resultPayment.push({type: 'transfer', amount: transferPrice})
        }
        if(!resultPayment.length){
            resultPayment.push({type: 'cash', amount: 0})
        }
        if(updatePrice){
            rentToPay.rent_price = eftPrice + transferPrice;
        }
        
        // @ts-ignore
        await updateRent(rentToPay.id, {
            paid: resultPayment,
            rent_price: updatePrice ? eftPrice + transferPrice : rentToPay.rent_price
        })
        rentToPay = null
        openSetPaid = false;
        eftPrice = 0;
        transferPrice = 0;
    }}
>
<div class="grid grid-cols-1 sm:grid-cols-2">
    <Tile>
      <Form>
        <NumberInput label="Efectivo" bind:value={eftPrice}/>
        <NumberInput label="Deposito" bind:value={transferPrice}/>
      </Form>
    </Tile>
    <Tile class="py-8 text-right">
        <p class="!text-lg my-4"><strong>Precio contratado:</strong> <Currency amount={rentToPay?.rent_price}/></p>
        <p class="!text-lg my-4"><strong>Precio pagado:</strong> <Currency amount={eftPrice + transferPrice}/></p>
    </Tile>
    <Checkbox labelText="actualizar precio" bind:checked={updatePrice}></Checkbox>
</div>
{#if updatePrice}
<InlineNotification
    hideCloseButton
    kind="warning"
    title="Cuidado:"
    subtitle="La suma de los pagos se guardara como el precio del alquiler"
/>
{/if}
</Modal>
<Modal
    bind:open={openSetDelivery}
    modalHeading="Entrega y retiro"
    primaryButtonText="Confirmar"
    secondaryButtonText="Cancelar"
    on:click:button--secondary={() => (openSetDelivery = false)}
    on:close={()=>{
        rentToDeliver = null;
    }}
    on:submit={async ()=>{
        // @ts-ignore
        setDeliver(rentToDeliver.id, {delivery: rentToDeliver.deliver.delivery, takeOff: rentToDeliver.deliver.takeOff})
        openSetDelivery = false
    }}
>
    <div class="grid grid-cols-1 sm:grid-cols-2">
        <Tile class="h-56">
            {#if rentToDeliver}
            <Form>
                <ComboBox size="sm"
                    titleText="Entrega"
                    shouldFilterItem={(item, value)=>{
                        if (!value) return true;
                        return item.text?.includes(value);
                    }}
                    bind:selectedId={rentToDeliver.deliver.delivery}
                    items={users}/>
                <ComboBox size="sm"
                    titleText="Retira"
                    shouldFilterItem={(item, value)=>{
                        if (!value) return true;
                        return item.text?.includes(value);
                    }}
                    bind:selectedId={rentToDeliver.deliver.takeOff}
                    items={users}/>
            </Form>
            {/if}
          </Tile>
        <Tile>
            <p>{rentToDeliver?.client?.name}</p>
            <p>{rentToDeliver?.equipment?.name}</p>
            <p><Currency amount={rentToDeliver?.rent_price}/></p>
        </Tile>
        
    </div>
</Modal>
</section>