#!/usr/bin/env pwsh

Write-Host "=== SSH Setup Assistant ===" -ForegroundColor Cyan

# Check for existing SSH key
$sshPath = "$env:USERPROFILE\.ssh\id_ed25519.pub"
if (Test-Path $sshPath) {
    $key = Get-Content $sshPath
    Write-Host "Your SSH public key:" -ForegroundColor Green
    Write-Host $key
    $key | Set-Clipboard
    Write-Host "Key copied to clipboard!" -ForegroundColor Green
} else {
    Write-Host "No SSH key found. Creating one..." -ForegroundColor Yellow
    $email = Read-Host "Enter your GitHub email"
    ssh-keygen -t ed25519 -C $email -f "$env:USERPROFILE\.ssh\id_ed25519" -N ""
    $key = Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
    Write-Host "Your new SSH key:" -ForegroundColor Green
    Write-Host $key
    $key | Set-Clipboard
    Write-Host "Key copied to clipboard!" -ForegroundColor Green
}

Write-Host "Add this key to GitHub: https://github.com/settings/keys" -ForegroundColor Cyan
Write-Host "Then test with: ssh -T git@github.com" -ForegroundColor Yellow