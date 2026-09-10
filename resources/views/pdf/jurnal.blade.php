<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Jurnal PKL - {{ $student->user->name }}</title>
    <style>
        * { font-family: 'DejaVu Sans', sans-serif; }
        body { font-size: 11px; color: #1e293b; margin: 0; }
        .kop { text-align: center; margin-bottom: 6px; }
        .kop h1 { font-size: 16px; margin: 0; letter-spacing: 1px; }
        .kop h2 { font-size: 13px; margin: 2px 0 0; }
        .kop .addr { font-size: 10px; color: #475569; }
        .line { border-bottom: 2px solid #1e293b; margin: 6px 0 4px; }
        .title { text-align: center; font-size: 13px; font-weight: bold; margin: 8px 0; }
        .info { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
        .info td { padding: 2px 4px; vertical-align: top; }
        .info .label { font-weight: bold; width: 150px; }
        table.jurnal { width: 100%; border-collapse: collapse; font-size: 10px; }
        table.jurnal th, table.jurnal td { border: 1px solid #475569; padding: 6px; vertical-align: top; }
        table.jurnal th { background: #f1f5f9; font-size: 10px; }
        td.ttd { text-align: center; width: 110px; height: 70px; vertical-align: middle; }
        td.ttd img { max-height: 55px; max-width: 95px; object-fit: contain; }
        .aktivitas .judul { font-weight: bold; }
        .aktivitas .desc { margin-top: 3px; }
        .aktivitas .skill { margin-top: 3px; color: #0369a1; font-style: italic; }
        .foot { width: 100%; margin-top: 26px; font-size: 11px; }
        .foot td { padding: 2px 4px; vertical-align: top; }
        .col-siswa { width: 55%; }
        .sig-space { margin-top: 50px; }
    </style>
</head>
<body>
    <div class="kop">
        <h1>PKL CONNECT</h1>
        <h2>MONITORING HUBIN SMK TAMAN SISWA</h2>
        <div class="addr">Jl. Pendidikan No. 1, Kota Anda &mdash; Telp. (021) 123456</div>
    </div>
    <div class="line"></div>

    <div class="title">BUKU JURNAL HARIAN PRAKTIK KERJA LAPANGAN (PKL)</div>

    <table class="info">
        <tr>
            <td class="label">Nama Siswa</td>
            <td>: {{ $student->user->name }}</td>
            <td class="label">Kelas / Jurusan</td>
            <td>: {{ $student->class }} / {{ $student->major }}</td>
        </tr>
        <tr>
            <td class="label">NIS</td>
            <td>: {{ $student->nis ?? '-' }}</td>
            <td class="label">Nama Perusahaan</td>
            <td>: {{ $companyName }}</td>
        </tr>
        <tr>
            <td class="label">{{ $approverLabel ?? 'Pembimbing Industri' }}</td>
            <td colspan="3">: {{ $supervisorName }}</td>
        </tr>
    </table>

    <table class="jurnal">
        <thead>
            <tr>
                <th style="width:26px;">No</th>
                <th style="width:110px;">Hari / Tanggal</th>
                <th>Aktivitas Kegiatan</th>
                <th style="width:110px;">TTD Pembimbing</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($journals as $index => $j)
                <tr>
                    <td style="text-align:center;">{{ $loop->iteration }}</td>
                    <td>{{ \Carbon\Carbon::parse($j->date)->translatedFormat('l, d/m/Y') }}</td>
                    <td class="aktivitas">
                        <div class="judul">{{ $j->activity }}</div>
                        <div class="desc">{!! nl2br(e($j->description)) !!}</div>
                        @if ($j->skill)
                            <div class="skill">Skill/Kompetensi: {{ $j->skill }}</div>
                        @endif
                        @if ($j->obstacle)
                            <div class="skill" style="color:#b91c1c;">Kendala: {{ $j->obstacle }}</div>
                        @endif
                    </td>
                    <td class="ttd">
                        @if ($signatureDataUri)
                            <img src="{{ $signatureDataUri }}" alt="TTD Pembimbing">
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;">Belum ada jurnal harian.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="foot">
        <tr>
            <td class="col-siswa">
                <div>Siswa PKL,</div>
                <div class="sig-space">{{ $student->user->name }}</div>
            </td>
            <td>
                <div>Mengetahui, {{ $approverLabel ?? 'Pembimbing Industri' }}</div>
                <div class="sig-space">{{ $supervisorName }}</div>
            </td>
        </tr>
    </table>
</body>
</html>