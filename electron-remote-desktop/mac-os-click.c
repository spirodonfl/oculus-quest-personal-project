// File:
// click.m
//
// Compile with:
// gcc -o click click.m -framework ApplicationServices -framework Foundation
// gcc -o click click.c -Wall -framework ApplicationServices
// ./zig-macos-aarch64-0.9.0-dev.411+9de452f9a/zig build-exe click.m -framework ApplicationServices -framework Foundation
//
// Usage:
// ./click -x pixels -y pixels
// At the given coordinates it will click and release.
//
// From http://hints.macworld.com/article.php?story=2008051406323031
#include <ApplicationServices/ApplicationServices.h>
#include <Foundation/NSObjCRuntime.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    //NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    //NSUserDefaults *args = [NSUserDefaults standardUserDefaults];

    //int x = [args integerForKey:@"x"];
    //int y = [args integerForKey:@"y"];

    //CGPoint pt;
    //pt.x = x;
    //pt.y = y;

    int x = 0;
    int y = 0;
    x = atoi(argv[1]);
    y = atoi(argv[2]);

    CGEventRef first = CGEventCreateMouseEvent(NULL, kCGEventMouseMoved, CGPointMake(x, y), kCGMouseButtonLeft);
    CGEventPost(kCGHIDEventTap, first);
    CFRelease(first);

    CGPoint point;
    CGEventRef ourEvent = CGEventCreate(NULL);
    point = CGEventGetLocation(ourEvent);
    CFRelease(ourEvent);
    NSLog(@"Location? x= %f, y = %f", (float)point.x, (float)point.y);

    //[pool release];
    return 0;
}

