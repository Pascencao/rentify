<script lang="ts">
// @ts-nocheck

    import SignIn from "$lib/auth/sign_in.svelte";
    import { signInWithEmailAndPassword } from "Firebase/auth";
    import { auth } from "../../../service/firebase";
    import { goto } from "$app/navigation";
    import { Tile, ToastNotification } from "carbon-components-svelte";
    import { getUser, setLogin, setNewUser, userExist } from "../../../service/users/service";
    
    let errorMsg = '';
    async function signIn(event) {
        try {
            const {user} = await signInWithEmailAndPassword(auth, event.detail?.email, event?.detail?.password)
            const exist = await userExist(user.uid);
            if(exist) {
                await setLogin(user.uid);
            } else {
                await setNewUser(user.uid, user.email);
            }
            localStorage.setItem('UserRole', JSON.stringify(await getUser(user.uid)))
            await goto("/admin/dashboard")
        } catch (error) {
            errorMsg = 'Nombre de usuario o contraseña incorrecto'
        }
    }
    $: errorMsg;
</script>
<svelte:head>
	<title>Rentify | Login</title>
</svelte:head>
<div class="w-full px-8 sm:w-1/2 my-8 mx-auto">
    <Tile>
        <div class="header">
            <h4>Login</h4>
        </div>
        <div class="signin-form">
            <SignIn on:login={signIn}/>
        </div>
    </Tile>
    {#if errorMsg}
        <ToastNotification
            class="!w-full"
            on:close={()=>errorMsg = ''}
            title="Error"
            subtitle={errorMsg}
            timeout={5000}/>
    {/if}
</div>