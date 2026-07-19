# Full data-generation chain, meant to run detached (hours).
# Writes progress to data\chain.log and data\chain.done on success.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$py = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
Remove-Item data\chain.done -ErrorAction SilentlyContinue
& $py datagen.py sources --out data/sources.jsonl --per-batch 12 --batches 5 *>> data\chain.log
& $py datagen.py labels --sources data/sources.jsonl --out data/labeled.jsonl *>> data\chain.log
& $py datagen.py split --labeled data/labeled.jsonl --outdir data --heldout 80 *>> data\chain.log
'done' | Set-Content data\chain.done
