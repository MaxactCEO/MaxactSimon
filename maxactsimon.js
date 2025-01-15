        // Laddar Google Charts
        google.charts.load('current', {
          'packages':['corechart']
      });

      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
          var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1Uj6zHJDj8G3qEFwAR830AX63SpzJWaeGIDtUMo14XWA/gviz/tq?sheet=Pearson%20korrelation');
          query.send(handleQueryResponse);
      }

      function handleQueryResponse(response) {
          if (response.isError()) {
              console.log('Error: ' + response.getMessage() + ' ' + response.getDetailedMessage());
              return;
          }

          var data = response.getDataTable();
          var options = {
              title: 'Exempelgraf',
              height: 300
          };

          var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
          chart.draw(data, options);
      }

      // Repost funktionalitet
      
      let recentHabits = JSON.parse(localStorage.getItem('recentHabits')) || []; // Ladda från localStorage
      let isDropdownVisible = false; // För att spåra visibilitet av rullgardinsmenyn

      function saveHabitsToLocalStorage() {
          localStorage.setItem('recentHabits', JSON.stringify(recentHabits));
      }

      function renderRecentHabits() {
          const container = document.getElementById("repostContainer");
          container.innerHTML = "";

          recentHabits.reverse().forEach((habit, index) => {
              const repostDiv = document.createElement("div");
              repostDiv.className = "repost";

              // Skapa innehållsdelen
              const contentDiv = document.createElement("div");
              contentDiv.className = "repost-content";

              // Titel (Kategori och huvudinfo)
              const titleDiv = document.createElement("div");
              titleDiv.className = "repost-title";
              titleDiv.textContent = `${habit.Kategori}`;

              // Detaljer (varierar beroende på kategori)
              const detailsDiv = document.createElement("div");
              detailsDiv.className = "repost-details";

              // Anpassa detaljerna baserat på kategori
              let details = '';
              switch (habit.Kategori) {
                  case "Dryck":
                      details = `${habit["Vilken Dryck"]} - ${habit["Antal Drycker"]}st, ${habit["Milliliter/st"]}ml`;
                      break;
                  case "Kost":
                      details = `${habit["Typ av måltid"]} - ${habit["Måltid"]}, ${habit["Antal Portioner"]} portioner, ${habit.Kalorier} kcal`;
                      break;
                  case "Träning":
                      details = `${habit["Kropps Område"]} - ${habit["Varaktighet totalt"]}min, ${habit.Reps} reps, ${habit.Sets} sets`;
                      break;
                  case "Fotbollsträning":
                      details = `${habit["Fotbollsträning"]} - ${habit["Vad tränade du"]}min, ${habit["Hur länge varade träningen"]}min `;
                      break;
                  case "Sömn":
                      details = `${habit["Sömn"]} - ${habit["Antal timmar du sov"]}min`;
                      break;
                  case "Fysisk aktivitet":
                      details = `${habit["Fysisk Aktivitet"]} - ${habit["Antal Kilometer"]}km`;
                      break;
                  case "Kosttillskott":
                      details = `${habit["Kosttillskott"]} - ${habit["Kosttillskott"]}g`;
                      break;
                  case "Övrigt":
                      details = `${habit["Övrig vana"]} - ${habit["Vanans varaktighet"]}min`;
                      break;
              }
              detailsDiv.textContent = details;

              // Lägg till innehåll
              contentDiv.appendChild(titleDiv);
              contentDiv.appendChild(detailsDiv);
              repostDiv.appendChild(contentDiv);

              // Knappar
              const buttonsDiv = document.createElement("div");
              buttonsDiv.className = "repost-buttons";

              const addButton = document.createElement("button");
              addButton.textContent = "+";
              addButton.title = "Återanvänd denna vana";
              addButton.addEventListener("click", () => {
                  fillFormWithHabit(habit);
              });

              const closeButton = document.createElement("button");
              closeButton.textContent = "×";
              closeButton.title = "Ta bort från listan";
              closeButton.addEventListener("click", () => {
                  recentHabits.splice(index, 1);
                  saveHabitsToLocalStorage();
                  renderRecentHabits();
              });

              buttonsDiv.appendChild(addButton);
              buttonsDiv.appendChild(closeButton);
              repostDiv.appendChild(buttonsDiv);

              container.appendChild(repostDiv);
          });
      }

      function fillFormWithHabit(habit) {
          document.getElementById("Kategori").value = habit.Kategori;
          document.getElementById("Datum").value = habit.Datum;
          document.getElementById("Tid").value = habit.Tid;
          document.getElementById("Beskrivning").value = habit.Beskrivning;

          // Trigga kategori-ändring för att ladda dynamiska fält
          const event = new Event('change');
          document.getElementById("Kategori").dispatchEvent(event);

          // Vänta lite så att dynamiska fält hinner laddas
          setTimeout(() => {
              Object.keys(habit).forEach(key => {
                  const element = document.getElementById(key);
                  if (element) {
                      element.value = habit[key];
                  }
              });
          }, 100);
      }

      // Lägg till en ny vana (exempel på användning)
      function addNewHabit(habit) {
          recentHabits.push(habit);
          saveHabitsToLocalStorage();
          renderRecentHabits();
      }

      // Visa/Dölj rullgardinsmeny
function toggleDropdown() {
    const container = document.getElementById("repostContainer");
    isDropdownVisible = !isDropdownVisible;
    container.style.display = isDropdownVisible ? "block" : "none";
}


document.addEventListener("DOMContentLoaded", () => {
    renderRecentHabits();
    
    // Dölj repost-rutorna initialt
    document.getElementById("repostContainer").style.display = "none";

    // Skapa och placera knappen för att visa/dölja vanor
    const toggleButton = document.createElement("button");
    toggleButton.id = "toggleRepostButton";
    toggleButton.textContent = "Visa alla vanor";
    toggleButton.addEventListener("click", toggleDropdown);

    const chartDiv = document.getElementById("chart_div");
    chartDiv.insertAdjacentElement("afterend", toggleButton);

    // Skapa och placera knappen för att visa statistik
    const statsButton = document.createElement("button");
    statsButton.id = "toggleStatsButton";
    statsButton.textContent = "Visa frekventa vanor";
    statsButton.addEventListener("click", toggleStatsDisplay);
    chartDiv.insertAdjacentElement("afterend", statsButton);

    // Dölj statistik initialt
    document.getElementById("habitStatsContainer").style.display = "none";
});

      // Hålla reda på användningsfrekvens
      let habitUsageCount = JSON.parse(localStorage.getItem('habitUsageCount')) || {};

      function incrementHabitUsage(habitCategory) {
          habitUsageCount[habitCategory] = (habitUsageCount[habitCategory] || 0) + 1;
          localStorage.setItem('habitUsageCount', JSON.stringify(habitUsageCount));
      }

      function renderHabitStatistics() {
          const statsContainer = document.getElementById("habitStatsContainer");
          statsContainer.innerHTML = "";

          if (Object.keys(habitUsageCount).length === 0) {
              statsContainer.textContent = "Inga vanor har använts ännu.";
          } else {
              const sortedHabits = Object.entries(habitUsageCount).sort((a, b) => b[1] - a[1]);
              sortedHabits.forEach(([category, count]) => {
                  const statDiv = document.createElement("div");
                  statDiv.className = "habit-stat";
                  statDiv.textContent = `${category}: ${count} gånger`;
                  statsContainer.appendChild(statDiv);
              });
          }
      }

      // Visa/Dölj funktion för statistik
      function toggleStatsDisplay() {
          const statsContainer = document.getElementById("habitStatsContainer");
          const frequentContainer = document.getElementById("frequentHabitsContainer");
          const isVisible = statsContainer.style.display === "block";
          statsContainer.style.display = isVisible ? "none" : "block";
          
          if (!isVisible) {
              renderHabitStatistics();
              frequentContainer.style.display = "block"; // Visa frekventa vanor
              renderFrequentHabits(); // Rendera frekventa vanor
          } else {
              frequentContainer.style.display = "none"; // Dölja om statistik är stängd
          }
      }

     // Ny funktion för att rendera de mest frekventa vanorna
function renderFrequentHabits() {
  const frequentContainer = document.getElementById("frequentHabitsContainer");
  frequentContainer.innerHTML = ""; // Rensa tidigare innehåll

  const sortedHabits = Object.entries(habitUsageCount)
      .sort((a, b) => b[1] - a[1]) // Sortera i fallande ordning
      .slice(0, 4); // Ta de 4 mest frekventa

  sortedHabits.forEach(([category, count]) => {
      const repostDiv = document.createElement("div");
      repostDiv.className = "repost";

      // Skapa innehållsdelen
      const contentDiv = document.createElement("div");
      contentDiv.className = "repost-content";

      const titleDiv = document.createElement("div");
      titleDiv.className = "repost-title";
      titleDiv.textContent = `${category}`;

      const detailsDiv = document.createElement("div");
      detailsDiv.className = "repost-details";

      // Här anpassar vi detaljerna baserat på kategori
      let details = '';
      switch (category) {
          case "Dryck":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Kost":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Träning":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Fotbollsträning":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Sömn":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Fysisk aktivitet":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Kosttillskott":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Övrigt":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          default:
              details = "Ingen detaljinformation tillgänglig.";
              break;
      }
      detailsDiv.textContent = `Använd ${count} gånger: ${details}`;

      contentDiv.appendChild(titleDiv);
      contentDiv.appendChild(detailsDiv);
      repostDiv.appendChild(contentDiv);

      // Knappar
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "repost-buttons";

      const addButton = document.createElement("button");
      addButton.textContent = "+";
      addButton.title = "Återanvänd denna vana";
      addButton.addEventListener("click", () => {
          fillFormWithHabit({ Kategori: category }); // Anpassa här för att fylla med vanan
      });

      const closeButton = document.createElement("button");
      closeButton.textContent = "×";
      closeButton.title = "Ta bort från listan";
      closeButton.addEventListener("click", () => {
          delete habitUsageCount[category]; // Ta bort från räknaren
          localStorage.setItem('habitUsageCount', JSON.stringify(habitUsageCount));
          renderFrequentHabits(); // Återrendera
      });

      buttonsDiv.appendChild(addButton);
      buttonsDiv.appendChild(closeButton);
      repostDiv.appendChild(buttonsDiv);

      frequentContainer.appendChild(repostDiv);
  });
}

// Funktion för att hämta detaljinformation om den mest frekventa vanan
function getMostFrequentHabitDetails(category) {
  const recentHabits = JSON.parse(localStorage.getItem('recentHabits')) || [];
  const filteredHabits = recentHabits.filter(habit => habit.Kategori === category);
  
  // Hitta den mest frekventa vanan inom denna kategori
  if (filteredHabits.length === 0) return "Ingen detaljinformation tillgänglig.";

  // Här kan vi anta att vi använder det senaste ifall det finns flera
  const mostFrequentHabit = filteredHabits[filteredHabits.length - 1]; 

  let details = '';
  switch (category) {
      case "Dryck":
          details = `${mostFrequentHabit["Vilken Dryck"]} - ${mostFrequentHabit["Antal Drycker"]}st, ${mostFrequentHabit["Milliliter/st"]}ml`;
          break;
      case "Kost":
          details = `${mostFrequentHabit["Typ av måltid"]} - ${mostFrequentHabit["Måltid"]}, ${mostFrequentHabit["Antal Portioner"]} portioner, ${mostFrequentHabit.Kalorier} kcal`;
          break;
      case "Träning":
          details = `${mostFrequentHabit["Kropps Område"]} - ${mostFrequentHabit["Varaktighet totalt"]}min, ${mostFrequentHabit["Brända Kalorier"]} kcal, ${mostFrequentHabit.Reps} reps, ${mostFrequentHabit.Sets} sets`;
          break;
      case "Fotbollsträning":
          details = `${mostFrequentHabit["Vad tränade du"]} - ${mostFrequentHabit["Hur länge varade träningen"]}min`;
          break;
      case "Sömn":
          details = `${mostFrequentHabit["Sömn"]} - ${mostFrequentHabit["Antal timmar du sov"]} tim`;
          break;
      case "Fysisk aktivitet":
          details = `${mostFrequentHabit["Fysisk Aktivitet"]} - ${mostFrequentHabit["Antal Kilometer"]}km`;
          break;
      case "Kosttillskott":
          details = `${mostFrequentHabit["Kosttillskott"]} - ${mostFrequentHabit["Gram kosttillskott"]}g`;
          break;
      case "Övrigt":
          details = `${mostFrequentHabit["Övrig vana"]} - ${mostFrequentHabit["Vanans varaktighet"]}min`;
          break;
      default:
          details = "Ingen detaljinformation tillgänglig.";
          break;
  }
  return details;
}
      // CSS-förbättringar för bättre visning av statistik
      const style = document.createElement("style");
      style.innerHTML = `
          .habit-stat {
              background-color: #8897D2;
              color: white;
              padding: 10px;
              margin: 5px 0;
              border-radius: 5px;
              text-align: center;
          }
      `;
      document.head.appendChild(style);

      // Formulärhantering
      const form = document.getElementById("Enkät");

      form.addEventListener("submit", function(event) {
          event.preventDefault();

          const formData = new FormData(form);
          const habitData = Object.fromEntries(formData.entries());
          
          // Lägg till i recentHabits och uppdatera visningen
          recentHabits.push(habitData);
          localStorage.setItem('recentHabits', JSON.stringify(recentHabits));
          renderRecentHabits();

          // Öka användningsfrekvens
          incrementHabitUsage(habitData.Kategori);

          // Skicka data till Google Apps Script
          fetch("https://script.google.com/macros/s/AKfycbzS6zPEBIYvp76jFHocWRAaSiQ8-riJiN6a820Voh9UQdezNA8Dq8HxOHuTwN-m8mc4/exec", {
              method: "POST",
              body: formData
          })
          .then(response => response.json())
          .then(data => {
              if (data.result === "success") {
                  alert("Formuläret skickades in!");
                  form.reset();

                  const now = new Date();
                  const currentDate = now.toISOString().split("T")[0];
                  const currentTime = now.toTimeString().slice(0, 5);
                  document.getElementById("Datum").value = currentDate;
                  document.getElementById("Tid").value = currentTime;
              } else {
                  alert("Något gick fel. Försök igen.");
              }
          })
          .catch(error => {
              console.error("Fel vid inlämning:", error);
              alert("Ett fel uppstod vid inlämning. Försök igen.");
          });
      });

      // Initialisering av datum och tid
      document.addEventListener("DOMContentLoaded", function() {
          const now = new Date();
          const currentDate = now.toISOString().split("T")[0];
          const currentTime = now.toTimeString().slice(0, 5);
          
          document.getElementById("Datum").value = currentDate;
          document.getElementById("Tid").value = currentTime;

          // Sätt upp kategori-lyssnare
          const kategoriField = document.getElementById("Kategori");
          const dynamicFieldsContainer = document.getElementById("dynamic-fields");

          kategoriField.addEventListener("change", function() {
              const selectedCategory = kategoriField.value;
              dynamicFieldsContainer.innerHTML = "";


              if (selectedCategory === "Dryck") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vilken Dryck">Vilken Dryck:</label>
                      <select id="Vilken Dryck" name="Vilken Dryck" required>
                          <option value="Vatten">Vatten</option>
                          <option value="Mjölk">Mjölk</option>
                          <option value="Saft">Saft</option>
                          <option value="Läsk">Läsk</option>
                          <option value="Energi dryck">Energi dryck</option>
                          <option value="Kaffe">Kaffe</option>
                          <option value="Te">Te</option>
                          <option value="Smoothie">Smoothie</option>
                          <option value="Övrigt">Övrigt</option>
                          <option value="Alkohol">Alkohol</option>
                      </select>

                      <label for="Antal Drycker">Antal Drycker:</label>
                      <select id="Antal Drycker" name="Antal Drycker" required>
                          ${[...Array(10)].map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                      </select>
                      
                      <label for="Milliliter/st">Milliliter/st:</label>
                      <select id="Milliliter/st" name="Milliliter/st" required>
                          ${Array.from({length: 300}, (_, i) => (i + 1) * 10).map(val => `<option value="${val}">${val}</option>`).join('')}
                      </select>
                  `;
              } else if (selectedCategory === "Kost") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Typ av måltid">Typ av måltid:</label>
                      <select id="Typ av måltid" name="Typ av måltid" required>
                          <option value="Frukost">Frukost</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Middag">Middag</option>
                          <option value="Snack">Snack</option>

                      </select>

                      <label for="Måltid">Måltid:</label>
                      <input type="text" id="Måltid" name="Måltid" placeholder="Vad åt du för något?" required>

                      <label for="Antal Portioner">Antal portioner:</label>
                      <select id="Antal Portioner" name="Antal Portioner" required>
                          ${[...Array(10)].map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                      </select>

                      <label for="Kalorier">Kalorier:</label>
                      <input type="text" id="Kalorier" name="Kalorier" placeholder="Skriv in kalorier" required>

                  `;
              } else if (selectedCategory === "Sömn") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vilken typ av sömn">Vilken typ av sömn:</label>
                      <select id="Vilken typ av sömn" name="Vilken typ av sömn" required>
                          <option value="Power nap">Power nap</option>
                          <option value="Vanlig Sömn">Vanlig Sömn</option>
                      </select>
                      <input type="text" id="Sömn timmar" name="Sömn timmar" placeholder="Hur många timmar sov du?" required>
                   `;
              } else if (selectedCategory === "Fotbollsträning") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vad tränade du">Vad tränade du:</label>
                      <input type="text" id="Vad tränade du" name="Vad tränade du" placeholder="Vad var det för träning du gjorde?" required>
                      
                      <label for="Hur länge varade träningen">Hur länge varade träningen:</label>
                      <input type="text" id="Hur länge varade träningen" name="Hur länge varade träningen" placeholder="Hur länge varade träningen?" required>
                   `;
              } else if (selectedCategory === "Träning") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Kropps Område">Kropps Område:</label>
                      <select id="Kropps Område" name="Kropps Område" required>
                          <option value="">Välj kroppsområde</option>
                          <option value="Armar">Armar</option>
                          <option value="Ben">Ben</option>
                          <option value="Rygg">Rygg</option>
                          <option value="Axlar">Axlar</option>
                          <option value="Mage">Mage</option>
                          <option value="Bröst">Bröst</option>
                          <option value="Plyometrics">Plyometrics</option>
                          <option value="Helkroppspass">Helkroppspass</option>
                          <option value="Funktionspass">Funktionspass</option>
                          <option value="Övrigt">Övrigt</option>
                      </select>

                      <label for="Varaktighet totalt">Varaktighet totalt:</label>
                      <input type="text" id="Varaktighet totalt" name="Varaktighet totalt" placeholder="Hur många minuter tränade du området totalt" required>
                      <label for="Brända Kalorier">Brända Kalorier:</label>
                      <input type="text" id="Brända Kalorier" name="Brända Kalorier" placeholder="Hur många kalorier brände du under träningen?" required>

                      <label for="Antal reps">Antal Reps:</label>
                      <input type="text" id="Reps" name="Reps" placeholder="Hur många reps?" required>

                      <label for="Antal sets">Antal sets:</label>
                      <input type="text" id="Sets" name="Sets" placeholder="Hur många sets?" required>
                  `;
              } else if (selectedCategory === "Fysisk aktivitet") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Fysisk Aktivitet">Fysisk Aktivitet:</label>
                      <select id="Fysisk Aktivitet" name="Fysisk Aktivitet" required>
                          <option value="">Välj fysisk aktivitet</option>
                          <option value="Springa">Springa</option>
                          <option value="Jogga">Jogga</option>
                          <option value="Gång">Gång</option>
                      </select>

                      <label for="Antal Kilometer">Antal Kilometer:</label>
                      <input type="text" id="Antal Kilometer" name="Antal Kilometer" placeholder="Antal km" required>
                  `;
                } else if (selectedCategory === "Kosttillskott") {
                    dynamicFieldsContainer.innerHTML = `
                        <label for="Kosttillskott">Kosttillskott:</label>
                        <input type="text" id="Kosttillskott" name="Gram kosttillskott" placeholder="Antal gram kosttillskott" required>
                    `;
            
              } else if (selectedCategory === "Övrigt") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Övrig Vana">Övrig vana:</label>
                      <input type="text" id="Övrig vana" name="Övrig vana" placeholder="Vilken övrig vana har du gjort" required>
                      
                      <label for="Vanans varaktighet">Vanans varaktighet:</label>
                      <input type="text" id="Vanans varaktighet" name="Vanans varaktighet" placeholder="Hur många minuter tog det totalt" required>
                  `;
              }
            
                    
          });
      });
