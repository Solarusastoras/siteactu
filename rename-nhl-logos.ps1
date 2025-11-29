# Script pour renommer les logos NHL avec des noms simples
# À exécuter dans le dossier contenant les logos

$renameMap = @{
    'rIlmUQJkjVKGTj1Xkdaaw_96x96.png' = 'senators.png'
    '1SVePsK2wW65VIfyQB2soQ_96x96.png' = 'canucks.png'
    '2AkZ-bLhHUaPoj_LlLPBVA_96x96.png' = 'wild.png'
    '7IrK9CX_nZj_veEeleHfmg_96x96.png' = 'bluejackets.png'
    '8aNIxgSUNttfOeojBte04w_96x96.png' = 'predators.png'
    'ACHzkYY5PwdvPUg9-Qlq6w_96x96.png' = 'kings.png'
    'dIm2PLEGHJY8DzDLIoxLcQ_96x96.png' = 'devils.png'
    'fhexjWXZM7Sgvd22nDkBOA_96x96.png' = 'canadiens.png'
    'G92uFvMADMSGFV071gpUIQ_96x96.png' = 'jets.png'
    'GFR5_nXarHj6qRi8R05otg_96x96.png' = 'oilers.png'
    'gv_kIUlk7LBmA857rbdOvw_96x96.png' = 'kraken.png'
    'HhkdL7JKqdIVyDtjLOjbw_96x96.png' = 'panthers.png'
    'i8FLyMGpOW2Fh5j8s7kYpw_96x96.png' = 'avalanche.png'
    'lFjTMxl-nMxMJK2b64xLFQ_96x96.png' = 'lightning.png'
    'IZyckSgmibqtCi1eua8kjw_96x96.png' = 'hurricanes.png'
    'jMSyNOMdJPjHwsmbWukUag_96x96.png' = 'mapleleafs.png'
    'jwG6UfooGEJ_nvOVT_0ykw_96x96.png' = 'flames.png'
    'kUISd6LbUN7Jj03mqZcgAw_96x96.png' = 'blackhawks.png'
    'mTXURxq0CbsVREw9q3UAnw_96x96.png' = 'penguins.png'
    'nC8dMKdf-zPF4eWq_wSKHA_96x96.png' = 'hurricanes2.png'
    'oUzPuWUhgzayhHwucx8htQ_96x96.png' = 'blues.png'
    'QaP8buCiTiFvjfqApkxsDg_96x96.png' = 'redwings.png'
    'QeG0x42j0YlJGYEAwowewA_96x96.png' = 'goldenknights.png'
    'tm2O28P6659W0kS9_BF6eA_96x96.png' = 'ducks.png'
    'TuRBhY0zNhgZUbHQS4VUhQ_96x96.png' = 'sharks.png'
    'uT-r__4aRFZmtElTN9mNdQ_96x96.png' = 'capitals.png'
    'V0drcuaBEJZ4TIe3_KfaEg_96x96.png' = 'sabres.png'
    'VSlKfFo5iVD5cmitfrbBXLQ_96x96.png' = 'bruins.png'
    'W1lLAtl-fUjegNeUaNoj8g_96x96.png' = 'islanders.png'
    'xAan1UsYlSOexOE0bJEMOA_96x96.png' = 'rangers.png'
    'yAPda2i1VV6sr0TB17rmxQ_96x96.png' = 'stars.png'
    'ZFZEyofJ8vMrr0tFGsMFKg_96x96.png' = 'flyers.png'
}

Write-Host "Rename NHL logos..." -ForegroundColor Cyan
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
