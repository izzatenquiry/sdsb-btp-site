# Banting QAQC Control Centre

## Tujuan

Dashboard ini memberi paparan ringkas untuk menyemak rekod QA/QC dalaman projek Banting Data Park. Ia menyusun rekod mengikut kategori dan sub-register, serta menyediakan carian, penapis, ringkasan jumlah dan overdue, dan eksport CSV.

## Skop register

Dashboard ini memaparkan 22 register dalaman sahaja:

### Inspection — 10 register

- RFWI A C&S
- RFWI B C&S
- RFWI C C&S
- RFWI F C&S
- RFWI A ARC
- RFWI B ARC
- ITP
- CHECKLIST
- OJT
- FOK LIST

### Submission — 1 register

- MOS - REVISION only

### Test — 9 register

- CUBE TEST EW
- CUBE TEST BLOCK A
- CUBE TEST BLOCK B
- GROUT TEST BLOCK A
- GROUT TEST BLOCK B
- FDT TEST
- PILE TEST DATE
- PLATE LOAD BEARING TEST
- LAB SUMMARY

### NCR & Observation — 2 register

- RSS SUMMARY
- SSR SUMMARY

FOK LIST dikategorikan sebagai Inspection dengan andaian FOK bermaksud *First-of-Kind*. RSS SUMMARY dan SSR SUMMARY dibentuk daripada rekod sumber RSS Reply. GROUT TEST BLOCK A, GROUT TEST BLOCK B dan FOK LIST belum mempunyai rekod dalam snapshot sumber yang digunakan.

## Sumber dan had data

Data asal datang daripada `QAQC Summarylist Banting Data Park - Grouped Tabs.xlsx`. Snapshot yang dibekalkan dalam dashboard bertarikh **30 Oktober 2026** dan mengandungi **1,340 baris** untuk register yang dipilih.

Dashboard **belum disambungkan kepada Autodesk Construction Cloud (ACC)**. Ia tidak mengambil submission atau perubahan baharu daripada ACC secara automatik. Untuk rekod terkini, snapshot perlu dikemas kini daripada sumber workbook/ACC terlebih dahulu.

## Cara buka di komputer ini

Jalankan `Buka Dashboard QAQC Local.bat` yang berada satu folder di atas direktori projek ini. Fail itu akan memulakan server tempatan jika belum berjalan, kemudian membuka:

`http://127.0.0.1:5173/`

Keperluan tempatan: Node.js versi **22.13 atau lebih baharu** dan pakej projek yang sudah dipasang (`node_modules`). Biarkan tetingkap server terbuka sepanjang dashboard digunakan.

## Penerbitan

Dashboard hosted diterbitkan melalui Autodesk/Codex Sites dan kekal pada tetapan akses sedia ada yang hanya membenarkan pemilik. Penerbitan dashboard tidak mengubah fail sumber Excel atau menyambungkan ACC.
