<script>
// @ts-nocheck
	import './styles.css';
	import "carbon-components-svelte/css/all.css";
    import { Theme } from 'carbon-components-svelte';
	import Header from '../lib/Header.svelte';
    import { onAuthStateChanged, signOut } from 'Firebase/auth';
    import { auth } from "../service/firebase";
	import { page } from '$app/stores';

	let theme = 'g90';
	
    import { onMount } from 'svelte';
	onMount(()=>{
        onAuthStateChanged(
            auth,
            () => {},
            async () =>  await signOut(auth)
        );
	})
</script>
<Theme bind:theme persist />
<div class={`app h-full ${$page.route?.id?.includes('admin') ? 'bg-white' : ''}`}>
	<Header />
	<main class=" ml-12 mt-12 pt-4 mr-auto overflow-scroll sm:w-auto h-full">
		<slot />
	</main>
</div>
