<script lang="ts">
    import 'carbon-components-svelte/css/white.css';
    import { onAuthStateChanged } from 'Firebase/auth';
    import { onMount } from 'svelte';
    import { signOut } from 'Firebase/auth';
	import { Header, HeaderNavMenu, SideNav, SideNavDivider, SideNavItems, SideNavLink } from 'carbon-components-svelte';
    import { auth } from '../service/firebase';
	import { session, userRole } from "../service/stores";
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Calendar, ChartPie, Dashboard, Login, Logout, Money, Person, Ticket, User, VirtualMachine } from 'carbon-icons-svelte';
    import { getUser } from '../service/users/service';
    
    onMount(() => {
        onAuthStateChanged(
            auth,
            async (user) => {
				session.set({ user })
                const profile = await getUser(user.uid);
                userRole.set(profile)
			},
            () => session.set({ user: null })
        );
    });

    let isSideNavOpen = false ;

	async function logOut() {
        await signOut(auth);
        localStorage.removeItem('user')
        localStorage.removeItem('UserRole')
        await goto('/');
    }
    const setLink = (link:string)=>{
        return {href:link, isSelected: $page.route && $page.route?.id?.includes(link)}
    }
    $: $page.route.id
</script>


<Header bind:isSideNavOpen >
    <svelte:fragment slot="platform">
        <img class="h-3/4" src="/images/logo-no-background.png" alt="" srcset="">
    </svelte:fragment>
</Header>
  <SideNav bind:isOpen={isSideNavOpen} rail>
    <SideNavItems>
    {#if $session.user}
        {#key $page.route.id}
        <SideNavLink icon={Dashboard} text="Inicio" {...setLink('/admin/dashboard')}/>
        <SideNavLink icon={Calendar} text="Agenda"  {...setLink("/admin/agenda")}/>
        <SideNavLink icon={Ticket} text="Gastos"  {...setLink("/admin/expenses")}/>
        <SideNavLink icon={Person} text="Clientes"  {...setLink("/admin/clients")}/>
        {#if $userRole.role === 'ADMIN'}
        <SideNavLink icon={VirtualMachine} text="Equipos"  {...setLink("/admin/equipments")}/>
        <HeaderNavMenu text="Administracion">
            <SideNavLink icon={ChartPie} text="Metricas"  {...setLink("/admin/metrics")}/>
            <SideNavLink icon={Money} text="Contabilidad"  {...setLink("/admin/accountable")}/>
            <SideNavLink icon={User} text="Usuarios"  {...setLink("/admin/users")}/>
        </HeaderNavMenu>
        {/if}
        {/key}
        <SideNavDivider />
    {/if}

	{#if $session.user}
        <SideNavLink icon={Logout} kind="secondary" text="Salir" on:click={()=>{
            logOut();
            isSideNavOpen = false
        }} />
        {:else}
        <SideNavLink icon={Login} text="Ingresar" href="/auth/login"/>
    {/if}
    </SideNavItems>
  </SideNav>