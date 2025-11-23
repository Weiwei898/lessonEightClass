// 管理後台共用變數 / 環境設定
// 說明：保留 admin 需要的 baseURL / api_path / token；
// 同時移除從前端 `index.js` 複製過來但在後台未使用的 DOM 與 customer API 變數，避免混淆。
const baseURL = "https://livejs-api.hexschool.io";
const api_path = "h2cjdqaay3mbskg25gmawhsue4u2";
const token = "H2CjDqAAy3MBSkG25GMawhSUe4u2";
window.latestOrderData = null; // 用於儲存最新的訂單資料（供除錯或其他功能使用）


// C3.js
// 初始化兩張 c3 圓餅圖：一張綁到 #chart（全品項營收），一張綁到 #chart-record（類別營收）
let chart = c3.generate({
  bindto: '#chart',
  data: { type: 'pie', columns: [], colors: {} },
});

let chartRecord = c3.generate({
  bindto: '#chart-record',
  data: { type: 'pie', columns: [], colors: {} },
});

// C3.js 圖表調整大小函式
// 確保您在 HTML 底部有引入 Bootstrap 5 的 JS (您沒有提供，但這是 Tab 功能運行所必需的)

// 監聽「全產品類別營收比重」Tab 頁籤被顯示出來的事件
// 找到對應的 Tab 按鈕，它的 id 是 pills-record-tab
const recordTabButton = document.getElementById('pills-record-tab');
if (recordTabButton) {
  // 使用 'shown.bs.tab' 事件來監聽 Tab 頁籤從隱藏變為顯示
  recordTabButton.addEventListener('shown.bs.tab', function (e) {
    // 當 Tab 顯示後，強制 chartRecord 重新調整大小
    // 這會讓圖表根據新的容器尺寸（現在是可見的）正確計算和置中
    chartRecord.resize();
  });
}

// 監聽「全品項營收比重」Tab 頁籤被顯示出來的事件 (雖然這個是預設顯示的，但切回來時可能也需要)
// 找到對應的 Tab 按鈕，它的 id 是 pills-info-tab
const infoTabButton = document.getElementById('pills-info-tab');
if (infoTabButton) {
  // 使用 'shown.bs.tab' 事件
  infoTabButton.addEventListener('shown.bs.tab', function (e) {
    // 當 Tab 顯示後，強制 chart 重新調整大小
    chart.resize();
  });
}

// 取得訂單列表
// 說明：向 admin API 抓取所有訂單，成功後會將資料存到 `window.latestOrderData`，
// 並呼叫 `renderOrderTable` 與 `updateCharts` 更新畫面與圖表。
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, { headers: { 'Authorization': token } })
    .then(function (response) {
      const orders = response.data.orders || response.data;
      // save for later use
      window.latestOrderData = orders;
      // render table
      renderOrderTable(orders);
      // update charts
      updateCharts(orders);
    })
    .catch(function(err){
      console.error('getOrderList error', err);
    })
}

// render order table into .orderPage-table tbody
// 說明：此函式會把從 API 拿到的訂單陣列渲染成 table 的 tbody。
// 每筆訂單會嘗試兼容不同結構（order.products / order.carts / order.items），並格式化建立時間。
function renderOrderTable(orders){
  // 找到頁面上所有的 order table（可能有多個 tab，各自有 table）
  // 修正：原本只選第一個 table，導致第二個 tab 的表格不會被更新，
  // 因此改為 querySelectorAll 並把相同的 rows 載入到每個 table 的 tbody
  const tables = document.querySelectorAll('.orderPage-table');
  if (!tables || !tables.length) return;
  // 組出所有訂單的列字串
  let rows = '';
  orders.forEach(order => {
    const id = order.id || order.orderId || '';
    const user = order.user || order.contact || {};
    const name = user.name || (order.user && order.user.name) || '';
    const tel = user.tel || user.phone || '';
    const address = (user.address) || '';
    const email = user.email || '';
    // products may be in order.products or order.carts
    const items = order.products || order.carts || order.items || [];
    const titles = items.map(it => (it.product && it.product.title) || it.title || it.name || '').join('<br>');
    const createdAt = order.createdAt || order.created_at || order.created || '';
    // format date: support ISO string, milliseconds, or seconds
    const formatDate = (ts) => {
      if (!ts) return '';
      // if ts is number-like string, try convert
      const asNum = Number(ts);
      if (!isNaN(asNum)) {
        // if seconds (10 digits), convert to ms
        if (asNum < 1e12) {
          return new Date(asNum * 1000).toLocaleDateString();
        }
        return new Date(asNum).toLocaleDateString();
      }
      // fallback: try Date parsing for strings
      const d = new Date(ts);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
    };
    const dateStr = formatDate(createdAt);
    const paid = order.paid || false;

    rows += `
      <tr data-id="${id}">
        <td>${id}</td>
        <td>
          <p>${name}</p>
          <p>${tel}</p>
        </td>
        <td>${address}</td>
        <td>${email}</td>
        <td>${titles}</td>
        <td>${dateStr}</td>
        <td class="orderStatus"><a href="#" data-id="${id}" class="togglePaid">${paid? '已處理':'未處理'}</a></td>
        <td><input type="button" class="delSingleOrder-Btn" data-id="${id}" value="刪除"></td>
      </tr>`;
  });
  // 注意：不要使用未定義的 `tbody` 變數（先前遺留導致 ReferenceError）
  // 將同樣的 rows 載入到每個 table 的 tbody 中
  tables.forEach(table => {
    let tbody = table.querySelector('tbody');
    if(!tbody){
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }
    tbody.innerHTML = rows;
  });
  // NOTE: 已移除 admin.html 中的靜態範例列，tbody 會由此函式動態產生內容。
}

// Helper: safely get numeric value
function toNumber(v){
  const n = Number(v);
  return isNaN(n)?0:n;
}

// Update both charts based on orders
// 說明：根據目前的訂單資料計算
//  - `categoryMap`：各分類（床架/收納/窗簾/其他）的營收
//  - `productMap`：每個品項的營收，取 top3，其他歸為 '其他'
// 然後把計算結果載入到 c3 圓餅圖中。
function updateCharts(orders){
  if(!orders || !orders.length) {
    chart.load({ columns: [], unload: true });
    chartRecord.load({ columns: [], unload: true });
    return;
  }
  // 全產品類別營收比重：床架/收納/窗簾/其他
  const categoryMap = { '床架':0, '收納':0, '窗簾':0, '其他':0 };

  // 全品項營收：按品項 title 加總
  const productMap = {};

  orders.forEach(order => {
    const items = order.products || order.carts || order.items || [];
    items.forEach(it => {
      const product = it.product || it;
      const title = product.title || product.name || '';
      const category = product.category || product.cat || '';
      const price = toNumber(product.price || it.price || 0);
      const qty = toNumber(it.quantity || it.qty || 1);
      const rev = price * qty;

      // productMap
      if(title){
        productMap[title] = (productMap[title] || 0) + rev;
      }

      // categoryMap classification
      const cat = (category || '').toString();
      if(cat.includes('床') || cat === '床架') categoryMap['床架'] += rev;
      else if(cat.includes('收納')) categoryMap['收納'] += rev;
      else if(cat.includes('窗') || cat.includes('窗簾')) categoryMap['窗簾'] += rev;
      else categoryMap['其他'] += rev;
    });
  });

  // build columns for category chart
  const categoryColumns = Object.keys(categoryMap).map(k => [k, toNumber(categoryMap[k])]);
  // colors
  const categoryColors = { '床架':'#DACBFF','收納':'#9D7FEA','窗簾':'#5434A7','其他':'#301E5F' };

  // build product columns: take top 3, others aggregated into '其他'
  const products = Object.keys(productMap).map(k => ({ title:k, val: productMap[k] }));
  products.sort((a,b)=> b.val - a.val);
  const top = products.slice(0,3);
  const rest = products.slice(3);
  const otherSum = rest.reduce((s,i)=>s + i.val, 0);
  const productColumns = top.map(p=> [p.title, toNumber(p.val)]);
  if(otherSum > 0) productColumns.push(['其他', toNumber(otherSum)]);

  // build colors dynamically for product chart (reuse categoryColors for '其他')
  const productColors = {};
  top.forEach((p,i)=>{
    // assign some palette, reusing a few colors
    const palette = ['#DACBFF','#9D7FEA','#5434A7'];
    productColors[p.title] = palette[i % palette.length];
  });
  if(otherSum>0) productColors['其他'] = '#301E5F';

  // load to charts
  chart.load({ columns: productColumns, unload: true, colors: productColors });
  chartRecord.load({ columns: categoryColumns, unload: true, colors: categoryColors });
}

// 修改訂單狀態
// 說明：將指定訂單標記為已處理 (paid: true)，成功後重新抓取訂單更新畫面。

function editOrderList(orderId) {
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": true
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      // update list & charts
      getOrderList();
    })
}

// 刪除全部訂單
// 說明：呼叫 admin 的 DELETE /orders，將會刪除所有訂單（不可復原），完成後重新抓取資料。
function deleteAllOrder() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      getOrderList();
    })
}

// 刪除特定訂單
// 說明：呼叫 DELETE /orders/:id，刪除單筆訂單，成功後重新抓取資料。
function deleteOrderItem(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      getOrderList();
    })
}

// 事件代理：處理刪除、切換狀態等
// 說明：使用 document 代理監聽，避免對大量動態產生的按鈕綁定過多 listener。
document.addEventListener('click', function(e){
  const delBtn = e.target.closest('.delSingleOrder-Btn');
  if(delBtn){
    const id = delBtn.dataset.id;
    if(id && confirm('確認刪除此訂單？')) deleteOrderItem(id);
  }
  const toggle = e.target.closest('.togglePaid');
  if(toggle){
    e.preventDefault();
    const id = toggle.dataset.id;
    if(id){
      editOrderList(id);
    }
  }
  // 清除全部訂單按鈕 (委派處理)
  const clearAll = e.target.closest('.discardAllBtn');
  if (clearAll) {
    e.preventDefault();
    if (confirm('確認刪除所有訂單？此動作無法復原。')) {
      deleteAllOrder();
    }
  }
});

// 初始載入（需有管理員 token）
// 說明：若 token 不存在，會顯示頁面提示並跳過 API 呼叫，避免出現 403 錯誤。
if (!token) {
  console.warn('Admin token not found in localStorage. Skipping admin API calls.');
  // 在頁面上顯示提示，方便測試與除錯
  const container = document.querySelector('.wrap') || document.body;
  const warn = document.createElement('div');
  warn.style.color = '#C72424';
  warn.style.textAlign = 'center';
  warn.style.margin = '12px 0';
  warn.textContent = '管理後台無 token，請先登入或在 console 執行 localStorage.setItem("token","<YOUR_TOKEN>") 以測試。';
  container.insertBefore(warn, container.firstChild);
} else {
  getOrderList();
}

