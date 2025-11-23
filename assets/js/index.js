const productWrap = document.querySelector('.productWrap');//宣告DOM產品卡片 渲染畫面用(產品內容)
const productSelect = document.querySelectorAll('.productSelect');//宣告DOM篩選區域
const addCardBtn = document.querySelector('.addCardBtn');//宣告DOM加入購物車
const shoppingCart = document.querySelector('.shoppingCart');//宣告DOM購物車
const clearBroductBtn = document.querySelector('.discardBtn');//宣告DOM購物車刪除產品
const discardAllBtn = document.querySelector('.discardAllBtn');//宣告DOM購物車刪除所有產品
const addOrderBtn = document.querySelector('.orderInfo-btn');//宣告DOM送出預訂資料

//通用API路徑
const baseURL = "https://livejs-api.hexschool.io";
const api_path = "h2cjdqaay3mbskg25gmawhsue4u2";
//const token = "h2cjdqaay3mbskg25gmawhsue4u2";
//匯入產品API
const productsUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/products`;

//這個宣告可能用不到
let data = [];//用來放API回來的資料
const productCards = document.querySelectorAll('.productCard');//宣告DOM每一張卡片)

// 取得產品列表
function getProductList() {
  axios.get(productsUrl).
    then(function (response) {
      const productsData = response.data.products;
      console.log(productsData); //檢查用
      getProductsData(productsData); //渲染畫面(產品內容)
      setFilter(productsData) //渲染畫面(篩選的產品內容)
    })
    .catch(function (error) {
      console.log(error)
    })
}

//渲染畫面(產品內容)
function getProductsData(data) {
  let arr = "";
  // 定義格式化函式
  const formatCurrency = (value) => {
    //將輸入值強制轉換為數字
    const number = Number(value);
    // 檢查是否為有效的數字
    if (typeof number !== 'number' || isNaN(number)) {
      return '$NT 0';
    }

    // 使用 toLocaleString 進行格式化
    return number.toLocaleString('zh-TW', {
      style: 'currency',
      currency: 'NTD',
      minimumFractionDigits: 0 // 確保不顯示小數點
    }).replace('NTD', 'NT$'); // 將預設的 'NTD' 替換成 'NT$'
  };

  data.forEach((item) => {
    // 格式化價格
    const formattedOriginPrice = formatCurrency(item.origin_price);
    const formattedNowPrice = formatCurrency(item.price);
    arr += `
          <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="">
        <a href="#" class="addCardBtn">加入購物車</a>
        <h3 class="ticket-name">${item.title}</h3>
        <del class="originPrice">${formattedOriginPrice}</del>
        <p class="nowPrice">${formattedNowPrice}</p>
      </li>
          `;
  });
  productWrap.innerHTML = arr;
}

// 設定篩選功能
function setFilter(allData) {
  productSelect.forEach(select => {
    select.addEventListener("change", (e) => {
      const category = e.target.value;
      if (category === "全部") {
        getProductsData(allData);
      } else {
        const filterData = allData.filter(item => item.category === category);
        getProductsData(filterData);
      }
    });
  });
}

function buildDataFromCards() {
  data = [];
  //productCards.forEach(function(card
  productCards.forEach(card => {
    const id = getNextId();
    const productType = card.querySelector('.productType').textContent;
    const imgUrl = card.querySelector('img').src;
    const name = card.querySelector('.ticket-name').textContent;
    const originPrice = Number(card.querySelector('.originPrice').textContent.replace(/[^\d]/g, ''));
    //replace(/[^\d]/g, '') /.../ =正規表達式字面量; []=字元集合; ^=不是; /d=0~9; g=全域搜索(這段字串裡)
    //string.replace(搜尋目標, 替換成什麼)
    const nowPrice = Number(card.querySelector('.nowPrice').textContent.replace(/[^\d]/g, ''));

    data.push({
      id,
      productType,
      imgUrl,
      name,
      originPrice,
      nowPrice
    });

  });
}

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

//執行
function init() {
  getProductList()//從data取得產品列表
  //buildDataFromCards()將卡片存入data，暫時用不到，因為資料已確定從data裡讀出，沒有新增卡片的功能

}
init()

//-----------------以下未改
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









