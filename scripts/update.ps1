param(
    [string]$Message = '',
    [string]$RepositoryUrl = 'https://github.com/chenghoutang/math-practice.git',
    [string]$Branch = 'main',
    [string]$SiteUrl = 'https://chenghoutang.github.io/math-practice/'
)

$ErrorActionPreference = 'Stop'
$sourceDirectory = Split-Path -Parent $PSScriptRoot
$deployDirectory = $null

function Invoke-Git {
    param([string[]]$GitArguments)
    & git @GitArguments
    if ($LASTEXITCODE -ne 0) {
        throw ('Git failed: git ' + ($GitArguments -join ' '))
    }
}

try {
    Get-Command git -ErrorAction Stop | Out-Null
    Get-Command robocopy -ErrorAction Stop | Out-Null
    foreach ($requiredFile in @('index.html', 'exam.html', 'data/manifest.json', 'assets/katex/katex.min.js', '.nojekyll')) {
        if (-not (Test-Path -LiteralPath (Join-Path $sourceDirectory $requiredFile) -PathType Leaf)) {
            throw ('Missing project file: ' + $requiredFile)
        }
    }
    Invoke-Git -GitArguments @('check-ref-format', '--branch', $Branch)
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = 'Math practice update ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    }

    # A fresh clone keeps deployment separate from the parent site's Git repository.
    $deployDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ('dengduck-math-practice-deploy-' + [guid]::NewGuid().ToString('N'))
    Write-Host ('Repository: ' + $RepositoryUrl)
    Write-Host ('Working copy: ' + $deployDirectory)
    Invoke-Git -GitArguments @('clone', '--no-checkout', '--', $RepositoryUrl, $deployDirectory)

    & git -C $deployDirectory show-ref --verify --quiet ('refs/remotes/origin/' + $Branch)
    if ($LASTEXITCODE -eq 0) {
        Invoke-Git -GitArguments @('-C', $deployDirectory, 'checkout', '-B', $Branch, ('origin/' + $Branch))
    } else {
        # Also supports a newly created, empty GitHub repository.
        Invoke-Git -GitArguments @('-C', $deployDirectory, 'checkout', '--orphan', $Branch)
    }

    # Mirror tracked project files inside this new disposable clone only.
    # This also records files removed locally, without deleting the source folder.
    Invoke-Git -GitArguments @('-C', $deployDirectory, 'rm', '-r', '--ignore-unmatch', '--quiet', '--', '.')
    $copyArguments = @(
        $sourceDirectory, $deployDirectory, '/E',
        '/XD', '.git', 'node_modules', '.cache', '.codex', '.agents',
        '/XF', '*.log', 'Thumbs.db', '.DS_Store',
        '/NFL', '/NDL', '/NJH', '/NJS', '/NP'
    )
    & robocopy @copyArguments | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw ('Copy failed with robocopy exit code ' + $LASTEXITCODE)
    }
    Invoke-Git -GitArguments @('-C', $deployDirectory, 'add', '-A')

    & git -C $deployDirectory diff --cached --quiet
    $diffExit = $LASTEXITCODE
    if ($diffExit -eq 0) {
        Write-Host '[OK] No changes to publish.'
    } elseif ($diffExit -eq 1) {
        $authorName = & git -C $deployDirectory config user.name
        if ([string]::IsNullOrWhiteSpace(($authorName -join ''))) {
            Invoke-Git -GitArguments @('-C', $deployDirectory, 'config', '--local', 'user.name', 'chenghoutang')
        }
        $authorEmail = & git -C $deployDirectory config user.email
        if ([string]::IsNullOrWhiteSpace(($authorEmail -join ''))) {
            Invoke-Git -GitArguments @('-C', $deployDirectory, 'config', '--local', 'user.email', 'chenghoutang@users.noreply.github.com')
        }
        Invoke-Git -GitArguments @('-C', $deployDirectory, 'commit', '-m', $Message)
        Invoke-Git -GitArguments @('-C', $deployDirectory, 'push', 'origin', ('HEAD:refs/heads/' + $Branch))
        Write-Host '[OK] Published successfully.'
    } else {
        throw ('Cannot inspect staged changes; git diff exit code ' + $diffExit)
    }
    Write-Host ('Site: ' + $SiteUrl)
    Write-Host ('First deployment: enable GitHub Pages from ' + $Branch + ' / (root) in Settings > Pages.')
    Write-Host 'GitHub Pages may take a few minutes to update.'
    Write-Host ('Temporary clone retained at: ' + $deployDirectory)
    exit 0
} catch {
    [Console]::Error.WriteLine('[FAILED] ' + $_.Exception.Message)
    if ($deployDirectory) {
        [Console]::Error.WriteLine('Deployment working copy: ' + $deployDirectory)
    }
    exit 1
}
