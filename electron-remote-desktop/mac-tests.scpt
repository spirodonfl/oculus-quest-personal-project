# Example: osascript script.scpt 20 200 "What???"
on run argv
    set X to item 1 of argv
    set Y to item 2 of argv
    set S to quoted form of (item 3 of argv)

    log S

    tell application "System Events"
      tell process "Google Chrome"
        set frontmost to true
        click (first menu item whose name contains "mail") of menu "Window" of menu bar 1
      end tell
    end tell
    #tell application "System Events" to tell process "Terminal"
    #    set frontmost to true
    #    windows where title contains "bash"
    #    if result is not {} then perform action "AXRaise" of item 1 of result
    #end tell
    # tell application "NameOfTheApplicationHere" to activate

    tell application "System Events" to tell application process "Google Chrome"
      get size of window 1
    end tell

    tell application "System Events"
      click at {X, Y}
    end tell

# spacebar
# https://eastmanreference.com/complete-list-of-applescript-key-codes
    tell application "System Events"
      key code 49
    end tell

    tell application "System Events"
      set the clipboard to S
    end tell

    tell application "System Events"
      log the clipboard
    end tell
end run
