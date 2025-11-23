let plantsData = [];

// Функция для рендеринга списка по массиву
function renderPlantList(plants) {
  const list = document.getElementById("plantList");
  list.innerHTML = ""; // очищаем список

  if (!plants.length) {
    list.innerHTML = "<li>Растений не найдено</li>";
    return;
  }

  plants.forEach(plant => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="info">
        <span class="name">${plant.name}</span>
        <span class="species">${plant.species}</span>
      </div>
      <a href="plants/plant.html?id=${encodeURIComponent(plant.id)}">
        <img src="images/${plant.id}.png" alt="${plant.name}" />
      </a>
    `;

    list.appendChild(li);
  });
}

// Загрузка JSON
fetch("data/plants.json")
  .then(r => r.json())
  .then(data => {
    plantsData = data.plants || [];
    renderPlantList(plantsData);
  })
  .catch(err => {
    document.getElementById("plantList").innerHTML = "<li>Ошибка загрузки списка растений</li>";
    console.error(err);
  });

// Поиск
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function() {
  const query = this.value.toLowerCase();

  const filtered = plantsData.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.species.toLowerCase().includes(query)
  );

  renderPlantList(filtered);
});
