<!-- 
ZU BEGINN: Das Design was ich im 7. Assignment vorgeschlagen stimmt nicht zu 100% mit dem Implementierten überein, da ich es nicht geschafft habe es so zu implementieren.


CSV-Layout:
ParticipantID,Trial,Technique,Time,Error
zufällige ID, Trial = {1,2,3}, Technique = {Manual, Snip}, Time in seconds, Anzahl der Fehler
unabhängige Variablen: ParticipantID, Trial, Technique
abhängige Variablen: Time, Error
-->

<script>
  import Tesseract from 'tesseract.js';
  import MustermannPersoVorne from './assets/vorneMUSTERMANN.png';
  import MustermannPersoHinten from './assets/hintenMUSTERMANN.png';
  import ParkerPersoVorne from './assets/vornePARKER.png';
  import ParkerPersoHinten from './assets/hintenPARKER.png';
  import BubelwutzPersoVorne from './assets/vorneBUBELWUTZ.png';
  import BubelwutzPersoHinten from './assets/hintenBUBELWUTZ.png';

  let participantId = Math.random().toString(36).substring(2, 10).toUpperCase();

  let snipping = false;
  let startX = 0, startY = 0, endX = 0, endY = 0;
  let selection = null;
  let imageUrl = '';
  let started = false;
  let ocrText = '';
  let uploadedFront = '';
  let uploadedBack = '';
  let imageRect = null; // Store bounding rect
  let scaleX = 1, scaleY = 1;
  let lastSnipImg = null;
  let activeField = null;
  let vorname = '';
  let nachname = '';

  let experimentStep = 1; // 1 = manual, 2 = snip

  let manualStartTime = null;
  let manualEndTime = null;
  let manualDuration = null;
  let manualData = {};
  let manualMistakes = {};

  let snipStartTime = null;
  let snipEndTime = null;
  let snipDuration = null;
  let snipData = {};
  let snipMistakes = {};
  let snipFinished = false;


  // Correct data for comparison
  let correctDataMUSTERMANN = {
    nachname: 'Mustermann',
    vorname: 'Erika',
    geburtsdatum: '12.08.1964',
    geburtsort: 'Berlin',
    staatsangehoerigkeit: 'deutsch',
    adresse: 'Heidestrasse',
    hausnummer: '17',
    plz: '51147',
    ort: 'Köln'
  }; 

  let correctDataBUBELWUTZ = {
    nachname: 'Bubelwutz',
    vorname: 'Bubi',
    geburtsdatum: '15.12.2026',
    geburtsort: 'Zülpich',
    staatsangehoerigkeit: 'deutsch',
    adresse: 'Rattenfängerstr.',
    hausnummer: '69',
    plz: '37882',
    ort: 'Hameln'
  }; 

    let correctDataPARKER = {
    nachname: 'Parker',
    vorname: 'Peter',
    geburtsdatum: '10.08.1995',
    geburtsort: 'Burlin',
    staatsangehoerigkeit: 'deutsch',
    adresse: 'Baumstrasse',
    hausnummer: '18',
    plz: '30167',
    ort: 'Hannover'
  }; 


  let rounds = [
    {
      name: 'MUSTERMANN',
      front: MustermannPersoVorne,
      back: MustermannPersoHinten,
      correctData: correctDataMUSTERMANN
    },
    {
      name: 'BUBELWUTZ',
      front: BubelwutzPersoVorne,
      back: BubelwutzPersoHinten,
      correctData: correctDataBUBELWUTZ
    },
    {
      name: 'PARKER',
      front: ParkerPersoVorne,
      back: ParkerPersoHinten,
      correctData: correctDataPARKER
    }
  ];

  let currentRound = 0;
  let allResults = [];

  // Update correctData to be reactive to the round
  $: correctData = rounds[currentRound].correctData;

  // Add a reactive variable for categorized OCR fields
  let categorized = {
    nachname: '',
    vorname: '',
    geburtsdatum: '',
    geburtsort: '',
    staatsangehoerigkeit: '',
    adresse: '',
    plz: '',
    ort: '',
    hausnummer: ''
  };



  function generateCSV() {
    let csv = 'ParticipantID,Trial,Technique,Time,Error\n';
    allResults.forEach((result, i) => {
      // Manual entry
      csv += `${participantId},${i+1},Manual,${result.manualDuration},${Object.keys(result.manualMistakes).length}\n`;
      // Snip entry
      csv += `${participantId},${i+1},Snip,${result.snipDuration},${Object.keys(result.snipMistakes).length}\n`;
    });
    return csv;
  }

  function download(vorname, nachname, text) {
      const filename = `${vorname}${nachname}Snippi.csv`;
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      pom.setAttribute('download', filename);

      if (document.createEvent) {
          var event = document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          pom.dispatchEvent(event);
      }
      else {
          pom.click();
      }
  }

  function startManualRound() {
    started = true;
    experimentStep = 1;
    manualStartTime = Date.now();
    Object.keys(categorized).forEach(k => categorized[k] = '');
    uploadedFront = rounds[currentRound].front;
    uploadedBack = rounds[currentRound].back;
  }


  function finishManualRound() {
    manualEndTime = Date.now();
    manualDuration = (manualEndTime - manualStartTime) / 1000; // seconds
    manualData = { ...categorized };
    console.log('Manual data:', manualData);
    manualMistakes = {};

    // Compare each field
    Object.keys(correctData).forEach(key => {
      if ((manualData[key] || '').trim().toLowerCase() !== (correctData[key] || '').trim().toLowerCase()) {
        manualMistakes[key] = {
          entered: manualData[key],
          correct: correctData[key]
        };
      }
    });

    experimentStep = 2; // move to snip round
    snipStartTime = Date.now();
    snipFinished = false;

    Object.keys(categorized).forEach(k => categorized[k] = '');
  }

  function finishSnipRound() {
    snipEndTime = Date.now();
    snipDuration = (snipEndTime - snipStartTime) / 1000;
    snipData = { ...categorized };
    snipMistakes = {};

    Object.keys(correctData).forEach(key => {
      if ((snipData[key] || '').trim().toLowerCase() !== (correctData[key] || '').trim().toLowerCase()) {
        snipMistakes[key] = {
          entered: snipData[key],
          correct: correctData[key]
        };
      }
    });

    snipFinished = true;

    // Store results for this round
    allResults.push({
      round: rounds[currentRound].name,
      manualData,
      manualMistakes,
      manualDuration,
      snipData,
      snipMistakes,
      snipDuration
    });
    Object.keys(categorized).forEach(k => categorized[k] = '');
  }

  function nextRound() {
    if (currentRound < rounds.length - 1) {
      currentRound += 1;
      snipFinished = false;
      experimentStep = 1;
      Object.keys(categorized).forEach(k => categorized[k] = '');
      manualData = {};
      manualMistakes = {};
      snipData = {};
      snipMistakes = {};
      manualDuration = null;
      snipDuration = null;

      uploadedFront = rounds[currentRound].front;
      uploadedBack = rounds[currentRound].back;
      manualStartTime = Date.now();
    }
  }


  function capitalizeIfAllCaps(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function handleFileChange(event, side) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target.result === 'string') {
          if (side === 'front') uploadedFront = e.target.result;
          if (side === 'back') uploadedBack = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function getImageDrawRect(img) {
    const rect = img.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = containerWidth / containerHeight;

    let drawWidth, drawHeight, offsetX, offsetY;
    if (imgAspect > containerAspect) {
      // Image is wider than container
      drawWidth = containerWidth;
      drawHeight = containerWidth / imgAspect;
      offsetX = 0;
      offsetY = (containerHeight - drawHeight) / 2;
    } else {
      // Image is taller than container
      drawHeight = containerHeight;
      drawWidth = containerHeight * imgAspect;
      offsetX = (containerWidth - drawWidth) / 2;
      offsetY = 0;
    }
    return { left: rect.left + offsetX, top: rect.top + offsetY, width: drawWidth, height: drawHeight };  
  }

  function startSnipping() {
    snipping = true;
    selection = null;
    window.addEventListener('keydown', onSnipKeydown);
  }

  function stopSnipping() {
    snipping = false;
    window.removeEventListener('keydown', onSnipKeydown);
  }

  function onSnipKeydown(e) {
    if (e.key === 'Escape') {
      stopSnipping();
    }
  }

  function onMouseDown(e) {
    if (!snipping) return;
    let img;
    if (lastSnipImg === 'front') {
      img = document.querySelector('.image-sidebar img[alt="Hochgeladene Vorderseite"]');
    } else if (lastSnipImg === 'back') {
      img = document.querySelector('.image-sidebar img[alt="Hochgeladene Rückseite"]');
    } else {
      img = document.querySelector('.image-sidebar img');
    }
    if (!img) return;
    imageRect = getImageDrawRect(img);
    const tempImage = new window.Image();
    tempImage.src = img.src;
    tempImage.onload = () => {
      scaleX = tempImage.naturalWidth / imageRect.width;
      scaleY = tempImage.naturalHeight / imageRect.height;
    };
    startX = e.pageX;
    startY = e.pageY;
    selection = { left: startX, top: startY, width: 0, height: 0 };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    endX = e.pageX;
    endY = e.pageY;
    selection = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };
  }

  function parseAnschrift(ocrText) {
    console.log('Parsing OCR text:', ocrText);
    let adresse = '', plz = '', ort = '', hausnummer = '';

    // Try to split lines
    const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
    console.log('lines:', lines);
    if (lines[0]) {
      const splittedcitydetails = lines[0].split(' ');
      plz = splittedcitydetails[0]; 
      ort = splittedcitydetails[1]; 
    }
    if (lines[1]) {
      let splittedstreet = lines[1].split(' ');
      if (splittedstreet.length > 2) {
        console.log(' splittedstreet:', splittedstreet);
        if(splittedstreet[1] == "STR." || splittedstreet[1] == "STR," || splittedstreet[1] == "STR") {
        console.log('ich komme hier rein');
        splittedstreet = [splittedstreet[0] + splittedstreet[1], splittedstreet[2]];
        }
      }
      console.log('splittedstreet:', splittedstreet);
      adresse = capitalizeIfAllCaps(splittedstreet[0].replace(/,/g, '.'));
      hausnummer = splittedstreet[1].replace(/\D/g, '');
    }


    console.log('Parsed Anschrift:', { adresse, plz, ort, hausnummer });
    return { adresse, plz, ort, hausnummer };
  }

  async function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    stopSnipping();``

    let img;
    if (lastSnipImg === 'front') {
      img = document.querySelector('.image-sidebar img[alt="Hochgeladene Vorderseite"]');
    } else if (lastSnipImg === 'back') {
      img = document.querySelector('.image-sidebar img[alt="Hochgeladene Rückseite"]');
    } else {
      img = document.querySelector('.image-sidebar img');
    }
    if (!img || !selection || !imageRect) return;

    if (!scaleX || !scaleY) {
      const tempImage = new window.Image();
      tempImage.src = img.src;
      await new Promise(res => tempImage.onload = res);
      scaleX = tempImage.naturalWidth / imageRect.width;
      scaleY = tempImage.naturalHeight / imageRect.height;
    }

    const sx = (selection.left - imageRect.left) * scaleX;
    const sy = (selection.top - imageRect.top) * scaleY;
    const sw = selection.width * scaleX;
    const sh = selection.height * scaleY;

    const tempImage = new window.Image();
    tempImage.src = img.src;
    await new Promise(res => tempImage.onload = res);

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tempImage, sx, sy, sw, sh, 0, 0, sw, sh);

    imageUrl = canvas.toDataURL();

    const result = await Tesseract.recognize(canvas, 'deu', {
      logger: m => console.log(m)
    });
    ocrText = result.data.text;


    if (activeField === 'anschrift') {
      const parsed = parseAnschrift(ocrText);
      categorized.adresse = capitalizeIfAllCaps(parsed.adresse);
      categorized.plz = parsed.plz;
      categorized.ort = capitalizeIfAllCaps(parsed.ort);
      categorized.hausnummer = parsed.hausnummer;
      activeField = null;
    } else if (activeField) {
      categorized[activeField] = capitalizeIfAllCaps(ocrText);
      if(activeField === 'staatsangehoerigkeit') {
        categorized.staatsangehoerigkeit = categorized.staatsangehoerigkeit.toLowerCase();
      }
      activeField = null;
    }
  }
</script>

<main>
{#if !started}
  <div class="intro-upload-page">

    <div class="intro-section">
      <div class="intro-box">
        <h2>Willkommen zum Snippi-Tool</h2>
        <p>
          Dieses Tool hilft dir, Daten von deinem Personalausweis einfach per Bildausschnitt und Texterkennung zu übernehmen.<br>
          Dafür einfach neben dem gewüschten Feld auf "Snip" klicken, den Bereich auswählen und das Ergebnis wird automatisch übernommen.<br>
          In den ersten Durchgängen des Experiments wirst du zunächst die Daten Manuell eingeben - in den zweiten Runden soll das Tool verwendet werden, um die Daten zu extrahieren.<br>
          <br>
          WICHTIG: 
          <br>
          Achte auf die richtige Groß- und Kleinschreibung!<br>
          Beispiel: Vorname: Benjamin, Adresse: Baumstrasse, Staatsangehörigkeit: deutsch, ... <br>
          Bei der Anschrift sollte der gesamte Bereich ausgewählt werden, das Tool erkennt automatisch Straße, Hausnummer, PLZ und Ort.<br>
          Bei einer Adresse wie: KÖNIGSWORTHER STR. lautet die korrekte Eingabe: Königswortherstr.<br>
          Nach der Benutzung des Tools können die Daten nochmal manuell angepasst werden, falls etwas nicht korrekt erkannt wurde.<br>
          <br>
          Da manche Ausweisbilder KI-generiert sind, kann es sein, dass diese von echten Ausweisen abweichen.<br>
          Außerdem kann es sein, dass unrealistische Daten enthalten sind, wie z.B. ein Geburtsdatum in der Zukunft oder nicht eine nichtexistierende Stadt.<br>
          Falls die Kategoriebezeichnung nicht vorhanden ist, sollte aus dem Kontext klar sein, welches Feld gemeint ist.<br>
          <br>
          Bitte öffne den Browser in der normalen Größe und öffne nicht die Konsole, da sonst die Snipping-Funktion nicht richtig funktioniert.<br>
          Beim Drücken des Start-Buttons geht es direkt los!<br>
        </p>
      </div>
    </div>


    <div class="upload-section">
      <div style="margin-bottom: 1rem;">
        <label>
          Vorname:
          <input type="text" bind:value={vorname} required />
        </label>
      </div>
      <div style="margin-bottom: 1rem;">
        <label>
          Nachname:
          <input type="text" bind:value={nachname} required />
        </label>
      </div>
      <div style="margin-bottom: 1rem;">
        <button type="button" on:click={() => {
          uploadedFront = BubelwutzPersoVorne;
          uploadedBack = BubelwutzPersoHinten;
        }}>
          Ich habe den Text gelesen
        </button>
      <!-- <h2>oder</h2> 
      <h2>Perso-Bilder hochladen</h2> 
    </div>
      <div>
        <label>Vorderseite hochladen:
          <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, 'front')} />
        </label>
        {#if uploadedFront}
          <img
            src={uploadedFront}
            alt="Hochgeladene Vorderseite"
            style="max-width:220px;margin-top:0.5rem;border-radius:6px;border:1px solid #ccc;"
          />
        {/if}
      </div>
      <div style="margin-top:1rem;">
        <label>Rückseite hochladen:
          <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, 'back')} />
        </label>
        {#if uploadedBack}
          <img
            src={uploadedBack}
            alt="Hochgeladene Rückseite"
            style="max-width:220px;margin-top:0.5rem;border-radius:6px;border:1px solid #ccc;"
          />
        {/if} -->
      </div> 
      <button class="start-btn" style="margin-top:2rem;" on:click={startManualRound} disabled={!uploadedFront || !uploadedBack || !vorname.trim() || !nachname.trim()}>
        Experiment starten
      </button>
    </div>
  </div>
  {:else}
    {#if snipping}
      <div
        class="snip-overlay"
        role="presentation"
        on:mousedown={onMouseDown}
        style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1000;cursor:crosshair;"
      >
        {#if selection}
          <div
            class="snip-selection"
            style="position:absolute;border:2px dashed #2196f3;pointer-events:none;
                  left:{selection.left}px;top:{selection.top}px;width:{selection.width}px;height:{selection.height}px;">
          </div>
        {/if}
      </div>
    {/if}
    {#if !snipFinished}
      <div class="experiment-page">
        <div class="image-sidebar">
          <div>
            <!-- <label>Vorderseite hochladen:
              <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, 'front')} />
            </label> -->
            {#if uploadedFront}
              <img
                src={uploadedFront}
                alt="Hochgeladene Vorderseite"
                class:selected={lastSnipImg === 'front'}
                style="cursor:pointer;"
              />
            {/if}
          </div>
          <div>
            <!-- <label>Rückseite hochladen:
              <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, 'back')} />
            </label> -->
            {#if uploadedBack}
              <img
                src={uploadedBack}
                alt="Hochgeladene Rückseite"
                class:selected={lastSnipImg === 'back'}
                style="cursor:pointer;"
                />
            {/if}
          </div>
        </div>

        <div class="experiment-content">
          
          <div class="data-left">
            <div class="form-group">
              <label for="field1">Name</label>
              <input id="field1" type="text" bind:value={categorized.nachname}/>
              {#if experimentStep === 2} 
                <button type="button" on:click={() => { activeField = 'nachname'; lastSnipImg = 'front'; startSnipping(); }}>Snip Name</button>
              {/if}
            </div>
            <div class="form-group">
              <label for="field2">Vorname</label>
              <input id="field2" type="text" bind:value={categorized.vorname}/>
              {#if experimentStep === 2} 
              <button type="button" on:click={() => { activeField = 'vorname'; lastSnipImg = 'front';startSnipping(); }}>Snip Vorname</button>
              {/if}
            </div>
            <div class="form-group">
              <label for="field3">Geburtstag</label>
              <input id="field3" type="text" bind:value={categorized.geburtsdatum}/>
              {#if experimentStep === 2} 
              <button type="button" on:click={() => { activeField = 'geburtsdatum'; lastSnipImg = 'front';startSnipping(); }}>Snip Geburtsdatum</button>
              {/if}
            </div>
            <div class="form-group">
              <label for="field4">Geburtsort</label>
              <input id="field4" type="text" bind:value={categorized.geburtsort}/>
              {#if experimentStep === 2} 
              <button type="button" on:click={() => { activeField = 'geburtsort'; lastSnipImg = 'front'; startSnipping(); }}>Snip Geburtsort</button>
              {/if}
            </div>
            <div class="form-group">
              <label for="field5">Staatsangehörigkeit</label>
              <input id="field5" type="text" bind:value={categorized.staatsangehoerigkeit}/>
              {#if experimentStep === 2} 
              <button type="button" on:click={() => { activeField = 'staatsangehoerigkeit'; lastSnipImg = 'front'; startSnipping(); }}>Snip Staatsangehörigkeit</button>
              {/if}
            </div>
          </div>

          <div class="data-right">

            <div class="anschrift-fields">
              <div class="anschrift-row">
                <div class="anschrift-group">
                  <label for="adresse">Adresse</label>
                  <input id="adresse" type="text" bind:value={categorized.adresse} />
                </div>
                <div class="anschrift-group">
                  <label for="hausnummer">Hausnummer</label>
                  <input id="hausnummer" type="text" bind:value={categorized.hausnummer} />
                </div>
                <div class="anschrift-group">
                  <label for="plz">PLZ</label>
                  <input id="plz" type="text" bind:value={categorized.plz} />
                </div>
                <div class="anschrift-group">
                  <label for="ort">Ort</label>
                  <input id="ort" type="text" bind:value={categorized.ort} />
                </div>
              </div>
            </div>
            {#if experimentStep === 2} 
            <button type="button" on:click={() => { activeField = 'anschrift'; lastSnipImg = 'back'; startSnipping(); }}>
                Snip Anschrift
            </button>
            {/if}

            {#if experimentStep === 1}
              <button on:click={finishManualRound}>Fertig</button>
            {/if}
            {#if experimentStep === 2 && !snipFinished}
              <button on:click={finishSnipRound}>Fertig (Snip-Runde)</button>
            {/if}
          </div>
        </div>
      </div>
    {/if}  
  {/if}



  <!-- {#if selection}
    <div class="debug-window">
      <strong>Letzte Auswahl:</strong>
      <div>Links: {selection.left}px</div>
      <div>Oben: {selection.top}px</div>
      <div>Breite: {selection.width}px</div>
      <div>Höhe: {selection.height}px</div>
      <div>ObenUntenSelect: {lastSnipImg}</div>
      {#if imageUrl}
        <div style="margin-top:1rem;">
          <img src={imageUrl} alt="Ausgewählter Bereich" style="max-width:300px;max-height:200px;border:1px solid #fff;border-radius:4px;" />
        </div>
      {/if}
    </div>
  {/if} -->

{#if snipFinished}
  <div class="results">
    <h3>Ergebnisse für {rounds[currentRound].name}</h3>
    <h4>Manuelle Eingabe</h4>
    <ul>
      {#each Object.keys(manualData) as key}
        <li>
          <strong>{key}:</strong> {manualData[key]}
          {#if manualMistakes[key]}
            <span style="color: red;">(Fehler, korrekt: {manualMistakes[key].correct})</span>
          {/if}
        </li>
      {/each}
    </ul>
    <div>Dauer (manuell): {manualDuration ? manualDuration.toFixed(2) : '-'} Sekunden</div>

    <h4>Snip-Eingabe</h4>
    <ul>
      {#each Object.keys(snipData) as key}
        <li>
          <strong>{key}:</strong> {snipData[key]}
          {#if snipMistakes[key]}
            <span style="color: red;">(Fehler, korrekt: {snipMistakes[key].correct})</span>
          {/if}
        </li>
      {/each}
    </ul>
    <div>Dauer (Snip): {snipDuration ? snipDuration.toFixed(2) : '-'} Sekunden</div>

    {#if currentRound < rounds.length - 1}
      <button on:click={nextRound}>Nächste Runde</button>
    {:else}
      <h3>Alle Runden abgeschlossen!</h3>
      <button on:click={() => download(vorname, nachname, generateCSV())}>
        Download CSV
      </button>
    {/if}
  </div>
{/if}

</main>

<style>
@import './style.css';
</style>