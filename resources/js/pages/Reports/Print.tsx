import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

type PrintProps = {
    reportType: 'stock' | 'incoming' | 'outgoing';
    period?: string;
    startDate: string;
    endDate: string;
    reportData: any[];
    printedAt: string;
    user: any;
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const mIdx = parseInt(month, 10) - 1;
    return `${day} ${months[mIdx] || month} ${year}`;
};

export default function ReportsPrint({
    reportType,
    period,
    startDate,
    endDate,
    reportData = [],
    printedAt = '',
    user,
}: PrintProps) {
    useEffect(() => {
        // Automatically open browser print preview window
        const timer = setTimeout(() => {
            window.print();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const printDateStr = printedAt || formatDate(new Date().toISOString());

    return (
        <div className="bg-white text-slate-900 min-h-screen p-8 print:p-0 font-sans">
            <Head title="Cetak Laporan Persediaan" />

            <style>{`
                @page {
                    size: landscape;
                    margin: 12mm;
                }
            `}</style>

            {/* Document Kop Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                <h1 className="text-2xl font-black tracking-wider uppercase text-slate-900">
                    GUDANG DIESEL TRUK MEDAN (SINAR DIESEL TRUCK)
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                    JMPR+3F4, Pulo Brayan Bengkel, Kec. Medan Timur, Kota Medan, Sumatera Utara 20221 | Telp: (061) 6612345
                </p>
                <div className="mt-4 inline-block border border-slate-900 px-4 py-1.5 font-bold text-sm uppercase tracking-wide bg-slate-100">
                    {reportType === 'stock' && 'LAPORAN REKAPITULASI STOK PERSERDIAAN BARANG'}
                    {reportType === 'incoming' && `LAPORAN TRANSAKSI BARANG MASUK (${formatDate(startDate)} s/d ${formatDate(endDate)})`}
                    {reportType === 'outgoing' && `LAPORAN TRANSAKSI BARANG KELUAR (${formatDate(startDate)} s/d ${formatDate(endDate)})`}
                </div>
            </div>

            {/* Print Meta Info */}
            <div className="flex justify-between items-center text-xs text-slate-600 mb-4">
                <span>Tanggal Dicetak: <strong>{printDateStr}</strong></span>
                <span>Oleh: <strong>{user?.name || 'Admin Gudang'}</strong></span>
            </div>

            {/* Stock Table */}
            {reportType === 'stock' && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                            <th className="border border-slate-300 px-3 py-2 text-center w-10">NO</th>
                            <th className="border border-slate-300 px-3 py-2">KODE BARANG</th>
                            <th className="border border-slate-300 px-3 py-2">NAMA SPAREPART</th>
                            <th className="border border-slate-300 px-3 py-2">KATEGORI</th>
                            <th className="border border-slate-300 px-3 py-2 text-center">STOK SAAT INI</th>
                            <th className="border border-slate-300 px-3 py-2 text-center">STOK MINIMUM</th>
                            <th className="border border-slate-300 px-3 py-2">LOKASI RAK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item, index) => (
                            <tr key={item.id} className="border-b border-slate-200">
                                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                                <td className="border border-slate-300 px-3 py-2 font-mono font-bold">{item.item_code}</td>
                                <td className="border border-slate-300 px-3 py-2 font-medium">{item.name}</td>
                                <td className="border border-slate-300 px-3 py-2">{item.category?.name}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center font-bold">{item.stock} {item.unit?.short_name}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center">{item.min_stock} {item.unit?.short_name}</td>
                                <td className="border border-slate-300 px-3 py-2">{item.rack_location || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Incoming Table */}
            {reportType === 'incoming' && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                            <th className="border border-slate-300 px-3 py-2 text-center w-10">NO</th>
                            <th className="border border-slate-300 px-3 py-2">NO. NOTA</th>
                            <th className="border border-slate-300 px-3 py-2">TANGGAL</th>
                            <th className="border border-slate-300 px-3 py-2">NAMA SPAREPART</th>
                            <th className="border border-slate-300 px-3 py-2 text-center">JUMLAH MASUK</th>
                            <th className="border border-slate-300 px-3 py-2">SUPPLIER</th>
                            <th className="border border-slate-300 px-3 py-2">OPERATOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((tx, index) => (
                            <tr key={tx.id} className="border-b border-slate-200">
                                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                                <td className="border border-slate-300 px-3 py-2 font-mono font-bold">{tx.reference_no}</td>
                                <td className="border border-slate-300 px-3 py-2">{formatDate(tx.date)}</td>
                                <td className="border border-slate-300 px-3 py-2 font-medium">{tx.item?.name}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center font-bold">+{tx.quantity} {tx.item?.unit?.short_name}</td>
                                <td className="border border-slate-300 px-3 py-2">{tx.supplier || '-'}</td>
                                <td className="border border-slate-300 px-3 py-2">{tx.user?.name || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Outgoing Table */}
            {reportType === 'outgoing' && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                            <th className="border border-slate-300 px-3 py-2 text-center w-10">NO</th>
                            <th className="border border-slate-300 px-3 py-2">NO. BON</th>
                            <th className="border border-slate-300 px-3 py-2">TANGGAL</th>
                            <th className="border border-slate-300 px-3 py-2">NAMA SPAREPART</th>
                            <th className="border border-slate-300 px-3 py-2 text-center">JUMLAH KELUAR</th>
                            <th className="border border-slate-300 px-3 py-2">PENERIMA / TRUK</th>
                            <th className="border border-slate-300 px-3 py-2">OPERATOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((tx, index) => (
                            <tr key={tx.id} className="border-b border-slate-200">
                                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                                <td className="border border-slate-300 px-3 py-2 font-mono font-bold">{tx.reference_no}</td>
                                <td className="border border-slate-300 px-3 py-2">{formatDate(tx.date)}</td>
                                <td className="border border-slate-300 px-3 py-2 font-medium">{tx.item?.name}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center font-bold">-{tx.quantity} {tx.item?.unit?.short_name}</td>
                                <td className="border border-slate-300 px-3 py-2">{tx.recipient || '-'}</td>
                                <td className="border border-slate-300 px-3 py-2">{tx.user?.name || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Signature Box */}
            <div className="mt-12 flex justify-end text-xs">
                <div className="text-center w-64">
                    <p>Medan, {printDateStr.split(' ')[0]}</p>
                    <p className="font-bold mt-1">Penanggung Jawab Gudang</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{user?.name || 'Admin Gudang'}</p>
                    <p className="text-slate-500">Gudang Diesel Truck Medan</p>
                </div>
            </div>
        </div>
    );
}
