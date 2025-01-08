document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll('.page');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // When a section comes into view, add a class or trigger an animation
        entry.target.classList.add('in-view');
      } else {
        // When a section is out of view, remove the class or reset the animation
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.5  // Trigger when 50% of the section is in view
  });

  // Observe all sections
  sections.forEach(section => observer.observe(section));
});

document.addEventListener('DOMContentLoaded', function () {
  const map1DataMapping = {
    1: { file: 'fatalities_data/root/root.csv', column: 'total_root' },
    2: { file: 'fatalities_data/root/root.csv', column: 'total_ISR' },
    3: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'Battles' },
    4: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Armed clash' },
    5: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Government regains territory' },
    6: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Non-state actor overtakes territory' },
    7: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'Explosions&RemoteViolence' },
    8: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Air/drone strike' },
    9: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Shelling/artillery/missile attack' },
    10: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Suicide bomb' },
    11: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Remote explosive/landmine/IED' },
    12: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'ViolenceAgainstCivilians' },
    13: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Attack' },
    14: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Sexual violence' },
    15: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Abduction/forced disappearance' },
    16: { file: 'fatalities_data/final_ISR/others_ISR.csv', column: 'Others' },
    17: { file: 'fatalities_data/root/root.csv', column: 'total_PSE' },
    18: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'Battles' },
    19: { file: 'fatalities_data/final_PSE/PSE-Battles-Fatalities_sorted_cumulative.csv', column: 'Armed clash' },
    20: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'Explosions&RemoteViolence' },
    21: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Air/drone strike' },
    22: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Shelling/artillery/missile attack' },
    23: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Grenade' },
    24: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Remote explosive/landmine/IED' },
    25: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'ViolenceAgainstCivilians' },
    26: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Attack' },
    27: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Sexual violence' },
    28: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Abduction/forced disappearance' },
    29: { file: 'fatalities_data/final_PSE/others_PSE.csv', column: 'Others' },
    // Add more mappings as needed
  };

  const map2DataMapping = {
    1: { file: 'fatalities_data/root/root.csv', column: 'total_root_sum' },
    2: { file: 'fatalities_data/root/root.csv', column: 'total_ISR_sum' },
    3: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'Battles_sum' },
    4: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Armed clash_cumsum' },
    5: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Government regains territory_cumsum' },
    6: { file: 'fatalities_data/final_ISR/ISR-Battles-Fatalities_sorted_cumulative.csv', column: 'Non-state actor overtakes territory_cumsum' },
    7: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'Explosions&RemoteViolence_sum' },
    8: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Air/drone strike_cumsum' },
    9: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Shelling/artillery/missile attack_cumsum' },
    10: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Suicide bomb_cumsum' },
    11: { file: 'fatalities_data/final_ISR/ISR-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Remote explosive/landmine/IED_cumsum' },
    12: { file: 'fatalities_data/final_ISR/cumulative_sorted_result_ISR.csv', column: 'ViolenceAgainstCivilians_sum' },
    13: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Attack_cumsum' },
    14: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Sexual violence_cumsum' },
    15: { file: 'fatalities_data/final_ISR/ISR-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Abduction/forced disappearance_cumsum' },
    16: { file: 'fatalities_data/final_ISR/others_ISR.csv', column: 'Others_sum' },
    17: { file: 'fatalities_data/root/root.csv', column: 'total_PSE_sum' },
    18: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'Battles_sum' },
    19: { file: 'fatalities_data/final_PSE/PSE-Battles-Fatalities_sorted_cumulative.csv', column: 'Armed clash_cumsum' },
    20: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'Explosions&RemoteViolence_sum' },
    21: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Air/drone strike_cumsum' },
    22: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Shelling/artillery/missile attack_cumsum' },
    23: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Grenade_cumsum' },
    24: { file: 'fatalities_data/final_PSE/PSE-Explosions&RemoteViolence-Fatalities_sorted_cumulative.csv', column: 'Remote explosive/landmine/IED_cumsum' },
    25: { file: 'fatalities_data/final_PSE/cumulative_sorted_result_PSE.csv', column: 'ViolenceAgainstCivilians_sum' },
    26: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Attack_cumsum' },
    27: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Sexual violence_cumsum' },
    28: { file: 'fatalities_data/final_PSE/PSE-ViolenceAgainstCivilians-Fatalities_sorted_cumulative.csv', column: 'Abduction/forced disappearance_cumsum' },
    29: { file: 'fatalities_data/final_PSE/others_PSE.csv', column: 'Others_sum' },
    // Add more mappings as needed
  };

  let currentMap = 'map1';

  const fetchData = async (file, column) => {
    const response = await fetch(file);
    const data = await response.text();
    const rows = data.split('\n').map(row => row.split(','));
    const header = rows[0];
    const columnIndex = header.indexOf(column);
    return rows.slice(1).map(row => parseFloat(row[columnIndex]));
  };

  const buttons = document.querySelectorAll('.tree-button');
  buttons.forEach(button => {
    button.addEventListener('click', async function () {
      const dataNumber = parseInt(this.getAttribute('data-number'));
      const childButtons = Array.from(this.parentElement.querySelectorAll(':scope > ul > li > .tree-button'));
      const childDataNumbers = childButtons.map(btn => parseInt(btn.getAttribute('data-number')));
      const allDataNumbers = [dataNumber, ...childDataNumbers];

      const dataMapping = currentMap === 'map1' ? map1DataMapping : map2DataMapping;

      const dataPromises = allDataNumbers.map(num => {
        const mapping = dataMapping[num];
        if (mapping) {
          return fetchData(mapping.file, mapping.column);
        }
        return Promise.resolve([]);
      });

      const dataResults = await Promise.all(dataPromises);

      const labels = dataResults.length > 0 ? Array.from({ length: dataResults[0].length }, (_, index) => `${index}`) : []; // Modify labels as needed
      const datasets = dataResults.filter(data => data.length > 0).map((data, index) => ({
        label: buttons[allDataNumbers[index] - 1].textContent,
        data: data,
        borderColor: allDataNumbers[index] === 1 ? (allDataNumbers[index] === 2 ? 'blue' : 'red') : (allDataNumbers[index] < 17 ? `rgba(${index * 35}, ${index * 35}, ${255 - index * 45}, 1)` : `rgba(${255 - (index - 16) * 45}, ${index * 35}, ${index * 35}, 1)`),
        borderWidth: 2,
        fill: false
      }));

      if (datasets.length > 1) {
        datasets.shift();
      }

      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    });
  });

  const map1Button = document.getElementById('map1-button');
  const map2Button = document.getElementById('map2-button');

  map1Button.addEventListener('click', function () {
    currentMap = 'map1';
    map1Button.classList.add('active');
    map2Button.classList.remove('active');
    // Trigger a click on the active tree button to recompute the chart
    document.querySelector('.tree-button.active').click();
  });

  map2Button.addEventListener('click', function () {
    currentMap = 'map2';
    map2Button.classList.add('active');
    map1Button.classList.remove('active');
    // Trigger a click on the active tree button to recompute the chart
    document.querySelector('.tree-button.active').click();
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('chart-canvas').getContext('2d');
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: '日期数',
            color: 'white',
            font: {
              size: 16,
              family: 'STZhongsong'
            }
          },
          ticks: {
            color: 'white',
            font: {
              size: 12,
              family: 'STZhongsong'
            }
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: '死亡人数',
            color: 'white',
            font: {
              size: 16,
              family: 'STZhongsong'
            }
          },
          ticks: {
            color: 'white',
            font: {
              size: 12,
              family: 'STZhongsong'
            }
          }
        }
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.tree-button');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
  buttons[0].classList.add('active'); // Set the root button as active on load
});

document.addEventListener('DOMContentLoaded', function () {
  const display = document.getElementById('display-text');
  const buttons = document.querySelectorAll('.tree-button');

  buttons.forEach(button => {
    button.addEventListener('click', function () {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      let displayText = `Button: ${this.getAttribute('data-number')}`;
      const childButtons = Array.from(this.parentElement.querySelectorAll(':scope > ul > li > .tree-button'));
      if (childButtons.length > 0) {
        displayText += `, Children: ${childButtons.map(btn => btn.getAttribute('data-number')).join(', ')}`;
      }
      display.textContent = displayText;
    });
  });
  buttons[0].classList.add('active'); // Set the root button as active on load
});