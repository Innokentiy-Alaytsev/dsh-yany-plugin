# Flash the DeepSeek Harness taskbar button when a notification arrives.
#
# Uses the standard Windows FlashWindowEx API with FLASHW_TRAY | FLASHW_TIMERNOFG:
# the taskbar button flashes until the window is activated. It never changes
# focus, Z-order, size, visibility, or the foreground window.
#
# Exit codes:
#   0  flashed, or the window is already in the foreground (nothing to flash)
#   1  no visible matching window
#   2  the Win32 helper could not be compiled
#   3  a matching window exists but FlashWindowEx failed
param(
    [string]$Match = 'DeepSeek Harness'
)

$ErrorActionPreference = 'Stop'

$Source = @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class DshYanyFlash
{
    public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    public struct FLASHWINFO
    {
        public uint cbSize;
        public IntPtr hwnd;
        public uint dwFlags;
        public uint uCount;
        public uint dwTimeout;
    }

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumProc callback, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    public static extern bool FlashWindowEx(ref FLASHWINFO info);

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

    public static bool Flash(IntPtr hWnd)
    {
        var info = new FLASHWINFO();
        info.cbSize = (uint)Marshal.SizeOf(typeof(FLASHWINFO));
        info.hwnd = hWnd;
        info.dwFlags = 0x00000002 | 0x0000000C; // FLASHW_TRAY | FLASHW_TIMERNOFG
        info.uCount = 0;
        info.dwTimeout = 0;
        return FlashWindowEx(ref info);
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
foreach ($row in [DshYanyFlash]::VisibleWindows()) {
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

$target = $candidates | Where-Object { $_.IsApp } | Select-Object -First 1
if ($null -eq $target) {
    $target = $candidates | Select-Object -First 1
}

if ([DshYanyFlash]::GetForegroundWindow() -eq $target.Handle) {
    Write-Output 'ALREADY_FOREGROUND'
    exit 0
}

if ([DshYanyFlash]::Flash($target.Handle)) {
    Write-Output 'FLASHED'
    exit 0
}

Write-Output 'FLASH_FAILED'
exit 3
