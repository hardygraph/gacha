
// Data barang untuk masing-masing paket

// Barang dan stok diambil dari Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTgEkOVBqA_LvkyexxTMpSK1UmBeTmRCLUHASFHvBwZOSPyY8fbOTXY9_KMm1O_XQCJg/exec';
let barangPaket = { '20000': [], '30000': [] };
let sisaStok = { '20000': [], '30000': [] };
let barangTerpilih = { '20000': [], '30000': [] };

function fetchBarangDanStok() {
    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            // Reset
            barangPaket = { '20000': [], '30000': [] };
            sisaStok = { '20000': [], '30000': [] };
            data.forEach(row => {
                if (row.paket && barangPaket[row.paket]) {
                    barangPaket[row.paket].push({
                        nama: row.nama,
                        gambar: row.gambar || 'https://via.placeholder.com/80',
                        stok: parseInt(row.stok || 0),
                        harga: parseInt(row.harga || 0),
                        id: row.id
                    });
                    sisaStok[row.paket].push(parseInt(row.stok || 0));
                }
            });
            renderBarang('20000');
            renderBarang('30000');
        });
}

function renderBarang(paket) {
    const list = document.getElementById('list-' + paket);
    list.innerHTML = '';
    barangPaket[paket].forEach((barang, idx) => {
        const sisa = sisaStok[paket][idx];
        const disabled = sisa <= 0 ? 'disabled' : '';
        list.innerHTML += `
        <div class="barang-item grid-icon ${disabled}" ${sisa > 0 ? `onclick=\"pilihBarang('${paket}',${idx})\"` : ''}>
            <img src="${barang.gambar}" alt="${barang.nama}" />
            <div class="nama">${barang.nama}</div>
            <div class="stok">Stok: <span id="stok-${paket}-${idx}">${sisa}</span></div>
        </div>
        `;
    });
    updateTotalPilihan(paket);
}

function pilihBarang(paket, idx) {
    // Sinkronkan stok antar paket
    const otherPaket = paket === '20000' ? '30000' : '20000';
    if (sisaStok[paket][idx] <= 0) return;
    const arr = barangTerpilih[paket];
    arr.push(idx);
    sisaStok[paket][idx]--;
    sisaStok[otherPaket][idx] = sisaStok[paket][idx];

    // Update stok di Google Apps Script (POST + action=update)
    const barang = barangPaket[paket][idx];
    // Update stok di Google Apps Script (sinkronkan kedua paket berdasarkan nama)
    const selectedBarang = barangPaket[paket][idx];
    const updateUrl = SCRIPT_URL + '?action=update&nama=' + encodeURIComponent(selectedBarang.nama) + 
                      '&stok=' + sisaStok[paket][idx];
    
    fetch(updateUrl)
    .then(response => response.json())
    .then(() => {
        // Catat transaksi ke laporan
        const laporanUrl = SCRIPT_URL + '?action=laporan&tanggal=' + new Date().toISOString().slice(0, 10) + 
                           '&paket=' + paket + 
                           '&harga=' + selectedBarang.harga + 
                           '&nama=' + encodeURIComponent(selectedBarang.nama);
        
        return fetch(laporanUrl);
    })
    .then(() => {
        renderBarang('20000');
        renderBarang('30000');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateTotalPilihan(paket) {
    let total = 0;
    barangTerpilih[paket].forEach(idx => {
        total += barangPaket[paket][idx].harga;
    });
    let el = document.getElementById('total-pilihan-' + paket);
    if (!el) {
        const parent = document.querySelector(`#paket-${paket} .barang-list`);
        el = document.createElement('div');
        el.className = 'total-pilihan';
        el.id = 'total-pilihan-' + paket;
        parent.parentNode.insertBefore(el, parent.nextSibling);
    }
    el.innerHTML = `Total harga barang terpilih: <b>Rp${total.toLocaleString()}</b>`;
}

function showPaket(paket) {
    document.getElementById('paket-20000').style.display = paket === '20000' ? '' : 'none';
    document.getElementById('tab-20000').classList.toggle('active', paket === '20000');
    document.getElementById('paket-30000').style.display = paket === '30000' ? '' : 'none';
    document.getElementById('tab-30000').classList.toggle('active', paket === '30000');
}

// Inisialisasi
window.onload = function () {
    fetchBarangDanStok();
    showPaket('20000');
}
