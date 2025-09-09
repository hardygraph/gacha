// laporan.js - Laporan perorangan sesuai aturan jumlah barang per orang per paket
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTgEkOVBqA_LvkyexxTMpSK1UmBeTmRCLUHASFHvBwZOSPyY8fbOTXY9_KMm1O_XQCJg/exec'; // UPDATE DENGAN URL DEPLOYMENT TERBARU
document.addEventListener('DOMContentLoaded', function () {
    fetch(SCRIPT_URL + '?laporan=1')
        .then(res => res.json())
        .then(laporan => {
            // Group by paket, lalu batch per orang sesuai aturan min/max barang
            let result = { '20000': [], '30000': [] };
            let totalKeuntungan = { '20000': 0, '30000': 0 };
            let totalPengeluaran = { '20000': 0, '30000': 0 };
            let orangCount = { '20000': 0, '30000': 0 };
            let barangCount = { '20000': 0, '30000': 0 };

            // Kelompokkan transaksi per paket
            let byPaket = { '20000': [], '30000': [] };
            laporan.forEach(item => {
                byPaket[item.paket]?.push({
                    ...item,
                    harga: parseInt(item.harga || 0)
                });
            });

            // Untuk setiap paket, batch transaksi per orang sesuai aturan
            [['20000', 5, 7], ['30000', 8, 10]].forEach(([paket, minBarang, maxBarang]) => {
                let transaksi = byPaket[paket];
                let idx = 0;
                while (idx < transaksi.length) {
                    let sisa = transaksi.length - idx;
                    let ambil = Math.min(maxBarang, sisa);
                    // Jika sisa < minBarang, skip (tidak dihitung orang baru)
                    if (ambil < minBarang) break;
                    let batch = transaksi.slice(idx, idx + ambil);
                    let pengeluaran = batch.reduce((a, b) => a + b.harga, 0);
                    let keuntungan = (parseInt(paket) - pengeluaran);
                    result[paket].push({
                        orang: 1,
                        jumlahBarang: batch.length,
                        pengeluaran,
                        keuntungan
                    });
                    orangCount[paket]++;
                    barangCount[paket] += batch.length;
                    totalPengeluaran[paket] += pengeluaran;
                    totalKeuntungan[paket] += keuntungan;
                    idx += ambil;
                }
            });

            let tbody = document.getElementById('laporan-body');
            tbody.innerHTML = '';
            ['20000', '30000'].forEach(paket => {
                result[paket].forEach((row, i) => {
                    tbody.innerHTML += `
                                <tr>
                                    <td>${paket}</td>
                                    <td>${row.orang}</td>
                                    <td>${row.jumlahBarang}</td>
                                    <td>Rp${row.pengeluaran.toLocaleString()}</td>
                                    <td>Rp${row.keuntungan.toLocaleString()}</td>
                                </tr>
                            `;
                });
            });
            document.getElementById('summary').textContent =
                `Total orang: ${orangCount['20000'] + orangCount['30000']} | Total barang: ${barangCount['20000'] + barangCount['30000']}`;
            document.getElementById('paket-20000-info').innerHTML =
                `Paket 20.000<br>Total Orang: ${orangCount['20000']}<br>Keuntungan: Rp${totalKeuntungan['20000'].toLocaleString()}`;
            document.getElementById('paket-30000-info').innerHTML =
                `Paket 30.000<br>Total Orang: ${orangCount['30000']}<br>Keuntungan: Rp${totalKeuntungan['30000'].toLocaleString()}`;
            document.getElementById('keuntungan-total').textContent =
                `Total Keuntungan Seluruhnya: Rp${(totalKeuntungan['20000'] + totalKeuntungan['30000']).toLocaleString()}`;
        });
});
