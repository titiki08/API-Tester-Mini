document.addEventListener('DOMContentLoaded', () => {
    let lastResponseBody = '';

    // History Logic
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    let historyData = JSON.parse(localStorage.getItem('apiHistory') || '[]');

    function saveHistory(method, url, statusCode) {
        if (historyData.length > 0 && historyData[0].url === url && historyData[0].method === method) {
            historyData[0].statusCode = statusCode;
        } else {
            historyData.unshift({ method, url, statusCode });
            if (historyData.length > 50) historyData.pop();
        }
        localStorage.setItem('apiHistory', JSON.stringify(historyData));
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        historyData.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            let statusColor = 'var(--text-muted)';
            if (item.statusCode >= 200 && item.statusCode < 300) statusColor = 'var(--color-get)';
            else if (item.statusCode >= 400) statusColor = 'var(--color-delete)';

            li.innerHTML = `
                <div class="history-item-top">
                    <span class="history-method ${item.method}">${item.method}</span>
                    <span class="history-status" style="color: ${statusColor}">${item.statusCode === 0 ? 'ERR' : item.statusCode}</span>
                </div>
                <div class="history-url" title="${item.url}">${item.url}</div>
            `;
            
            li.addEventListener('click', () => {
                const methodSelect = document.getElementById('method');
                methodSelect.value = item.method;
                methodSelect.setAttribute('data-method', item.method);
                document.getElementById('url').value = item.url;
            });
            historyList.appendChild(li);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if(confirm('Are you sure you want to clear history?')) {
                historyData = [];
                localStorage.removeItem('apiHistory');
                renderHistory();
            }
        });
    }

    renderHistory();

    // Tab switching logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.tabs-container');
            const targetId = btn.getAttribute('data-target');
            
            // Remove active class from all buttons and contents in this container
            parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and target content
            btn.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Method color update
    const methodSelect = document.getElementById('method');
    methodSelect.addEventListener('change', (e) => {
        e.target.setAttribute('data-method', e.target.value);
    });

    // Key-Value Rows Management
    function setupKeyValueList(listId) {
        const list = document.getElementById(listId);
        
        list.addEventListener('input', (e) => {
            if (e.target.classList.contains('kv-key') || e.target.classList.contains('kv-value')) {
                const row = e.target.closest('.key-value-row');
                
                // If typing in the last row, add a new one
                if (row === list.lastElementChild && (e.target.value.trim() !== '')) {
                    row.classList.remove('new-row');
                    const newRow = document.createElement('div');
                    newRow.className = 'key-value-row new-row';
                    newRow.innerHTML = `
                        <input type="text" class="kv-key" placeholder="Key" />
                        <input type="text" class="kv-value" placeholder="Value" />
                        <button type="button" class="kv-delete" title="Delete">×</button>
                    `;
                    list.appendChild(newRow);
                }
            }
        });

        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('kv-delete')) {
                const row = e.target.closest('.key-value-row');
                // Don't delete if it's the last empty row
                if (list.children.length > 1 && !row.classList.contains('new-row')) {
                    row.remove();
                } else if (list.children.length === 1 || row.classList.contains('new-row')) {
                    // Just clear it
                    row.querySelector('.kv-key').value = '';
                    row.querySelector('.kv-value').value = '';
                }
            }
        });
    }

    setupKeyValueList('paramsList');
    setupKeyValueList('headersList');

    // Sync Params with URL
    const urlInput = document.getElementById('url');
    const paramsList = document.getElementById('paramsList');

    function updateUrlFromParams() {
        try {
            const urlString = urlInput.value.trim();
            if (!urlString) return;
            
            // Basic validation to parse URL
            let url;
            if (urlString.startsWith('http')) {
                url = new URL(urlString);
            } else {
                return; // Not a valid URL yet
            }

            url.search = ''; // Clear existing
            
            const rows = paramsList.querySelectorAll('.key-value-row:not(.new-row)');
            rows.forEach(row => {
                const key = row.querySelector('.kv-key').value.trim();
                const value = row.querySelector('.kv-value').value.trim();
                if (key) {
                    url.searchParams.append(key, value);
                }
            });

            urlInput.value = url.toString();
        } catch (e) {
            // Ignore parse errors while typing
        }
    }

    paramsList.addEventListener('input', updateUrlFromParams);

    // Format JSON Body
    const formatBodyBtn = document.getElementById('formatBodyBtn');
    const requestBody = document.getElementById('requestBody');
    const jsonError = document.getElementById('jsonError');

    formatBodyBtn.addEventListener('click', () => {
        const val = requestBody.value.trim();
        if (!val) return;
        try {
            const parsed = JSON.parse(val);
            requestBody.value = JSON.stringify(parsed, null, 2);
            jsonError.classList.add('hidden');
        } catch (e) {
            jsonError.classList.remove('hidden');
        }
    });

    requestBody.addEventListener('input', () => {
        jsonError.classList.add('hidden');
    });

    // Handle Form Submit
    const apiForm = document.getElementById('apiForm');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');

    apiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const method = document.getElementById('method').value;
        const url = document.getElementById('url').value.trim();
        const body = requestBody.value.trim();

        // Get headers
        const headers = [];
        document.getElementById('headersList').querySelectorAll('.key-value-row:not(.new-row)').forEach(row => {
            const key = row.querySelector('.kv-key').value.trim();
            const value = row.querySelector('.kv-value').value.trim();
            if (key) {
                headers.push({ key, value });
            }
        });

        // Update UI to loading state
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        document.getElementById('sendBtn').disabled = true;

        const requestData = {
            method: method,
            url: url,
            headers: headers,
            body: body
        };

        try {
            const response = await fetch('/Home/SendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            renderResponse(data);
            saveHistory(method, url, data.statusCode);
        } catch (err) {
            renderResponse({
                isSuccess: false,
                statusCode: 0,
                statusDescription: 'Error',
                errorMessage: err.message,
                timeMs: 0,
                sizeBytes: 0,
                body: '',
                headers: []
            });
            saveHistory(method, url, 0);
        } finally {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            document.getElementById('sendBtn').disabled = false;
        }
    });

    function renderResponse(data) {
        document.getElementById('responseEmpty').classList.add('hidden');
        document.getElementById('responseMeta').classList.remove('hidden');
        document.getElementById('responseData').classList.remove('hidden');

        // Meta data
        const resStatus = document.getElementById('resStatus');
        const statusVal = resStatus.querySelector('.meta-value');
        statusVal.textContent = data.statusCode === 0 ? 'ERROR' : `${data.statusCode} ${data.statusDescription}`;
        
        // Remove old classes
        resStatus.className = 'meta-item status';
        if (data.statusCode >= 200 && data.statusCode < 300) resStatus.classList.add('status-2xx');
        else if (data.statusCode >= 300 && data.statusCode < 400) resStatus.classList.add('status-3xx');
        else if (data.statusCode >= 400 && data.statusCode < 500) resStatus.classList.add('status-4xx');
        else if (data.statusCode >= 500) resStatus.classList.add('status-5xx');
        else resStatus.classList.add('status-error');

        document.getElementById('resTime').querySelector('.meta-value').textContent = `${data.timeMs} ms`;
        
        const kb = (data.sizeBytes / 1024).toFixed(2);
        document.getElementById('resSize').querySelector('.meta-value').textContent = `${kb} KB`;

        // Body
        let bodyContent = data.errorMessage ? data.errorMessage : data.body;
        lastResponseBody = bodyContent; // Save for copy
        
        // Render Image if applicable
        const codeContainer = document.getElementById('responseBodyCode');
        if (data.contentType && data.contentType.startsWith('image/')) {
            codeContainer.innerHTML = `<img src="data:${data.contentType};base64,${data.body}" style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid var(--border-color);" alt="Response Image" />`;
            // For copying image, we can just copy the base64 or disable it, but for now we'll leave base64 text in lastResponseBody
        } else {
            // Try format JSON
            try {
                if (bodyContent && (bodyContent.startsWith('{') || bodyContent.startsWith('['))) {
                    const parsed = JSON.parse(bodyContent);
                    bodyContent = JSON.stringify(parsed, null, 2);
                    bodyContent = syntaxHighlight(bodyContent);
                } else {
                    bodyContent = escapeHtml(bodyContent);
                }
            } catch (e) {
                bodyContent = escapeHtml(bodyContent);
            }

            codeContainer.innerHTML = bodyContent;
        }

        // Headers
        const headersDisplay = document.getElementById('responseHeadersDisplay');
        headersDisplay.innerHTML = '';
        if (data.headers && data.headers.length > 0) {
            data.headers.forEach(h => {
                const row = document.createElement('div');
                row.className = 'header-row';
                row.innerHTML = `<span class="header-key">${escapeHtml(h.key)}:</span> <span class="header-value">${escapeHtml(h.value)}</span>`;
                headersDisplay.appendChild(row);
            });
        } else {
            headersDisplay.innerHTML = '<div style="color:var(--text-muted)">No headers</div>';
        }
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'num';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'str';
                    // Check if string is a URL
                    var strContent = match.substring(1, match.length - 1);
                    if (strContent.startsWith('http://') || strContent.startsWith('https://')) {
                        return '<span class="' + cls + '">"<a href="' + strContent + '" target="_blank" style="color: inherit; text-decoration: underline; cursor: pointer;" title="Click to open">' + strContent + '</a>"</span>';
                    }
                }
            } else if (/true|false/.test(match)) {
                cls = 'bool';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // Copy Response Logic
    const copyResponseBtn = document.getElementById('copyResponseBtn');
    if (copyResponseBtn) {
        copyResponseBtn.addEventListener('click', () => {
            if (!lastResponseBody) return;
            navigator.clipboard.writeText(lastResponseBody).then(() => {
                const originalHtml = copyResponseBtn.innerHTML;
                copyResponseBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyResponseBtn.innerHTML = originalHtml;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy response.');
            });
        });
    }
});
