document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('record-form');
    const itemName = document.getElementById('item-name');
    const itemMaker = document.getElementById('item-maker');
    const itemPrice = document.getElementById('item-price');
    const itemDate = document.getElementById('item-date');
    const itemCategory = document.getElementById('item-category');
    const itemPayment = document.getElementById('item-payment');
    const itemNotes = document.getElementById('item-notes');
    const recordTableBody = document.querySelector('#record-table tbody');
    const totalPriceSpan = document.getElementById('total-price');
    const categorySummaryDiv = document.getElementById('category-summary');
    const sortDateButton = document.getElementById('sort-date');
    const sortPriceButton = document.getElementById('sort-price');
    const filterCategorySelect = document.getElementById('filter-category');
    const displayModeSelect = document.getElementById('display-mode-select');

    // タブ関連の要素
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // ジャンル管理関連の要素
    const genreListUl = document.getElementById('genre-list');
    const addGenreForm = document.getElementById('add-genre-form');
    const newGenreNameInput = document.getElementById('new-genre-name');
    const renameGenreForm = document.getElementById('rename-genre-form');
    const renameGenreSelect = document.getElementById('rename-genre-select');
    const renamedGenreNameInput = document.getElementById('renamed-genre-name');
    const deleteGenreForm = document.getElementById('delete-genre-form');
    const deleteGenreSelect = document.getElementById('delete-genre-select');

    // 支払い方法管理関連の要素
    const paymentListUl = document.getElementById('payment-list');
    const addPaymentForm = document.getElementById('add-payment-form');
    const newPaymentNameInput = document.getElementById('new-payment-name');
    const renamePaymentForm = document.getElementById('rename-payment-form');
    const renamePaymentSelect = document.getElementById('rename-payment-select');
    const renamedPaymentNameInput = document.getElementById('renamed-payment-name');
    const deletePaymentForm = document.getElementById('delete-payment-form');
    const deletePaymentSelect = document.getElementById('delete-payment-select');

    let records = JSON.parse(localStorage.getItem('purchaseRecords')) || [];
    let genres = JSON.parse(localStorage.getItem('genres')) || ['食費', '日用品', '娯楽', 'その他'];
    let payments = JSON.parse(localStorage.getItem('payments')) || ['現金', 'クレジットカード', '電子マネー'];
    let isAscendingDate = true;
    let isAscendingPrice = true;

    // タブ切り替え機能
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ジャンルの表示と更新
    function renderGenres() {
        // ジャンルリストの表示
        genreListUl.innerHTML = '';
        genres.forEach(genre => {
            const li = document.createElement('li');
            li.textContent = genre;
            genreListUl.appendChild(li);
        });

        // フォームとフィルターのセレクトボックスを更新
        [itemCategory, filterCategorySelect, renameGenreSelect, deleteGenreSelect].forEach(select => {
            select.innerHTML = '';
            // フィルター用には「全て」を追加
            if (select.id === 'filter-category') {
                const option = document.createElement('option');
                option.value = 'all';
                option.textContent = '全て';
                select.appendChild(option);
            }
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre;
                select.appendChild(option);
            });
        });

        localStorage.setItem('genres', JSON.stringify(genres));
    }

    // 支払い方法の表示と更新
    function renderPayments() {
        // 支払い方法リストの表示
        paymentListUl.innerHTML = '';
        payments.forEach(payment => {
            const li = document.createElement('li');
            li.textContent = payment;
            paymentListUl.appendChild(li);
        });

        // フォームのセレクトボックスを更新
        [itemPayment, renamePaymentSelect, deletePaymentSelect].forEach(select => {
            select.innerHTML = '';
            payments.forEach(payment => {
                const option = document.createElement('option');
                option.value = payment;
                option.textContent = payment;
                select.appendChild(option);
            });
        });

        localStorage.setItem('payments', JSON.stringify(payments));
    }

    // データの表示と集計
    function renderRecords() {
        recordTableBody.innerHTML = '';
        let totalPrice = 0;
        const categoryTotals = {};
        
        const currentCategoryFilter = filterCategorySelect.value;
        const filteredRecords = records.filter(record => 
            currentCategoryFilter === 'all' || record.category === currentCategoryFilter
        );

        const displayMode = displayModeSelect.value;

        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (displayMode === 'flat') {
            filteredRecords.forEach(record => {
                const row = createRecordRow(record);
                recordTableBody.appendChild(row);
            });
        } else {
            const groupedRecords = groupRecordsByDate(filteredRecords, displayMode);
            let lastHeaderKey = '';

            for (const key in groupedRecords) {
                const year = key.substring(0, 4);
                if (displayMode === 'month' && year !== lastHeaderKey.substring(0, 4)) {
                    const yearHeader = document.createElement('tr');
                    yearHeader.classList.add('period-header');
                    yearHeader.innerHTML = `<td colspan="8"><h3>${year}年</h3></td>`;
                    recordTableBody.appendChild(yearHeader);
                }
                
                const periodHeader = document.createElement('tr');
                periodHeader.classList.add('period-header');
                let headerText = '';

                if (displayMode === 'day') {
                    headerText = `${key}の合計: ¥${groupedRecords[key].total.toLocaleString()}`;
                } else if (displayMode === 'month') {
                    headerText = `${key}の合計: ¥${groupedRecords[key].total.toLocaleString()}`;
                } else if (displayMode === 'year') {
                    headerText = `${key}の合計: ¥${groupedRecords[key].total.toLocaleString()}`;
                }
                periodHeader.innerHTML = `<td colspan="8"><h4>${headerText}</h4></td>`;
                recordTableBody.appendChild(periodHeader);
                
                groupedRecords[key].records.forEach(record => {
                    const row = createRecordRow(record, displayMode);
                    recordTableBody.appendChild(row);
                });

                lastHeaderKey = key;
            }
        }
        
        records.forEach(record => {
            totalPrice += record.price;
            if (categoryTotals[record.category]) {
                categoryTotals[record.category] += record.price;
            } else {
                categoryTotals[record.category] = record.price;
            }
        });

        totalPriceSpan.textContent = `¥${totalPrice.toLocaleString()}`;
        
        categorySummaryDiv.innerHTML = '<h4>ジャンルごとの合計</h4>';
        for (const category in categoryTotals) {
            const p = document.createElement('p');
            p.textContent = `${category}: ¥${categoryTotals[category].toLocaleString()}`;
            categorySummaryDiv.appendChild(p);
        }

        localStorage.setItem('purchaseRecords', JSON.stringify(records));
    }

    function createRecordRow(record, displayMode) {
        const row = document.createElement('tr');
        let displayDate = record.date;
        if (displayMode === 'day' || displayMode === 'month') {
             const parts = record.date.split('-');
             displayDate = `${parts[1]}月${parts[2]}日`;
        }
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.maker || ''}</td>
            <td>¥${record.price.toLocaleString()}</td>
            <td>${displayDate}</td>
            <td>${record.category}</td>
            <td>${record.payment || ''}</td>
            <td>${record.notes || ''}</td>
            <td><button class="delete-button" data-index="${records.indexOf(record)}">削除</button></td>
        `;
        return row;
    }

    function groupRecordsByDate(data, type) {
        return data.reduce((groups, record) => {
            let key;
            if (type === 'year') {
                key = record.date.substring(0, 4);
            } else if (type === 'month') {
                key = record
