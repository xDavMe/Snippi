<script>

  import persoFront from './assets/image.png';
  import persoBack from './assets/perso_back.png';
  import { onMount } from 'svelte';
  import html2canvas from 'html2canvas';
  import Tesseract from 'tesseract.js';



  let snipping = false;
  let startX, startY, endX, endY;
  let selection = null;
  let imageUrl = '';
  let ocrText = '';

  $: if (imageUrl) {
    // Run OCR when imageUrl changes
    readTextFromImage(imageUrl).then(text => {
      ocrText = text;
      console.log('OCR Result:', text);
    });
  }


  async function readTextFromImage(imageUrl) {
  const result = await Tesseract.recognize(
    imageUrl,
    'eng', // or 'deu' for German, etc.
    { logger: m => console.log(m) }
    );
    return result.data.text;
  }



  function startSnipping() {
    snipping = true;
    selection = null;
    imageUrl = '';
  }

  function onMouseDown(e) {
    if (!snipping) return;
    startX = e.clientX;
    startY = e.clientY;
    selection = { left: startX, top: startY, width: 0, height: 0 };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    endX = e.clientX;
    endY = e.clientY;
    selection = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };
  }

  async function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    snipping = false;
    // Capture the selected area
    const body = document.body;
    const canvas = await html2canvas(body);
    const ctx = canvas.getContext('2d');
    const { left, top, width, height } = selection;
    const cropped = document.createElement('canvas');
    cropped.width = width;
    cropped.height = height;
    cropped.getContext('2d').drawImage(canvas, left, top, width, height, 0, 0, width, height);
    imageUrl = cropped.toDataURL();
  }





  let started = false;

  function startExperiment() {
    started = true;
  }
</script>





<main>
  {#if !started}
    <div class="introduction-box">
      <h2>Daniel Pls help ich kann das alles nicht mehr!!!!</h2>
      <p>
        Welcome! This is where the introduction to your experiment will appear.
      </p>
    </div>
    <button class="start-btn" on:click={startExperiment}>
      Start
    </button>
  {:else}





    <!-- Snipping Tool -->
    <button on:click={startSnipping}>Snip Area</button>

    {#if snipping}
      <div
        class="snip-overlay"
        role="presentation"
        on:mousedown={onMouseDown}
        style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1000;cursor:crosshair;">
        {#if selection}
          <div
            class="snip-selection"
            style="position:absolute;border:2px dashed #2196f3;pointer-events:none;
            left:{selection.left}px;top:{selection.top}px;width:{selection.width}px;height:{selection.height}px;">
          </div>
        {/if}
      </div>
    {/if}

    {#if imageUrl}
      <div>
        <h3>Snipped Image:</h3>
        <img src={imageUrl} alt="Snipped area" />
        <h4>OCR Result:</h4>
        <pre>{ocrText}</pre>
      </div>
    {/if}
    <div class="experiment-page">

      <div class="image-sidebar">
        <img src={persoFront} alt="Person front view" />
        <img src={persoBack} alt="Placeholder 2" />
      </div>

      <div class="experiment-content">

        <div class="form-group">
          <label for="field1">Name</label>
          <input id="field1" type="text" />
        </div>

        <div class="form-group">
          <label for="field2">Vorname</label>
          <input id="field2" type="text" />
        </div>

        <div class="form-group">
          <label for="field3">Geburtstag</label>
          <input id="field3" type="text" />
        </div>

        <div class="form-group">
          <label for="field4">Geburtsort</label>
          <input id="field4" type="text" />
        </div>

      </div>
    </div>

    
  {/if}
</main>


<style>
/* .image-sidebar {
    display: flex;
    flex-direction: column;
    align-items:  center;
    justify-content: flex-start;
    width: 300px;
    padding: 1rem;
    gap: 1rem;
    box-shadow: 2px 0 8px rgba(0,0,0,0.03);
  } */
  /* .experiment-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem;
    gap: 1.5rem;
  }*/

  .snip-overlay {
  background: rgba(0,0,0,0.05);
  }
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    max-width: 300px;
  }
    
  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  .form-group input {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  } 

  .experiment-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }

</style>