# Bring the DeepSeek Harness window (or a browser window showing its GUI) to the
# foreground on Windows.
#
# Exit codes:
#   0  the matching window is in the foreground (or already was)
#   1  no visible matching window
#   2  the Win32 helper could not be compiled
#   3  a matching window exists but could not be focused
#
# The script deliberately never calls ShowWindow(SW_SHOW), SetWindowPos, or
# BringWindowToTop on a visible window: those calls can undo a maximized or
# snapped layout, which looks like the window collapsing. It only restores a
# genuinely minimized window and then asks Windows to activate it.
param(
    [string]$Match = 'DeepSeek Harness'
)

$ErrorActionPreference = 'Stop'

$Source = @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class DshYanyFocus
{
    public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumProc callback, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    public static List<string> VisibleWindows()
    {
        var rows = new List<string>();
        EnumWindows((hWnd, lParam) =>
        {
            if (!IsWindowVisible(hWnd)) return true;
            int length = GetWindowTextLength(hWnd);
            if (length == 0) return true;
            var text = new StringBuilder(length + 1);
            GetWindowText(hWnd, text, text.Capacity);
            uint pid;
            GetWindowThreadProcessId(hWnd, out pid);
            rows.Add(hWnd.ToInt64().ToString() + "\t" + pid.ToString() + "\t" + text.ToString());
            return true;
        }, IntPtr.Zero);
        return rows;
    }
}
'@

try {
    Add-Type -TypeDefinition $Source -ErrorAction Stop
}
catch {
    Write-Output 'ADD_TYPE_FAILED'
    exit 2
}

$candidates = @()
foreach ($row in [DshYanyFocus]::VisibleWindows()) {
    $parts = $row -split "`t", 3
    if ($parts.Count -lt 3) { continue }
    $windowPid = 0
    if (-not [int]::TryParse($parts[1], [ref]$windowPid)) { continue }
    $processName = ''
    try { $processName = (Get-Process -Id $windowPid -ErrorAction Stop).ProcessName } catch { continue }
    $isApp = $processName -eq 'DeepSeek Harness'
    $isTitle = $parts[2].IndexOf($Match, [StringComparison]::OrdinalIgnoreCase) -ge 0
    if (-not ($isApp -or $isTitle)) { continue }
    $candidates += [pscustomobject]@{
        Handle = [IntPtr][long]$parts[0]
        ProcessId = $windowPid
        IsApp = $isApp
        Title = $parts[2]
    }
}

if ($candidates.Count -eq 0) {
    Write-Output 'NO_VISIBLE_WINDOW'
    exit 1
}

# Prefer the desktop application over a browser tab that merely contains the
# same title.
$target = $candidates | Where-Object { $_.IsApp } | Select-Object -First 1
if ($null -eq $target) {
    $target = $candidates | Select-Object -First 1
}

$hwnd = $target.Handle

if ([DshYanyFocus]::GetForegroundWindow() -eq $hwnd) {
    Write-Output 'ALREADY_FOREGROUND'
    exit 0
}

if ([DshYanyFocus]::IsIconic($hwnd)) {
    [void][DshYanyFocus]::ShowWindow($hwnd, 9) # SW_RESTORE
    Start-Sleep -Milliseconds 80
}

# A synthetic Alt press releases the foreground lock Windows keeps for the
# process that last received real input.
[DshYanyFocus]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)
[DshYanyFocus]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)

$foreground = [DshYanyFocus]::GetForegroundWindow()
$foregroundPid = 0
$foregroundThread = [DshYanyFocus]::GetWindowThreadProcessId($foreground, [ref]$foregroundPid)
$targetPid = 0
$targetThread = [DshYanyFocus]::GetWindowThreadProcessId($hwnd, [ref]$targetPid)

$attached = $false
if ($foregroundThread -ne 0 -and $targetThread -ne 0 -and $foregroundThread -ne $targetThread) {
    $attached = [DshYanyFocus]::AttachThreadInput($foregroundThread, $targetThread, $true)
}

try {
    [void][DshYanyFocus]::SetForegroundWindow($hwnd)
}
finally {
    if ($attached) {
        [void][DshYanyFocus]::AttachThreadInput($foregroundThread, $targetThread, $false)
    }
}

Start-Sleep -Milliseconds 150

# Undo a minimize that raced with the activation, then report the outcome.
if ([DshYanyFocus]::IsIconic($hwnd)) {
    [void][DshYanyFocus]::ShowWindow($hwnd, 9)
    Start-Sleep -Milliseconds 80
}

if ([DshYanyFocus]::GetForegroundWindow() -eq $hwnd) {
    Write-Output 'FOCUSED'
    exit 0
}

try {
    $shell = New-Object -ComObject WScript.Shell
    if ($shell.AppActivate($target.ProcessId)) {
        Write-Output 'FOCUSED_APP_ACTIVATE'
        exit 0
    }
}
catch {
    # fall through to the failure exit code
}

Write-Output 'NOT_FOCUSED'
exit 3
