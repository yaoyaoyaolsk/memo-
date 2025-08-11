document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('record-form');
    const itemName = document.getElementById('item-name');
    const itemPrice = document.getElementById('item-price');
    const itemDate = document.getElementById('item-date');
    const itemCategory = document.getElementById('item-category');
    const recordTableBody = document.querySelector('#record-table tbody');
    const totalPriceSpan = document.getElementById('total-price');
    const categorySummaryDiv = document.getElementById('category-summary');
    const sortDateButton = document.getElementById('sort-date');
    const sortPriceButton = document.getElementById('sort-price');
    const filterCategorySelect = document.getElementById('filter-category');


    let records = JSON.parse(localStorage.getItem('purchaseRecords')) || [];
    let isAscendingDate = true;
    let isAscendingPrice = true;


    // データの表示と集計
    function renderRecords(data) {
        recordTableBody.innerHTML = '';
        let totalPrice = 0;
        const categoryTotals = {};
        
        data.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.price}</td>
                <td>${record.date}</td>
                <td>${record.category}</td>
                <td><button class="delete-button" data-index="${index}">削除</button></td>
            `;
            recordTableBody.appendChild(row);
            totalPrice += record.price;


            if (categoryTotals[record.category]) {
                categoryTotals[record.category] += record.price;
            } else {
                categoryTotals[record.category] = record.price;
            }
        });


        totalPriceSpan.textContent = totalPrice.toLocaleString();
        
        // カテゴリーごとの合計金額を表示
        categorySummaryDiv.innerHTML = '<h4>ジャンルごとの合計</h4>';
        for (const category in categoryTotals) {
            const p = document.createElement('p');
            p.textContent = `${category}: ${categoryTotals[category].toLocaleString()} 円`;
            categorySummaryDiv.appendChild(p);
        }


        localStorage.setItem('purchaseRecords', JSON.stringify(records));
    }


    // フォーム送信時の処理
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRecord = {
            name: itemName.value,
            price: parseInt(itemPrice.value),
            date: itemDate.value,
            category: itemCategory.value
        };
        records.push(newRecord);
        renderRecords(records);
        form.reset();
    });


    // データの削除
    recordTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const index = e.target.dataset.index;
            records.splice(index, 1);
            renderRecords(records);
        }
    });


    // 日付でソート
    sortDateButton.addEventListener('click', () => {
        records.sort((a, b) => {
            if (isAscendingDate) {
                return new Date(a.date) - new Date(b.date);
            } else {
                return new Date(b.date) - new Date(a.date);
            }
        });
        isAscendingDate = !isAscendingDate;
        renderRecords(records);
    });


    // 金額でソート
    sortPriceButton.addEventListener('click', () => {
        records.sort((a, b) => {
            if (isAscendingPrice) {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });
        isAscendingPrice = !isAscendingPrice;
        renderRecords(records);
    });


    // ジャンルでフィルタリング
    filterCategorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        let filteredRecords = records;
        if (category !== 'all') {
            filteredRecords = records.filter(record => record.category === category);
        }
        renderRecords(filteredRecords);
    });


    // ページロード時に初期データを表示
    renderRecords(records);
});