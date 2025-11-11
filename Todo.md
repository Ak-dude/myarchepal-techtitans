## Todo

Font Color Suggestions
The main goal is to increase the contrast. A good strategy is to use a "type scale" with different shades for different purposes.

For Headings (like "Town Creek Indian Mound"):

Color: A very dark gray or near-black. This provides strong visual hierarchy.

Examples:

#111827 (A modern, very dark blue-gray)

#212529 (A standard "off-black")

For Body Text (like the description):

Color: A solid dark gray. This is easier on the eyes for long reading than pure black (#000000) but still provides excellent contrast.

Examples:

#333333 (A web-standard dark gray)

#4B5563 (A slightly softer dark gray)

For Secondary Text (like "Address:", "Region:", "Site ID:"):

Color: This is where the current page is lightest. This text should be darker than it is now but lighter than the body text to show it's secondary information.

Examples:

#6B7280 (A clear, accessible medium-dark gray)

#555555 (A solid medium gray)

📄 Font Face (Font Family) Suggestions
The current sans-serif font is a good choice for a UI like this. If you want to specify a high-quality, modern font, here are some excellent options known for their clarity on screens.

Inter: A fantastic font designed specifically for user interfaces. It's very clean and readable at all sizes.

CSS: font-family: 'Inter', sans-serif;

Roboto: A Google standard. It's clean, versatile, and familiar to many users.

CSS: font-family: 'Roboto', sans-serif;

System Fonts: This is a "best-practice" stack that uses the user's native system font (like San Francisco on a Mac, Segoe UI on Windows). It's fast-loading and feels native to the user's device.

CSS: font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;