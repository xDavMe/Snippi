<script>

  import persoFront from './assets/perso_front.png';
  import persoBack from './assets/perso_back.png';
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