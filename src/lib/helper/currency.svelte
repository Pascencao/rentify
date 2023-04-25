<script lang="ts">
    export let amount: number = 0;
    export let styles:string = '';
    
    const money = new Intl.NumberFormat('en-US',{
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    })
</script>
<span class={styles}>
    {money.format(amount)}
</span>