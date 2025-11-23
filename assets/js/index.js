const productWrap = document.querySelector('.productWrap');//宣告DOM產品卡片 渲染畫面用(產品內容)
const productSelect = document.querySelectorAll('.productSelect');//宣告DOM篩選區域

const cartList = document.querySelector('.cartList');// 宣告DOM購物車清單 (tbody)
const totalPrice = document.querySelector('.shoppingCart-table tfoot td:last-child'); // 宣告DOM購物車總計金額
const discardAllBtn = document.querySelector('.discardAllBtn');//宣告DOM購物車刪除所有產品
const addOrderBtn = document.querySelector('.orderInfo-btn');//宣告DOM送出預訂資料
let latestOrderData = null; // 用於儲存最新的訂單資料

//通用API路徑
const baseURL = "https://livejs-api.hexschool.io";
const api_path = "h2cjdqaay3mbskg25gmawhsue4u2";
//const token = "h2cjdqaay3mbskg25gmawhsue4u2";
// 取得產品列表API
const productsUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/products`;
// 加入購物車API
const addCartUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/carts`;
// 取得購物車列表API
const getCartUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/carts`;
// 清除購物車內全部產品API
const deleteAllCartUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/carts`;
// 送出購買訂單API
const addOrderUrl = `${baseURL}/api/livejs/v1/customer/${api_path}/orders`;


// 取得產品列表
function getProductList() {
  axios.get(productsUrl).
    then(function (response) {
      const productsData = response.data.products;
      getProductsData(productsData); //渲染畫面(產品內容)
      setFilter(productsData) //渲染畫面(篩選的產品內容)
    })
    .catch(function (error) {
      console.log(error)
    })
}

//渲染畫面(產品內容)在getProductList()執行
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
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3 class="ticket-name">${item.title}</h3>
            <del class="originPrice">${formattedOriginPrice}</del>
            <p class="nowPrice">${formattedNowPrice}</p>
          </li>
        `;
  });
  productWrap.innerHTML = arr;

}

// 設定篩選功能在getProductList()執行
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

// 加入購物車
function addCartItem(id) {
  axios.post(addCartUrl, {
    data: {
      "productId": id, // 商品 id
      "quantity": 1 // 預設數量為 1
    }
  }).
    then(function (response) {
      getCartList();
    })
    .catch(function (error) {
      console.log(error)
    })
}

// 共用：格式化金額（新增，供多處使用）
function formatCurrency(value) {
  const number = Number(value);
  if (typeof number !== 'number' || isNaN(number)) {
    return '$NT 0';
  }
  return number.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'NTD',
    minimumFractionDigits: 0
  }).replace('NTD', 'NT$');
}

// 取得購物車列表（修正：同時處理 API 回傳的 finalTotal）
function getCartList() {
  axios.get(getCartUrl)
    .then(function (response) {
      let cartData = response.data.carts;
      // 呼叫渲染購物車畫面，並將 API 的 finalTotal 傳入
      renderCart(cartData, response.data.finalTotal);
    })
    .catch(function (error) {
      console.log(error)
    })
}

//渲染畫面(產品內容)在getCartList()執行
function renderCart(cartData, finalTotal) {
  let arr = "";
  cartData.forEach((item) => {
    // 假設 API 每個 cart item 有: id, title, images, price, quantity
    const unitPrice = item.price || (item.product && item.product.price) || 0;
    const qty = item.qty || item.quantity || 1;
    const amount = unitPrice * qty;
    const formattedNowPrice = formatCurrency(unitPrice);
    const formattedAmount = formatCurrency(amount);
    arr += `
          <tr class="border-top border-bottom border-secondary">
            <td>
              <div class="cardItem-title">
                <img src="${item.images || (item.product && item.product.images) || ''}" alt="">
                <p>${item.title || (item.product && item.product.title) || ''}</p>
              </div>
            </td>
            <td>${formattedNowPrice}</td>
            <td>${qty}</td>
            <td>${formattedAmount}</td>
            <td class="discardBtn">
              <!-- 新增 data-id 屬性供刪除 API 使用 (修改) -->
              <a href="#" class="material-icons" data-id="${item.id}">clear</a>
            </td>
          </tr>
        `;
  });
  // 修正：把內容輸出到正確的 tbody dom
  if (cartList) cartList.innerHTML = arr;

  // 顯示 API 小計 (finalTotal)，如果存在則格式化並顯示
  if (typeof finalTotal !== 'undefined' && totalPrice) {
    totalPrice.textContent = formatCurrency(finalTotal);
  }
}


// 清除購物車內全部產品
function deleteAllCartList() {
  axios.delete(deleteAllCartUrl)
    .then(function (response) {
      // 刪除成功後重新抓購物車
      getCartList();
    })
    .catch(function (error) {
      console.log(error)
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  if (!cartId) return;
  axios.delete(`${baseURL}/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      // 刪除成功後重新取得購物車
      getCartList();
    })
    .catch(function (error) {
      console.log(error)
    })
}

// 事件代理：購物車內刪除按鈕
if (cartList) {
  cartList.addEventListener('click', function (e) {
    e.preventDefault();
    const target = e.target;
    // 檢查是否點擊到刪除按鈕上的 <a>，或其子元素
    const btn = target.closest('a[data-id]');
    if (btn) {
      const id = btn.dataset.id;
      deleteCartItem(id);
    }
  });
}

// 綁定刪除全部按鈕
if (discardAllBtn) {
  discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    // 可加上確認
    if (confirm('確認要刪除所有購物車品項嗎？')) {
      deleteAllCartList();
    }
  });
}

// 送出購買訂單
// 送出購買訂單（修改：改為接收表單傳入的 userData，並在成功後重新取得購物車）
function createOrder(userData) {
  // 傳入的 userData 應為 { name, tel, email, address, payment }
  const payload = {
    data: {
      user: userData || {
        name: "六角學院",
        tel: "07-5313506",
        email: "hexschool@hexschool.com",
        address: "高雄市六角學院路",
        payment: "Apple Pay"
      }
    }
  };

  axios.post(addOrderUrl, payload)
    .then(function (response) {
      // 訂單送出成功，顯示提示並重新取得購物車（API 通常會清空購物車或回傳新狀態）
      getCartList();
      latestOrderData = response.data;
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error.response ? error.response.data : error);
    });
}

// 送出預訂資料
if (addOrderBtn) {
  addOrderBtn.addEventListener('click', e => {
    // 取消瀏覽器對特定事件的預設處理方式，執行自己的程式碼
    e.preventDefault();
    const nameEl = document.querySelector('#customerName');
    const phoneEl = document.querySelector('#customerPhone');
    const emailEl = document.querySelector('#customerEmail');
    const addressEl = document.querySelector('#customerAddress');
    const payEl = document.querySelector('#tradeWay');

    // 修改：改為使用頁面上的提示區塊顯示錯誤訊息（優先使用 .alert-message p），若不存在則 fallback 到 .orderInfo-message
    const messageElements = document.querySelectorAll('.alert-message p');
    let isValid = true;

    // 若找不到 .alert-message p，改用頁面上已有的 .orderInfo-message（舊版樣式）
    const usedMessageEls = messageElements.length ? messageElements : document.querySelectorAll('.orderInfo-message');

    // 清空所有舊的錯誤提示
    usedMessageEls.forEach(p => p.innerHTML = '');
    // 清除先前的輸入錯誤樣式
    document.querySelectorAll('.orderInfo-input--error').forEach(el => el.classList.remove('orderInfo-input--error'));

    // 未輸入資料的提示：針對每個欄位尋找對應的訊息顯示節點（附近的 .orderInfo-message 或具有 data-message 的節點）
    const setFieldMessage = (inputEl, defaultLabel, msg) => {
      if (!inputEl) return;
      // 優先找尋同一 inputWrap 底下的提示元素
      const wrap = inputEl.closest('.orderInfo-inputWrap');
      let msgEl = null;
      if (wrap) msgEl = wrap.querySelector('.orderInfo-message');
      // 若沒找到，再找具有對應 data-message 的元素
      if (!msgEl) msgEl = document.querySelector(`.orderInfo-message[data-message="${defaultLabel}"]`);
      // 最後 fallback 到頁面上第一個可用的提示元素
      if (!msgEl && usedMessageEls.length) msgEl = usedMessageEls[0];
      if (msgEl) msgEl.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>${msgEl.dataset.message || defaultLabel}<span>${msg}</span>`;
    };

    if (!nameEl || !phoneEl || !emailEl || !addressEl) {
      alert('找不到表單欄位，請確認 DOM 結構。');
      return;
    }

    if (!nameEl.value.trim()) {
      setFieldMessage(nameEl, '姓名', '必填');
      // 將輸入框加上錯誤樣式
      nameEl.classList.add('orderInfo-input--error');
      isValid = false;
    }
    if (!phoneEl.value.trim()) {
      setFieldMessage(phoneEl, '電話', '必填');
      phoneEl.classList.add('orderInfo-input--error');
      isValid = false;
    }
    if (!emailEl.value.trim()) {
      setFieldMessage(emailEl, 'Email', '必填');
      emailEl.classList.add('orderInfo-input--error');
      isValid = false;
    }
    if (!addressEl.value.trim()) {
      setFieldMessage(addressEl, '寄送地址', '必填');
      addressEl.classList.add('orderInfo-input--error');
      isValid = false;
    }

    if (!isValid) return; // 若有欄位未通過，停止送出

    const userData = {
      name: nameEl.value.trim(),
      tel: phoneEl.value.trim(),
      email: emailEl.value.trim(),
      address: addressEl.value.trim(),
      payment: payEl ? payEl.value : 'ATM'
    };

    // 呼叫 createOrder 並送出表單資料（createOrder 會在成功後重新取得購物車）
    createOrder(userData);

    // 清空表單
    const orderForm = document.querySelector('.orderInfo-form');
    if (orderForm) orderForm.reset();
  });
}

// 將事件委派單獨出來，只執行一次
function setupProductEvents() {
    if (productWrap) {
        productWrap.addEventListener('click', function (e) {
            // 檢查是否點擊到「加入購物車」按鈕
            if (e.target.classList.contains('addCardBtn')) {
                e.preventDefault();
                // 獲取產品 ID
                addCartItem(e.target.dataset.id);
            }
        });
    }
}

//執行
function init() {
  getProductList()//從data取得產品列表
  getCartList()//從data取得購物車列表
  setupProductEvents(); // 確保這裡只執行一次事件綁定
}
init()







