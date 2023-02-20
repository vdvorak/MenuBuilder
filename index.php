<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <script defer src="editor.js"></script>
    <title>Menu</title>
  </head>
  <body>
    <main
      style="
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
      "
    >
      <div class="controlls">
        <div class="controlls-conteiner">
          <button onclick="restoreFromBackup()">Obnovit ze zálohy</button>
          <select id="backup"></select>

          <div id="publish">
            <a href="#" download="menu" class="block" id="export-json"
              >Export</a
            >
            <a href="#" download="menu" class="block" id="export-txt">Txt</a>
            <button onclick="createPDF()" class="block" id="export-pdf">
              PDF
            </button>
          </div>
          <div></div>

          <div>
            <label for="import">import</label>
            <input id="import" type="file" accept="application/json" />
          </div>
          <button onclick="addPage('')">Přidat stránku</button>
        </div>
      </div>

      <div id="content"></div>
      <div style="margin: 4rem">
        <div>
          <span>Hromadná úprava ceny</span>
          <select id="global-price-id">
            "<option disabled selected value>Nezvoleno</option>"
            <?php 
              for($i =1; $i <= 7; ++$i) {
                echo "<option value='$i'>$i</option>";
              }
            ?>
            <option value="D">D</option>
            <option value="De">De</option>
            <option value="Sa">Sa</option>
          </select>
          <input type="text" id="global-price" placeholder="Cena" />
          <button onclick="setGlobalPrice()">Použít</button>
        </div>
      </div>
    </main>
  </body>
</html>
