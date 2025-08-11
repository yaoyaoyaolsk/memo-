承知いたしました。
ご提示いただいた複数の変更点を反映させたコードを提供します。

今回の変更点は以下の通りです。

    金額入力: カンマが含まれていても、数字として正しく認識されるようになります。

    金額表示: リストと合計金額が、カンマと**¥**付きで表示されるようになります。

    日付表示: 期間ごとのヘッダーに年が表示され、個々のリストの日付は「月日」のみ表示されます。

1. index.html (変更後)

HTMLの変更はありません。前回のコードをそのままお使いいただけます。

2. script.js (変更後)

金額の入力と表示、日付の表示形式を修正しました。
JavaScript

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
                const row = createRecordRow(record, false); // falseで日付をフル表示
                recordTableBody.appendChild(row);
            });
        } else {
            const groupedRecords = groupRecordsByDate(filteredRecords, displayMode);
            for (const key in groupedRecords) {
                const periodHeader = document.createElement('tr');
                periodHeader.classList.add('period-header');
                const headerText = `${key}の合計: ${groupedRecords[key].total.toLocaleString()}円`;
                periodHeader.innerHTML = `<td colspan="8"><h3>¥${headerText}</h3></td>`;
                recordTableBody.appendChild(periodHeader);
                
                groupedRecords[key].records.forEach(record => {
                    const row = createRecordRow(record, true); // trueで日付を月日表示
                    recordTableBody.appendChild(row);
                });
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

    function createRecordRow(record, isShortDate) {
        const row = document.createElement('tr');
        const displayDate = isShortDate ? record.date.substring(5) : record.date; // 5文字目から取得 (MM-DD)
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
                key = record.date.substring(0, 4) + '年';
            } else if (type === 'month') {
                key = record.date.substring(0, 7).replace('-', '年') + '月';
            } else if (type === 'day') {
                key = record.date.replace(/-/g, '/');
            }
            
            if (!groups[key]) {
                groups[key] = { total: 0, records: [] };
            }
            groups[key].total += record.price;
            groups[key].records.push(record);
            return groups;
        }, {});
    }

    // ジャンルの追加
    addGenreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newGenre = newGenreNameInput.value.trim();
        if (newGenre && !genres.includes(newGenre)) {
            genres.push(newGenre);
            renderGenres();
            renderRecords();
            addGenreForm.reset();
        }
    });

    // ジャンルのリネーム
    renameGenreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldGenre = renameGenreSelect.value;
        const newGenre = renamedGenreNameInput.value.trim();
        if (oldGenre && newGenre && !genres.includes(newGenre)) {
            const index = genres.indexOf(oldGenre);
            if (index > -1) {
                genres[index] = newGenre;
                records.forEach(record => {
                    if (record.category === oldGenre) {
                        record.category = newGenre;
                    }
                });
                renderGenres();
                renderRecords();
                renameGenreForm.reset();
            }
        }
    });

    // ジャンルの削除
    deleteGenreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const genreToDelete = deleteGenreSelect.value;
        if (genreToDelete) {
            const index = genres.indexOf(genreToDelete);
            if (index > -1) {
                genres.splice(index, 1);
                records.forEach(record => {
                    if (record.category === genreToDelete) {
                        record.category = 'その他';
                    }
                });
                renderGenres();
                renderRecords();
                deleteGenreForm.reset();
            }
        }
    });

    // 支払い方法の追加
    addPaymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPayment = newPaymentNameInput.value.trim();
        if (newPayment && !payments.includes(newPayment)) {
            payments.push(newPayment);
            renderPayments();
            renderRecords();
            addPaymentForm.reset();
        }
    });

    // 支払い方法のリネーム
    renamePaymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPayment = renamePaymentSelect.value;
        const newPayment = renamedPaymentNameInput.value.trim();
        if (oldPayment && newPayment && !payments.includes(newPayment)) {
            const index = payments.indexOf(oldPayment);
            if (index > -1) {
                payments[index] = newPayment;
                records.forEach(record => {
                    if (record.payment === oldPayment) {
                        record.payment = newPayment;
                    }
                });
                renderPayments();
                renderRecords();
                renamePaymentForm.reset();
            }
        }
    });

    // 支払い方法の削除
    deletePaymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const paymentToDelete = deletePaymentSelect.value;
        if (paymentToDelete) {
            const index = payments.indexOf(paymentToDelete);
            if (index > -1) {
                payments.splice(index, 1);
                records.forEach(record => {
                    if (record.payment === paymentToDelete) {
                        record.payment = 'その他';
                    }
                });
                renderPayments();
                renderRecords();
                deletePaymentForm.reset();
            }
        }
    });

    // フォーム送信時の処理
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const priceValue = itemPrice.value.replace(/,/g, ''); // カンマを削除
        const newRecord = {
            name: itemName.value,
            maker: itemMaker.value,
            price: parseInt(priceValue),
            date: itemDate.value,
            category: itemCategory.value,
            payment: itemPayment.value,
            notes: itemNotes.value
        };
        records.push(newRecord);
        renderRecords();
        form.reset();
    });

    // データの削除
    recordTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const index = e.target.dataset.index;
            records.splice(index, 1);
            renderRecords();
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
        renderRecords();
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
        renderRecords();
    });

    // ジャンルでフィルタリング
    filterCategorySelect.addEventListener('change', () => {
        renderRecords();
    });

    // 表示方法の変更を監視
    displayModeSelect.addEventListener('change', () => {
        renderRecords();
    });

    // ページロード時に初期データを表示
    renderGenres();
    renderPayments();
    renderRecords();
});
