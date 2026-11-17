const DEFAULT_ITEMS = [
  { name: 'GitHub', value: 'https://github.com/ehsanmunna' }
];

const listEl = document.getElementById('list');
const form = document.getElementById('add-form');
const input = document.getElementById('new-value');
const nameInput = document.getElementById('new-name');

function normalize(item) {
  if (typeof item === 'string') return { name: '', value: item };
  return { name: item.name || '', value: item.value };
}

// add true value to test in html
const DEV = document.documentElement.dataset.dev === 'false';

async function getItems() {
  if (DEV) return DEFAULT_ITEMS.map(normalize);
  const { items } = await chrome.storage.local.get('items');
  if (items) return items.map(normalize);
  await saveItems(DEFAULT_ITEMS.map(normalize));
  return DEFAULT_ITEMS.map(normalize);
}

async function saveItems(items) {
  await chrome.storage.local.set({ items: items.map(normalize) });
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

function createRow(item, index) {
  const value = item.value;
  const label = item.name ? item.name : value;
  const tr = document.createElement('tr');

  const tdValue = document.createElement('td');
  tdValue.textContent = label;

  const tdAction = document.createElement('td');
  tdAction.className = 'actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copy Text';
  copyBtn.addEventListener('click', () => copyText(value, copyBtn));

  tdAction.append(copyBtn);

  if (!DEV) {
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(tr, item, index));
    tdAction.append(editBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '✕';
  delBtn.title = 'Delete';
  delBtn.addEventListener('click', async () => {
    const items = await getItems();
    items.splice(index, 1);
    await saveItems(items);
    render();
  });

  tdAction.append(delBtn);
  tr.append(tdValue, tdAction);
  return tr;
}

async function startEdit(tr, item, index) {
  const tdValue = tr.children[0];
  const tdAction = tr.children[1];

  const nameIn = document.createElement('input');
  nameIn.type = 'text';
  nameIn.value = item.name || '';
  nameIn.placeholder = 'Name (optional)';
  nameIn.className = 'edit-input';

  const valIn = document.createElement('input');
  valIn.type = 'text';
  valIn.value = item.value;
  valIn.required = true;
  valIn.className = 'edit-input';

  tdValue.replaceChildren(nameIn, valIn);

  tdAction.replaceChildren();

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    const newValue = valIn.value.trim();
    if (!newValue) return;
    const items = await getItems();
    items[index] = { name: nameIn.value.trim(), value: newValue };
    await saveItems(items);
    render();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => render());

  tdAction.append(saveBtn, cancelBtn);
}

async function render() {
  const items = await getItems();
  listEl.replaceChildren(...items.map(createRow));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  const name = nameInput.value.trim();
  const items = await getItems();
  items.push({ name, value });
  await saveItems(items);

  nameInput.value = '';
  input.value = '';
  render();
});

const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

exportBtn.addEventListener('click', async () => {
  const items = await getItems();
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'items.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', async () => {
  const file = importFile.files && importFile.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('Invalid format');
    const items = data.map(normalize);
    await saveItems(items);
    render();
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    importFile.value = '';
  }
});

render();