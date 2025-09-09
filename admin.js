// admin.js - Tambah barang baru ke Google Sheets via SheetDB

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form-tambah-barang').onsubmit = function (e) {
        e.preventDefault();
        const nama = document.getElementById('nama-baru').value.trim();
        const gambar = document.getElementById('gambar-baru').value.trim();
        const stok = parseInt(document.getElementById('stok-baru').value);
        const harga20000 = parseInt(document.getElementById('harga-baru-20000').value);
        const harga30000 = parseInt(document.getElementById('harga-baru-30000').value);
        if (!nama || !gambar || isNaN(stok) || isNaN(harga20000) || isNaN(harga30000)) {
            alert('Semua data harus diisi dengan benar!');
            return;
        }
        // Simpan barang baru ke Google Apps Script Web App (dua baris: untuk paket 20000 dan 30000)
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTgEkOVBqA_LvkyexxTMpSK1UmBeTmRCLUHASFHvBwZOSPyY8fbOTXY9_KMm1O_XQCJg/exec';
        const idBase = Date.now().toString();
        // Kirim data untuk paket 20000 menggunakan GET
        const url1 = SCRIPT_URL + '?action=add&id=' + encodeURIComponent(idBase + '-20000') + 
                     '&nama=' + encodeURIComponent(nama) + 
                     '&gambar=' + encodeURIComponent(gambar) + 
                     '&stok=' + stok + 
                     '&harga=' + harga20000 + 
                     '&paket=20000';
        
        console.log('URL 1:', url1);
        fetch(url1)
        .then(response => {
            console.log('Response 1 status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Response 1 text:', text);
            // Kirim data untuk paket 30000
            const url2 = SCRIPT_URL + '?action=add&id=' + encodeURIComponent(idBase + '-30000') + 
                         '&nama=' + encodeURIComponent(nama) + 
                         '&gambar=' + encodeURIComponent(gambar) + 
                         '&stok=' + stok + 
                         '&harga=' + harga30000 + 
                         '&paket=30000';
            
            console.log('URL 2:', url2);
            return fetch(url2);
        })
        .then(response => {
            console.log('Response 2 status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Response 2 text:', text);
            alert('Barang baru berhasil ditambahkan!');
            document.getElementById('form-tambah-barang').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal menambah barang: ' + error);
        });
    };
});
