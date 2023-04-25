<script lang="ts">
    import "@carbon/charts/styles.css";
    import moment from "moment";
    import { onMount } from "svelte";
    import { groupBy, countBy } from 'lodash';
    import type { IClient } from "../../service/clients/service";
    import type { IEquipment } from "../../service/equipments/service";
    import type { IRent } from "../../service/rents/service";
    import { ComboBox, DataTable, Select, SelectItem } from "carbon-components-svelte";
    import type { IFIlter } from "../../service/utils";


    export let rents: IRent[] = [];
    export let clients: IClient[] = [];
    export let equipments: IEquipment[] = [];
    export let filters: IFIlter = {} as IFIlter;
    let clientTopTen:any = []
    let elToList = 3
    const setData = ()=>{
        let currentDateFilter = filters.year ? moment().year(filters.year) : moment();
        
        if(filters.month >= 0){
            currentDateFilter.month(filters.month);
        }
        
        let filteredRents = rents
        .filter((rent) => moment(rent.date).isSame(currentDateFilter,filters.month >= 0 ? 'month' : 'year'))
        
        if(filters.equipment?.length){
            filteredRents = filteredRents.filter((rent)=> filters.equipment.includes(rent.equipment.id));
        }
        const grouped = groupBy(filteredRents, 'client.id')
        let result = []
        for(let key in grouped){
            result.push({
                rents: grouped[key].length,
                client: clients.find((cl)=> cl.id === key)
            })
        }
        clientTopTen = result.sort((a,b)=>a.rents <= b.rents ? 1 :-1).slice(0, elToList).map((item,i)=>{
            item.id = i+1
            return item;
        })
    }
    const getEquipmentsName = (id) => {
        return equipments.find((x) =>x.id === id )?.name
    }
    $: rents, clients, equipments, filters, elToList, setData()
</script>
<section>
    <h4>Top Ten de Clientes de {filters.equipment ? getEquipmentsName(filters.equipment) : 'todos los equipos'}</h4>
    <DataTable
        headers={[
            {key: 'id', value: 'Posicion'},
            {key: 'client.name', value: 'Cliente'},
            {key: 'rents',value: 'Alquileres'}
        ]}
        rows={clientTopTen}
    />
    <Select size="sm" labelText="Clientes listados" bind:selected={elToList} >
        <SelectItem value="3" />
        <SelectItem value="5" />
        <SelectItem value="10" />
    </Select>
</section>