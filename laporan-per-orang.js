// laporan-per-orang.js
// Asumsi: laporanGacha di localStorage format [{tanggal, paket, harga, userId}]
// Jika userId belum ada, fallback ke hitungan per transaksi (setiap transaksi dianggap 1 orang)

document.addEventListener('DOMContentLoaded', function () {
    let laporan = JSON.parse(localStorage.getItem('laporanGacha') || '[]');
    // Group by paket, lalu group by userId (atau fallback per transaksi)
    let data = {
        '20000': {},
        '30000': {}
    };
    let totalTransaksi = { '20000': 0, '30000': 0 };
    let totalPengeluaran = { '20000': 0, '30000': 0 };
    let userSet = { '20000': new Set(), '30000': new Set() };

    laporan.forEach(item => {
        let paket = item.paket;
        let user = item.userId || item.pembeli || ('user-' + item.tanggal + '-' + Math.random());
        if (!data[paket][user]) data[paket][user] = { transaksi: 0, pengeluaran: 0 };
        data[paket][user].transaksi++;
        data[paket][user].pengeluaran += item.harga;
        totalTransaksi[paket]++;
        totalPengeluaran[paket] += item.harga;
        userSet[paket].add(user);
    });

    let tbody = document.getElementById('laporan-body');
    tbody.innerHTML = '';
    ['20000', '30000'].forEach(paket => {
        let orang = userSet[paket].size;
        let transaksi = totalTransaksi[paket];
        let pengeluaran = totalPengeluaran[paket];
        let keuntungan = (parseInt(paket) * transaksi) - pengeluaran;
        tbody.innerHTML += `
          <tr>
            <td>${paket}</td>
            <td>${orang}</td>
            <td>${transaksi}</td>
            <td>Rp${pengeluaran.toLocaleString()}</td>
            <td>Rp${keuntungan.toLocaleString()}</td>
          </tr>
        `;
    });
    // Total keuntungan semua paket
    let totalKeuntungan = (20000 * totalTransaksi['20000'] + 30000 * totalTransaksi['30000']) - (totalPengeluaran['20000'] + totalPengeluaran['30000']);
    document.getElementById('keuntungan-total').textContent =
        'Total Keuntungan Semua Paket: Rp' + totalKeuntungan.toLocaleString();
    document.getElementById('summary').textContent =
        `Total orang unik: ${userSet['20000'].size + userSet['30000'].size} | Total transaksi: ${totalTransaksi['20000'] + totalTransaksi['30000']}`;
});
