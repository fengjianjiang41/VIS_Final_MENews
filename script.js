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

  initMapAndSlider();
});

/**
 * 卿负责的 chapter 所需的 js
 */
function initMapAndSlider() {
  const mapContainer = document.getElementById('mapContainer');
  const slider = document.getElementById('slider');
  const sliderTooltip = document.getElementById('sliderTooltip');
  const fatalitiesFilter = document.getElementById('fatalitiesFilter');
  const cumulativeFilter = document.getElementById('cumulativeFilter');

  if (!mapContainer) {
      console.error('地图容器未找到！');
      return;
  }

  if (!slider || !sliderTooltip) {
      console.error('滑块容器或工具提示未找到！');
      return;
  }

  // 初始化 Leaflet 地图
  //  "lat": 31.40552229724022,
  //  "lng": 34.42136764526368
  // zoom: 12
  const map = L.map(mapContainer).setView([31.40552229724022, 34.42136764526368], 12);

  // 添加 OpenStreetMap 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // 初始化一个图层组，用于动态更新标记
  const markersLayer = L.layerGroup().addTo(map);

  // 加载 CSV 数据（使用分号作为分隔符）
  d3.dsv(';', 'map_data/tmp.csv').then(function(data) {
      console.log('CSV 数据加载成功。');

      // 处理数据
      const allData = [];

      data.forEach(function(d, index) {
          // 解析经纬度和死亡人数
          d.latitude = parseFloat(d.latitude);
          d.longitude = parseFloat(d.longitude);
          d.fatalities = parseInt(d.fatalities, 10);

          // 使用 moment.js 解析日期，严格模式
          d.date = moment(d.event_date, 'D MMMM YYYY', true);
          if (d.date.isValid()) {
              d.month = d.date.format('MMMM YYYY'); // 提取月份和年份，如 "October 2023"
          } else {
              d.month = null; // 无效日期标记为 null
              console.warn(`数据行 ${index + 1} 的日期无效: event_date=${d.event_date}`);
          }

          // 检查经纬度是否为有效数字
          if (isNaN(d.latitude) || isNaN(d.longitude)) {
              console.warn(`数据行 ${index + 1} 的经纬度无效: latitude=${d.latitude}, longitude=${d.longitude}`);
              return; // 跳过此条数据
          }

          // 仅添加有效日期的记录
          if (d.month !== null) {
              allData.push(d);
          }

          // 打印解析后的 description
          //console.log(`数据行 ${index + 1} 的描述: ${d.description}`);
      });

      console.log(`有效数据条数: ${allData.length}`);

      // 获取所有唯一的月份
      const uniqueMonths = Array.from(new Set(allData.map(d => d.month))).sort(function(a, b) {
          return moment(a, 'MMMM YYYY').diff(moment(b, 'MMMM YYYY'));
      });

      console.log('唯一月份:', uniqueMonths);

      if (uniqueMonths.length === 0) {
          console.error('没有找到唯一的月份数据。');
          return;
      }

      // 创建 noUiSlider
      noUiSlider.create(slider, {
          start: 12,
          range: {
              min: 0,
              max: uniqueMonths.length - 1
          },
          step: 1,
          tooltips: false, // 使用自定义工具提示
          format: {
              to: function(value) { return value; },
              from: function(value) { return Number(value); }
          },
          pips: {
              mode: 'count',
              values: uniqueMonths.length,
              density: 100,
              format: {
                  to: function(value) {
                      return uniqueMonths[value];
                  },
                  from: function(value) {
                      return Number(value);
                  }
              }
          }
      });

      // 初始化工具提示
      sliderTooltip.innerHTML = '选中月份: ' + uniqueMonths[0];

      // 定义一个函数来获取当前选中的月份
      function getSelectedMonth() {
          const sliderValues = slider.noUiSlider.get();
          const index = Math.round(sliderValues);
          return uniqueMonths[index];
      }

      // 定义一个函数来获取是否启用了死亡人数过滤
      function isFatalitiesFilterEnabled() {
          return fatalitiesFilter.checked;
      }

      // 定义一个函数来获取是否启用了累积显示过滤
      function isCumulativeFilterEnabled() {
          return cumulativeFilter.checked;
      }

      // 定义一个函数来获取过滤后的数据
      
      function getFilteredData() {
          let filteredData = [];

          if (isCumulativeFilterEnabled()) {
              // 如果启用了累积显示，获取所有时间 <= 选中时间的数据
              const selectedMonth = getSelectedMonth();
              const selectedDate = moment(selectedMonth, 'MMMM YYYY');
              filteredData = allData.filter(d => moment(d.month, 'MMMM YYYY').isSameOrBefore(selectedDate));
          } else {
              // 否则，只获取选中时间的数据
              const selectedMonth = getSelectedMonth();
              filteredData = allData.filter(d => d.month === selectedMonth);
          }

          if (isFatalitiesFilterEnabled()) {
              // 如果启用了死亡人数过滤，进一步过滤
              filteredData = filteredData.filter(d => d.fatalities >= 20);
          }

          return filteredData;
      }

      // 创建一个函数来更新地图
      function refreshMap() {
          const filteredData = getFilteredData();
          updateMap(map, markersLayer, filteredData);
      }

      // 滑块更新时更新工具提示
      slider.noUiSlider.on('update', function(values, handle) {
          const selectedMonth = getSelectedMonth();
          sliderTooltip.innerHTML = '选中月份: ' + selectedMonth;
      });

      // 滑块改变时更新地图
      slider.noUiSlider.on('change', function(values, handle) {
          refreshMap();
      });

      // 勾选框改变时更新地图
      fatalitiesFilter.addEventListener('change', function() {
          refreshMap();
      });

      cumulativeFilter.addEventListener('change', function() {
          refreshMap();
      });

      // 初始显示第一个月份的数据
      cumulativeFilter.checked = true; // 累计显示
      fatalitiesFilter.checked = false; // 不显示高于 20 的死亡人数
      refreshMap();

      // 调整地图大小，确保正确渲染
      setTimeout(() => {
          map.invalidateSize();
      }, 100); // 延迟一段时间，确保容器尺寸已更新
});
}

// 定义 updateMap 函数在 initMapAndSlider 函数之外
function updateMap(map, markersLayer, filteredData) {
console.log(`开始更新地图，显示数据条数: ${filteredData.length}`);

// 清除之前的标记
markersLayer.clearLayers();

// 添加标记到地图
filteredData.forEach(function(d) {
    // 根据 flag 设置颜色
    const color = d.flag === 'pse' ? 'red' : 'blue';

    // 根据 fatalities 设置圆的半径
    const radius = d.fatalities ? Math.sqrt(d.fatalities) * 1.3 : 1.3;

    // 创建圆形标记
    const circle = L.circleMarker([d.latitude, d.longitude], {
        color: color,
        radius: radius,
        fillOpacity: 0.7
    });

    // 创建弹出内容
  const popupContent = `
  <div class="popup-content">
      <h3>What happened here?</h3>
      <p>${d.notes}</p>
      <p>------------------------------</p>
      ${
          d.title && d.title.trim() !== '' ? `
              <h4>Related News</h4>
              <p>${d.title}</p>
              <a href="${d.link}" target="_blank">阅读更多</a>
          ` : ''
      }
  </div>
  `;

    circle.bindPopup(popupContent);

    // 添加到标记图层
    markersLayer.addLayer(circle);
});

// 调整地图大小，确保正确渲染
map.invalidateSize();
}
/**
* END 卿
*/

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
    16: { file: 'fatalities_data/final_ISR/others_ISR.csv', column: 'Others_cumsum' },
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
    29: { file: 'fatalities_data/final_PSE/others_PSE.csv', column: 'Others_cumsum' },
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
            color: 'black',
            font: {
              size: 16,
              family: 'STZhongsong'
            }
          },
          ticks: {
            color: 'black',
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
            color: 'black',
            font: {
              size: 16,
              family: 'STZhongsong'
            }
          },
          ticks: {
            color: 'black',
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
  buttons[0].click();
});