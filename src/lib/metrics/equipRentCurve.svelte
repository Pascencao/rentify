<script lang="ts">
    import "@carbon/charts/styles.css";
    import { LineChart } from "@carbon/charts";

    import type { IClient } from "../../service/clients/service";
    import type { IEquipment } from "../../service/equipments/service";
    import type { IRent } from "../../service/rents/service";
    import { MonthsLabel, type IFIlter } from "../../service/utils";
    import { onMount } from "svelte";
    import moment from "moment";
    import { groupBy, countBy } from 'lodash';

    export let rents: IRent[] = [];
    //export let clients: IClient[] = [];
    export let equipments: IEquipment[] = [];
    export let filters: IFIlter = {} as IFIlter;

    const options = {
        "title": "Curva de alquileres mensuales",
        "axes": {
            "bottom": {
                "title": "Alquiler Mensual",
                "mapsTo": "month",
                "scaleType": "labels"
            },
            "left": {
                "title": "alquileres",
                "mapsTo": "count",
                "scaleType": "label"
            }
        },
        "curve": "curveMonotoneX",
        "height": "400px"
    };
    const getFitlerDate =() =>{
        let result = moment()
        if(filters.year >= 0){
            result.year(filters.year);
        }
        if(filters.month >= 0){
            result.month(filters.month)
        }
        return result
    }
    const setData = ()=>{
        if(!rents.length || !equipments.length) return
        let filterDate = getFitlerDate();
        document.querySelectorAll('#equip-rent-curve *')?.forEach((el)=>el.remove());
        let data:any[] = []
        const groupedDate = groupBy(
            rents.filter((rent)=>{
                const matchDate = moment(rent.date).isSame(filterDate, 'year');
                const matchEquip = filters?.equipment?.length ? filters.equipment.includes(rent.equipment.id) : true;
                const matchClient = filters.client ? rent.client.id === filters.client : true
                return matchDate && matchEquip && matchClient;
            }),
            (item: IRent)=>moment(item.date).month()
        )
        for(let key in groupedDate){
            equipments.map((equip)=>{
                const count = countBy(groupedDate[key], (it: any) =>{
                    return it.equipment.id === equip.id
                })
                data.push({
                    group: equip.name,
                    month: MonthsLabel[key],
                    count: count.true
                })

            })
        }
        const chartHolder = document.getElementById("equip-rent-curve") as HTMLElement;
        // @ts-ignore
        new LineChart(chartHolder, {data,options});
        
    }
    $: rents, filters, equipments, setData();
    
    onMount(()=>{
        setData()
    })
</script>
<section>
    <div id="equip-rent-curve"></div>
</section>