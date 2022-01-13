// This just invokes the API as you would if you wanted to grab a screen shot. The equivalent using the UI would be to
// enable all windows, turn off "Fit Image Tightly", and then select all windows in the list.
CGImageRef screenShot = CGWindowListCreateImage(CGRectInfinite, kCGWindowListOptionOnScreenOnly, kCGNullWindowID, kCGWindowImageDefault);

NSBitmapImageRep *bitmapRep = [[NSBitmapImageRep alloc] initWithCGImage:screenShot];
// Create an NSImage and add the bitmap rep to it...
NSImage *image = [[NSImage alloc] init];
[image addRepresentation:bitmapRep];
[bitmapRep release];
bitmapRep = nil;

CFRelease(screenShot);
