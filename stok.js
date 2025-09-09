// stok.js - update stok barang yang sudah ada
// stok.js - update stok barang dengan grid UI


// Ambil data barang dan stok dari Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTgEkOVBqA_LvkyexxTMpSK1UmBeTmRCLUHASFHvBwZOSPyY8fbOTXY9_KMm1O_XQCJg/exec';
let barangSheet = [];

function renderBarangGrid() {
    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(barangList => {
            console.log('Data barang dari server:', barangList);
            
            // Filter hanya barang unik berdasarkan nama (ambil paket 20000 saja untuk tampilan)
            const uniqueBarang = [];
            const seenNames = new Set();
            
            barangList.forEach(b => {
                console.log('Checking barang:', b.nama, 'paket:', b.paket, 'type:', typeof b.paket);
                // Convert paket to string untuk comparison
                if (!seenNames.has(b.nama) && String(b.paket) === '20000') {
                    uniqueBarang.push(b);
                    seenNames.add(b.nama);
                }
            });
            
            console.log('Unique barang filtered:', uniqueBarang);
            
            barangSheet = uniqueBarang;
            const list = document.getElementById('barang-list-stok');
            list.innerHTML = '';
            
            if (uniqueBarang.length === 0) {
                list.innerHTML = '<div style="text-align:center; padding:20px;">Tidak ada barang ditemukan</div>';
                return;
            }
            
            uniqueBarang.forEach((b, idx) => {
                list.innerHTML += `
                <div class="barang-item grid-icon">
                    <img src="${b.gambar || 'https://via.placeholder.com/80'}" alt="${b.nama}" />
                    <div class="nama">${b.nama}</div>
                    <div class="stok">Stok: <span id="stok-stok-${idx}">${b.stok || 0}</span></div>
                    <div class="input-tambah-row">
                        <input type="number" min="1" value="1" id="input-tambah-${idx}" class="input-stok">
                        <button onclick="tambahStok(${idx})" class="btn-tambah">add</button>
                    </div>
                </div>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const list = document.getElementById('barang-list-stok');
            list.innerHTML = '<div style="text-align:center; padding:20px;">Error loading data: ' + error + '</div>';
        });
}

window.tambahStok = function (idx) {
    let jumlah = parseInt(document.getElementById('input-tambah-' + idx).value);
    if (isNaN(jumlah) || jumlah < 1) return alert('Jumlah harus lebih dari 0');
    let barang = barangSheet[idx];
    if (!barang) return alert('Data barang tidak ditemukan!');
    let stokBaru = (parseInt(barang.stok || 0) + jumlah);
    // Update stok di Google Apps Script Web App (POST + action=update)
    // Update stok di Google Apps Script Web App (sinkronkan kedua paket berdasarkan nama)
    console.log('Barang data:', barang);
    const updateUrl = SCRIPT_URL + '?action=update&nama=' + encodeURIComponent(barang.nama) + 
                      '&stok=' + stokBaru;
    
    console.log('Update URL:', updateUrl);
    fetch(updateUrl)
    .then(response => {
        console.log('Update response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Update response text:', text);
        document.getElementById('stok-stok-' + idx).textContent = stokBaru;
        alert('Stok barang berhasil ditambah untuk semua paket!');
        // Refresh data agar sinkron
        renderBarangGrid();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Gagal update stok: ' + error);
    });
}

document.addEventListener('DOMContentLoaded', renderBarangGrid);
