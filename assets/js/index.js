const ticketList = document.querySelector('.ticketList');
//篩選區域監聽事件
const searchBox = document.querySelector('.searchBox');//宣告DOM篩選區域
const cardCityNumEl = document.querySelector('.cardCityNum');//宣告DOM卡片數量
const addBtn = document.querySelector('#addTicketBtn');
const addForm = document.querySelector('.addTicketForm');

let data = [
    {
      "id": 0,
      "name": "肥宅心碎賞櫻3日",
      "imgUrl": "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1655&q=80",
      "area": "高雄",
      "description": "賞櫻花最佳去處。肥宅不得不去的超讚景點！",
      "group": 87,
      "price": 1400,
      "rate": 10
    },
    {
      "id": 1,
      "name": "貓空纜車雙程票",
      "imgUrl": "https://images.unsplash.com/photo-1501393152198-34b240415948?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
      "area": "台北",
      "description": "乘坐以透明強化玻璃為地板的「貓纜之眼」水晶車廂，享受騰雲駕霧遨遊天際之感",
      "group": 99,
      "price": 240,
      "rate": 2
    },
    {
      "id": 2,
      "name": "台中谷關溫泉會1日",
      "imgUrl": "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
      "area": "台中",
      "description": "全館客房均提供谷關無色無味之優質碳酸原湯，並取用八仙山之山冷泉供蒞臨貴賓沐浴及飲水使用。",
      "group": 20,
      "price": 1765,
      "rate": 7
    }
  ];

//將每一個html裡的ticketCard的資料ticketCard-region、ticketCard-rank、img src、ticketCard-name、ticketCard-description、ticketCard-num、ticketCard-price的值存入data陣列中
const ticketCards = document.querySelectorAll('.ticketCard');
//ticketCards.forEach(function(card)
ticketCards.forEach(card => {
  const id = getNextId();
  const name = card.querySelector('.ticketCard-name').textContent;
  const imgUrl = card.querySelector('img').src;
  const area = card.querySelector('.ticketCard-region').textContent;
  const description = card.querySelector('.ticketCard-description').textContent;
  const group = Number(card.querySelector('#ticketCard-num').textContent);
  const price = Number(card.querySelector('#ticketCard-price').textContent);
  const rate = Number(card.querySelector('.ticketCard-rank').textContent);

  data.push({
    id,
    name,
    imgUrl,
    area,
    description,
    group,
    price,
    rate
  });
});

function getNextId() {
  return data.length ? Math.max(...data.map(i => i.id)) + 1 : 0;
  //三元運算子 (條件 ? 結果 A : 結果 B) 來處理兩種情況
  //檢查data.length(長度)
  //map 函式遍歷 data 陣列中的每個元素 (i)。
  //...(展開運算子, Spread Operator)將上一步生成的 ID 陣列展開成一個參數序列
  //Math.max 接收多個數字，回傳最大值
  //所以最大值+1
  //: 0  如果是空的 (沒有資料)， 就直接回傳 0。
}

function createTicketElement(item) {
  const li = document.createElement('li');
  li.className = 'ticketCard col-4 g-8';
  li.dataset.city = item.area;
  li.innerHTML = `
    <div class="bg-neutral-0 shadow-sm h-100">
      <div class="ticketCard-img position-relative">
        <a href="#">
          <img src="${item.imgUrl}" alt="${item.name}">
        </a>
        <div class="text-center text-neutral-0 fs-5 bg-primary-300 ticketCard-region position-absolute">${item.area}</div>
        <div class="text-center text-neutral-0 bg-primary-400 ticketCard-rank position-absolute">${item.rate}</div>
      </div>
      <div class="ticketCard-content py-6 px-5">
        <div class="mb-6">
          <h3 class="fw-medium border-bottom border-2 pb-1 border-primary-400 mb-4">
            <a href="#" class="ticketCard-name">${item.name}</a>
          </h3>
          <p class="ticketCard-description text-neutral-600">
            ${item.description}
          </p>
        </div>
        <div class="ticketCard-info text-primary-400 d-flex justify-content-between ">
          <p class="ticketCard-num fw-medium d-flex align-items-center gap-1">
            <span><i class="bi bi-exclamation-circle-fill"></i></span>
            剩下最後 <span id="ticketCard-num">${item.group}</span> 組
          </p>
          <p class="ticketCard-price fw-medium d-flex align-items-center gap-1">
            TWD $<span id="ticketCard-price" class="fw-medium fs-2 ">${item.price}</span>
          </p>
        </div>
      </div>
    </div>
  `;
  return li;
}

//將data內的id的資料顯示作為套票卡片新增在html裡
function renderTicketList(filteredData) {
  if (!ticketList) return; // 確保 ticketList 存在
    ticketList.innerHTML = ''; // 清空現有列表
    filteredData.forEach(item => {
        const li = createTicketElement(item);
        ticketList.appendChild(li);
        //.appendChild(li) 的意思就是把 li 這個「孩子」，加到 ticketList 這個「父親」的下面(最尾端)
        //概念上與Arry.push 很像一個作用在陣列，一個作用在DOM
    });
    // 呼叫 updateCardCount 函式來更新筆數顯示
    updateCardCount(filteredData.length);
}

function addTicket(item) {
  item.id = getNextId();
  // push 到 data
  data.push(item);

  //根據目前的篩選條件來重新渲染整個列表
  const currentFilter = (searchBox && searchBox.value) ? searchBox.value : 'allCity';
  filterAndRender(currentFilter);

}

//updateCardCount 是一個函式，用來更新顯示的票卡數量。
function updateCardCount(count) {
  if (cardCityNumEl) cardCityNumEl.textContent = count;
}

// 篩選並渲染的統一函式**
function filterAndRender(selectedCity) {
    // 1. 篩選資料
    const filteredData = data.filter(item => {
        return selectedCity === 'allCity' || item.area === selectedCity;
    });

    // 2. 渲染篩選後的資料
    renderTicketList(filteredData);
}

// 將 data 新增項目，並輸出成 ticketCard 加入畫面，會配合當前篩選顯示狀態與更新筆數
if (addBtn) {
  addBtn.addEventListener('click', e => {
    // 取消瀏覽器對特定事件的預設處理方式，執行自己的程式碼
    e.preventDefault();
    const nameEl = document.querySelector('#ticketName');
    const imgEl = document.querySelector('#ticketImgUrl');
    const areaEl = document.querySelector('#ticketRegion');
    const descEl = document.querySelector('#ticketDescription');
    const groupEl = document.querySelector('#ticketNum');
    const priceEl = document.querySelector('#ticketPrice');
    const rateEl = document.querySelector('#ticketRate');

   if (!nameEl.value || !imgEl.value || areaEl.value === "") {
    const nameElTitle = document.querySelector('#ticketName-message');
    const imgElTitle = document.querySelector('#ticketImgUrl-message');
    const areaElTitle = document.querySelector('#ticketRegion-message');
    const descElTitle = document.querySelector('#ticketDescription-message');
    const groupElTitle = document.querySelector('#ticketNum-message');
    const priceElTitle = document.querySelector('#ticketPrice-message');
    const rateElTitle = document.querySelector('#ticketRate-message');
    nameElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${nameElTitle.dataset.message}<span>必填!</span>`;
    imgElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${imgElTitle.dataset.message}<span>必填!</span>`;
    areaElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${areaElTitle.dataset.message}<span>必填!</span>`;
    descElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${descElTitle.dataset.message}<span>必填!</span>`;
    groupElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${groupElTitle.dataset.message}<span>必填!</span>`;
    priceElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${priceElTitle.dataset.message}<span>必填!</span>`;
    rateElTitle.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${rateElTitle.dataset.message}<span>必填!</span>`;
    return;
        }

    const newItem = {
      name: nameEl.value.trim(),
      // 存入顯示名稱（createTicketElement 會用 cityKey 轉成 dataset）
      imgUrl: imgEl.value.trim(),
      area: areaEl.value.trim(), 
      description: descEl ? descEl.value.trim() : '',
      group: groupEl ? Number(groupEl.value) || 0 : 0,
      price: priceEl ? Number(priceEl.value) || 0 : 0,
      rate: rateEl ? Number(rateEl.value) || 0 : 0
    };

    addTicket(newItem);

    // 清空表單
    if (addForm) addForm.reset();
    
  });
}

//篩選區域切換卡片
if (searchBox) {
    searchBox.addEventListener('change', e => {
        const selectedCity = e.target.value;
        filterAndRender(selectedCity);
    });
}

// 頁面啟動時：初始化顯示全部卡片和計數
// 注意：searchBox 的初始值是 "地區搜尋"，這不是 'allCity'
// 所以這裡要用一個固定的值來初始化
filterAndRender('allCity'); // 預設顯示全部資料





