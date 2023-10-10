<script lang="ts">
    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../../../../service/firebase";
    import { onMount } from "svelte";
    import { getEquipments, type IEquipment } from "../../../../service/equipments/service";
    import { getRents, type IRent } from "../../../../service/rents/service";
    import moment from 'moment';
    import { Button, Form, Checkbox, FormGroup } from 'carbon-components-svelte';
    import { goto } from '$app/navigation';
    

    moment.defineLocale('es', {
        parentLocale: 'en',
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mie._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
    });
    moment.locale('es');
    let formData:any = {years: {},
        months:{},
        days:{},
        equipments:{}
    };

    let selectedDates: {[key:string]: any} = {};
    const weekdays = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
    const MonthsLabel = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const years = [moment().year(), moment().add(1, 'years').year()]
    let equipments: IEquipment[]=[], rents:IRent[]=[];
    let listOfDates:{[key: string]: string[]} = {};

    onMount(async ()=>{
        onAuthStateChanged(
            auth,
            async (user) => {
                if(user){
                    equipments = await getEquipments();
                    rents = await getRents();
                }
            }
        );
    })
    const getDates =(year:number, month: number, equip:string, weekday:number=-1)=>{
        year = year || moment().year();
        month = month || moment().month();
        let freeDates = []
        const filterMonth = moment().year(year).month(month);
        const totaldays = filterMonth.daysInMonth();
        for (let i = 1; i <= totaldays; i++){
            let hasRent = 0;
            hasRent = rents.filter(rent => moment(rent.date).isSame(filterMonth.date(i),'date'))
                .filter(rent => rent.equipment === equip).length
            
            const isSelectedWeekday = weekday >=0 ? filterMonth.date(i).isoWeekday() === weekday : true;
            if(!hasRent && isSelectedWeekday){
                freeDates.push(filterMonth.date(i).toString())
            }
        }
        return freeDates;
    }
    const setDefaults = (obj: any)=>{
        obj.years = obj.years.length ? obj.years : [moment().year()]
        obj.months = obj.months.length ? obj.months : [0,1,2,3,4,5,6,7,8,9,10,11]
        obj.days = obj.days.length ? obj.days : [0,1,2,3,4,5,6];
        obj.equipments = obj.equipments.length ? obj.equipments : equipments.map(e=> e.id);
        return obj;
    }
    const createDate = ()=>{
        let query:any = {};
        for (let key in selectedDates){
            selectedDates[key].map((dat:any) => query[dat] = query[dat] ? [...query[dat], key] : [key]);
        }
        const params = new URLSearchParams(query).toString()
        goto(`/admin/agenda/new?${params}`)
    }
</script>
<section class="m-4">
    <div class="grid grid-cols-4">
        <Form on:submit={(event)=>{
            let formObj ={equipments: [], months: [], years: [], days: []};
            selectedDates = {};
            for(let key in formData){
                for(let key2 in formData[key]){
                    if(formData[key][key2]){
                        //@ts-ignore
                        formObj[key] = formObj[key] ? [...formObj[key], key2.replace('year-', '')] : [key2.replace('year-', '')];
                    };
                }
            }
            formObj = setDefaults(formObj);
            formObj.equipments.map(e =>{
                formObj.years.map(y => {
                    formObj.months.map(m =>{
                        formObj.days.map(wd =>{
                            listOfDates[e] = [...(listOfDates[e]||[]), ...getDates(parseInt(y),MonthsLabel.indexOf(m), e, parseInt(wd)+1)]
                                .sort((a,b) => moment(a).isSameOrAfter(b)?1:-1)
                        })
                    })
                })
            })
            
        }}>
            <FormGroup  legendText="year">
                <h3>Año</h3>
                <ul>
                    {#each years as year }
                    <li><Checkbox name={'year'} value={year} labelText={`${year}`} bind:checked={formData.years[`year-${year}`]}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup legendText="months">
                <h3>Mes</h3>
                <ul>
                    {#each MonthsLabel as month, index }
                    <li><Checkbox name={'month'} value={index} labelText={month} bind:checked={formData.months[month]} /></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup legendText="weekday">
                <h3>Dia de la semana</h3>
                <ul>
                    {#each weekdays as day, index }
                    <li><Checkbox name='weekday' value={index} labelText={day} bind:checked={formData.days[index]}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup name="equipment" legendText="equipments">
                <h3>Equipo</h3>
                <ul>
                    {#each equipments as equip }
                    <li><Checkbox name={'equipment'} value={equip.id} labelText={equip.name} bind:checked={formData.equipments[equip?.id||'none']}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <Button type="submit" > Submit</Button>
        </Form>
        <div>
            <Button on:click={()=>createDate()}>Nuevo Alquiler</Button>

            {#each equipments as eq}
                {#if (listOfDates[eq.id||'']||[]).length}
                    <h4>{eq.name}</h4>
                    {#each (listOfDates[eq.id || '']||[]) as dates}
                        <Checkbox on:check={(e)=>{
                            if(e.detail){
                                selectedDates[eq.id||''] = selectedDates[eq.id||''] ? [...selectedDates[eq.id||''], moment(dates).format('ddd DD/MM')] : [moment(dates).format('ddd DD/MM')]
                            } else {
                                selectedDates[eq.id||''].splice(selectedDates[eq.id||''].indexOf(dates),1)
                            }
                        }} labelText={moment(dates).format('ddd DD/MM/YYYY')}></Checkbox>
                    {/each}
                {/if}
            {/each}
        </div>
    </div>
</section>



I started as a developer on 2011 when the only frontend languages were HTML CSS and JS vanilla (with Jquery) Then I moved to backbone, angular js, Angular (2˜10), reactJs, Sveltejs. I worked on many different environment, Java, nodejs (nestJs, NextJs, Sails, Strapi), Cloud (GCP), Few CMS, among other technologies

I worked with Material design and Bootstrap since the day it started getting popular like 7 years ago. From bootstrap v2 and Material v1. I've also used other css framework like foundation.

Since responsive design became business case for companies I've develop web platforms as responsive. I also use it when it was still on discussion if its better mobile first or desktop first. 