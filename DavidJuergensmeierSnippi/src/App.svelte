<script>
  let started = false;

  function startExperiment() {
    started = true;
  }
</script>

<main>
  <div class="introduction-box">
    <h2>Introduction</h2>
    <p>
      {'Hallo'}
      Welcome! This is where the introduction to your experiment will appear.
    </p>
  </div>

  <button class="start-btn" on:click={startExperiment} disabled={started}>
    {started ? "Experiment Started" : "Start"}
  </button>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #fafafa;
  }
  .introduction-box {
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    width: 350px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    text-align: center;
  }
  .start-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 6px;
    border: none;
    background: #646cff;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }
  .start-btn:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
</style>