# Rename remaining NHL logos with correct filenames
$renameMap = @{
    '1SVoPsK2xW65VIfyQB2soQ_96x96.png' = 'canucks.png'
    '7lrK9CX_nZj_veEeleHTmg_96x96.png' = 'bluejackets.png'
    '8aNIxgSUNttfOeojBie04w_96x96.png' = 'predators.png'
    'ACHzKYY5PwdvPUg9-QIq6w_96x96.png' = 'kings.png'
    'dlm2PLEGHJY8DzDLloxLcQ_96x96.png' = 'devils.png'
    'G92uFvMADMSGFV07IgpUIQ_96x96.png' = 'jets.png'
    'gv_klUIk7LBmA857rbdOvw_96x96.png' = 'kraken.png'
    'HhkdL7JKqdlVy_DtjLOjbw_96x96.png' = 'panthers.png'
    'iBFLyMGpOW2Fh5j8s7kYpw_96x96.png' = 'avalanche.png'
    'IFjTMxl-nMxMJK2b64xLFQ_96x96.png' = 'lightning.png'
    'kUlSd6LbUN7Jj03mqZcgAw_96x96.png' = 'blackhawks.png'
    'nC8dMKdf-zPF4cWq_wSKHA_96x96.png' = 'hurricanes2.png'
    'QaP8buCif1FvjfqApkxsDg_96x96.png' = 'redwings.png'
    'tm2O28PE659W0kS9_BF6eA_96x96.png' = 'ducks.png'
    'uT-r__4aRFZmtEITN9mNdQ_96x96.png' = 'capitals.png'
    'VSlKfFo5iVD5cmit6rBXLQ_96x96.png' = 'bruins.png'
    'W1ILAtl-fUjegNeUaNoj8g_96x96.png' = 'islanders.png'
    'xAan1UsViSOex0EoBJEMOA_96x96.png' = 'rangers.png'
    'yAPda2I1VV6sr0TB17rnxQ_96x96.png' = 'stars.png'
    '_rlImUQJkjVKGTj1Xkdaaw_96x96.png' = 'senators.png'
}

Write-Host "Rename remaining logos..." -ForegroundColor Cyan
$renamed = 0

foreach ($oldName in $renameMap.Keys) {
    if (Test-Path $oldName) {
        $newName = $renameMap[$oldName]
        Rename-Item -Path $oldName -NewName $newName -Force
        Write-Host "OK: $oldName -> $newName" -ForegroundColor Green
        $renamed++
    } else {
        Write-Host "NOT FOUND: $oldName" -ForegroundColor Yellow
    }
}

Write-Host "`n$renamed files renamed successfully!" -ForegroundColor Green
