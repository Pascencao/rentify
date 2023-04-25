<script>
    import { Form, TextInput, PasswordInput, Button } from 'carbon-components-svelte';
    import { createEventDispatcher } from "svelte"
    let dispatch = createEventDispatcher()
    let email='', password='';

    function signup() {
        dispatch("login", {
            email,
            password
        })
    }
</script>


<Form class="w-full">
    <TextInput 
        class="w-full"
        bind:value={email} 
        labelText="Email address" 
        placeholder="Enter your email" 
        type="email" 
        name="email" />
    <div class="space" />
    <PasswordInput
        bind:value={password}
        tooltipAlignment="start"
        tooltipPosition="left"
        labelText="Password"
        placeholder="Enter password"
        name="password"
    />
    <div class="mt-4 flex justify-end" >
        <Button size="small" on:click={signup}>Ingresar</Button>
    </div>
</Form>