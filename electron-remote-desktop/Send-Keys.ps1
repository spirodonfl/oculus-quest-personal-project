<#
Key	Code
BACKSPACE	{BACKSPACE}, {BS}, or {BKSP}
BREAK	{BREAK}
CAPS LOCK	{CAPSLOCK}
DEL or DELETE	{DELETE} or {DEL}
DOWN ARROW	{DOWN}
END	{END}
ENTER	{ENTER} or ~
ESC	{ESC}
HELP	{HELP}
HOME	{HOME}
INS or INSERT	{INSERT} or {INS}
LEFT ARROW	{LEFT}
NUM LOCK	{NUMLOCK}
PAGE DOWN	{PGDN}
PAGE UP	{PGUP}
PRINT SCREEN	{PRTSC} (reserved for future use)
RIGHT ARROW	{RIGHT}
SCROLL LOCK	{SCROLLLOCK}
TAB	{TAB}
UP ARROW	{UP}
F1	{F1}
F2	{F2}
F3	{F3}
F4	{F4}
F5	{F5}
F6	{F6}
F7	{F7}
F8	{F8}
F9	{F9}
F10	{F10}
F11	{F11}
F12	{F12}
F13	{F13}
F14	{F14}
F15	{F15}
F16	{F16}
Keypad add	{ADD}
Keypad subtract	{SUBTRACT}
Multiply keypad	{MULTIPLY}
Keypad divide	{DIVIDE}
To specify keys combined with any combination of the SHIFT, CTRL, and ALT keys, precede the key code with one or more of the following codes.

Key	Code
SHIFT	+
CTRL	^
ALT	%

Example: Send-Keys "Untitled - Notepad" "ABC"
Example: Send-Keys "Untitled - Notepad" "+{LEFT}"
Above example does a SHIFT + LEFT ARROW together (not apart)
#>

function Send-Keys {
    param(
        [String]$AppActivate,
        [String]$Keys
    )

    [void] [System.Reflection.Assembly]::LoadWithPartialName("'Microsoft.VisualBasic")
    [Microsoft.VisualBasic.Interaction]::AppActivate($AppActivate)
    [void] [System.Reflection.Assembly]::LoadWithPartialName("'System.Windows.Forms")
    [System.Windows.Forms.SendKeys]::SendWait($Keys)
}
