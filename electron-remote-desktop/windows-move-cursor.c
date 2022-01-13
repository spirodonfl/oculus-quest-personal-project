// ./zig.exe build-exe windows-move-cursor.c -lc
// You need the -lc to include windows libaries or something
// https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput

#include<windows.h>

int main() {
    SetCursorPos(1, 1);

    OutputDebugStringW(L"Sending 'Win-D'\r\n");
    INPUT inputs[4] = {};
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_LWIN;
   
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = 0x44; // Not sure why VK_D does not work but VK_LWIN does...

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = 0x44;
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_LWIN;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        // Despite the fact this errors out because arguments should be 1 but there is two, this works
        //OutputDebugStringW(L"SendInput failed: 0x%x\n", HRESULT_FROM_WIN32(GetLastError()));
    }

    return 0;
}