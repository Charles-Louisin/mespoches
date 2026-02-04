# Script de nettoyage et réinstallation propre
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧹 NETTOYAGE ET RÉINSTALLATION PROPRE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si des processus Node sont actifs
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Processus Node.js détectés en cours d'exécution" -ForegroundColor Yellow
    Write-Host "   Veuillez arrêter les serveurs (Ctrl+C) avant de continuer." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($continue -ne "o") {
        Write-Host "❌ Annulé" -ForegroundColor Red
        exit
    }
}

Write-Host "1️⃣  Suppression de .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   ✅ .next supprimé" -ForegroundColor Green
}

Write-Host "2️⃣  Suppression de node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "   ✅ node_modules supprimé" -ForegroundColor Green
}

Write-Host "3️⃣  Suppression de package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "   ✅ package-lock.json supprimé" -ForegroundColor Green
}

Write-Host ""
Write-Host "4️⃣  Installation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ TERMINÉ!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant lancer: npm run dev" -ForegroundColor Green
