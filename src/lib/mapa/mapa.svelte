<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
import { onMount } from 'svelte';
    import type { IClient } from '../../service/clients/service';
  //let google: any = google || {};
  export let clients: IClient[] = [];

  let container:any;
  let map: any;
  let zoom:number = 11;
  let center = {lat: -32.949071, lng: -60.653126};
  let geocoder;
  let hasBeenMarked = false;
  onMount(async () => {
    geocoder = new google.maps.Geocoder()
    if(window.initMap){
      window.initMap();
    }
    map = new google.maps.Map(document.getElementById('map'), {
      zoom,
      center
    });
    
  });
  const setMarkers = (address: string, name: string)=>{
    
      if(!address) return;
      if(!geocoder) geocoder = new google.maps.Geocoder();
      geocoder?.geocode({ address })
        .then(({results}:any) => {
          let marker = new google.maps.Marker({
            map,
            title: name,
            label: name,
            position: results[0].geometry.location
          });
          
          marker.setMap(map);
          map.setCenter(marker.getPosition());
          map.setZoom(16)
        }).catch(()=>{
          alert('La direccion de este cliente arrojo un error. Revise si esta bien escrita o agrege mas detalle')
        })
    
  }
</script>

<div class="grid grid-cols-3 gap-4">
  <div class="full-screen  col-span-2" id="map"></div>
  <div class="h-80 overflow-y-auto">
    
      {#each clients.sort((a,b)=>a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) as cli, i }
      <Tile 
      on:click={()=>{
        setMarkers(cli.address, cli.name)
      }}
      class={`cursor-pointer  m-0 p-0 border-b border-orange-600 border-solid ${i===0? 'border-t' : ''}`}>
        <p>{cli.name}</p>
        <p>{cli.address}</p>
      </Tile>
      {/each}
    
  </div>
</div>
