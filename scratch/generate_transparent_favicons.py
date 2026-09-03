import os
from PIL import Image, ImageDraw, ImageFont

# 1. Create public/favicon.svg with 100% TRANSPARENT background
svg_transparent = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
    <!-- Outer Geometric Hexagonal Badge -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2ZM20 6.5359L8.91154 12.9378V25.7382L20 32.1401L31.0885 25.7382V12.9378L20 6.5359Z" fill="#F43F5E"/>
    <!-- Inner Engine Piston & Truck Emblem -->
    <path d="M20 10L28 14.6188V23.8564L20 28.4752L12 23.8564V14.6188L20 10ZM20 13.8476L15.2 16.6188V21.8564L20 24.6276L24.8 21.8564V16.6188L20 13.8476Z" fill="#F43F5E" opacity="0.85"/>
    <!-- Center Core -->
    <path d="M20 17.5L22.5 18.9434V21.8301L20 23.2735L17.5 21.8301V18.9434L20 17.5Z" fill="#F43F5E"/>
</svg>"""

with open("/home/akuma/projects/warehouse_diesel/public/favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_transparent)

print("Saved transparent public/favicon.svg successfully!")

# 2. Render 512x512 PNG with 100% TRANSPARENT background
size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0)) # Fully transparent canvas
draw = ImageDraw.Draw(img)

# Scale factor for 40x40 SVG paths to fit nicely inside 512x512 (scaled 11.5x, offset 26px)
scale = 11.5
ox, oy = 26, 26

def transform_pts(pts):
    return [(ox + x * scale, oy + y * scale) for x, y in pts]

# Outer Hexagon (outer polygon & inner cutout)
outer_hex_outer = [(20, 2), (35.5885, 11), (35.5885, 29), (20, 38), (4.41154, 29), (4.41154, 11)]
outer_hex_inner = [(20, 6.5359), (31.0885, 12.9378), (31.0885, 25.7382), (20, 32.1401), (8.91154, 25.7382), (8.91154, 12.9378)]

draw.polygon(transform_pts(outer_hex_outer), fill="#f43f5e")
draw.polygon(transform_pts(outer_hex_inner), fill=(0, 0, 0, 0)) # transparent cutout

# Inner Engine Piston & Truck Emblem
piston_outer = [(20, 10), (28, 14.6188), (28, 23.8564), (20, 28.4752), (12, 23.8564), (12, 14.6188)]
piston_inner = [(20, 13.8476), (24.8, 16.6188), (24.8, 21.8564), (20, 24.6276), (15.2, 21.8564), (15.2, 16.6188)]

draw.polygon(transform_pts(piston_outer), fill=(244, 63, 94, 216)) # 85% opacity red
draw.polygon(transform_pts(piston_inner), fill=(0, 0, 0, 0)) # transparent cutout

# Center Core
center_core = [(20, 17.5), (22.5, 18.9434), (22.5, 21.8301), (20, 23.2735), (17.5, 21.8301), (17.5, 18.9434)]
draw.polygon(transform_pts(center_core), fill="#f43f5e")

# Save PNGs
favicon_png = "/home/akuma/projects/warehouse_diesel/public/favicon.png"
apple_touch_png = "/home/akuma/projects/warehouse_diesel/public/apple-touch-icon.png"

img.save(favicon_png, format="PNG")
img.save(apple_touch_png, format="PNG")
print("Saved 100% transparent public/favicon.png & apple-touch-icon.png successfully!")
