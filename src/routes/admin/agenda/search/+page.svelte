<script lang="ts">
    import { onAuthStateChanged } from 'Firebase/auth';
    import { auth } from "../../../../service/firebase";
    import { onMount } from "svelte";
    import { getEquipments, type IEquipment } from "../../../../service/equipments/service";
    import { getRents, type IRent } from "../../../../service/rents/service";
    import moment from 'moment';
    import { Button, Checkbox, Form, FormGroup } from 'carbon-components-svelte';

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
    let filters = {};
    const weekdays = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
    const MonthsLabel = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const years = [moment().year(), moment().add(1, 'years').year()]
    let equipments: IEquipment[]=[], rents:IRent[]=[];
    let listOfDates:string[] = []
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
    const getFreeDates = (freeRents:IRent[])=>{
        const thisMonth = moment().year(year).month(month);
        const days = thisMonth.daysInMonth();
        let result:any[] = []
        for(let i=1; i<= days; i++){
            if(
                !freeRents.find(({date}) => moment(date).date() === i)
            ){
                result.push({label: thisMonth.date(i).locale('es-ES').format('ddd DD/MM'), checked: false})
            }
        }
        return result;
    }
    const getDates =(year:number, month: number, equip:string, weekday?:number)=>{
        year = year || moment().year();
        month = month || moment().month();
        let freeDates = []
        const filterMonth = moment().year(year).month(month);
        const totaldays = filterMonth.daysInMonth();
        for (let i = 1; i <= totaldays; i++){
            let isFilterd = false;
            let hasRent = 0;
            if(weekday >= 0){
                isFilterd = filterMonth.date(i).isoWeekday() === weekday;
                if(isFilterd){
                    hasRent = rents.filter(rent =>{
                        return moment(rent.date).isSame(filterMonth.date(i),'date')
                    })
                    .filter(rent =>{
                        return rent.equipment === equip
                    })
                    .length
                }
            } else {
                hasRent = rents.filter(rent =>{
                    return moment(rent.date).isSame(filterMonth.date(i),'date')
                })
                .filter(rent =>{
                    return rent.equipment === equip
                })
                .length
                
            }
            if(!hasRent){
                freeDates.push(filterMonth.date(i).toString())
            }
        }
        return freeDates;
    }
</script>
<section class="m-4">
    <div class="grid grid-cols-4">
        <Form on:submit={()=>{
            console.log('FORM SUBMIT', formData)
            for(let key in formData){
                for(let key2 in formData[key]){
                    if(formData[key][key2]){
                        console.log(key, key2)
                    };
                }
            }
            listOfDates = getDates(2023,4, '222')
            
        }}>
            <FormGroup  legendText="year">
                <h3>Año</h3>
                <ul>
                    {#each years as year }
                    <li><Checkbox value={year} labelText={`${year}`} bind:checked={formData.years[`year-${year}`]}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup legendText="months">
                <h3>Mes</h3>
                <ul>
                    {#each MonthsLabel as month, index }
                    <li><Checkbox value={index} labelText={month} bind:checked={formData.months[month]} /></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup legendText="weekday">
                <h3>Dia de la semana</h3>
                <ul>
                    {#each weekdays as day, index }
                    <li><Checkbox value={index} labelText={day} bind:checked={formData.days[index]}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <FormGroup name="equipment" legendText="equipments">
                <h3>Equipo</h3>
                <ul>
                    {#each equipments as equip }
                    <li><Checkbox value={equip.id} labelText={equip.name} bind:checked={formData.equipments[equip?.id||'none']}/></li>
                    {/each}
                </ul>
            </FormGroup>
            <Button type="submit" > Submit</Button>
        </Form>
        <div>
            {#each listOfDates as dates}
                <p>{moment(dates).format('ddd DD/MM/YYYY')}</p>
            {/each}
        </div>
    </div>
</section>