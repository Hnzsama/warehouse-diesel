import os
from PIL import Image, ImageDraw, ImageFont

# 1. Create public/favicon.svg with the Red Hexagon Logo Icon
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <rect width="100" height="100" rx="28" fill="#18181b"/>
    <g transform="translate(15, 15) scale(1.75)">
        <!-- Outer Geometric Hexagonal Badge -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2ZM20 6.5359L8.91154 12.9378V25.7382L20 32.1401L31.0885 25.7382V12.9378L20 6.5359Z" fill="#F43F5E"/>
        <!-- Inner Engine Piston & Truck Emblem -->
        <path d="M20 10L28 14.6188V23.8564L20 28.4752L12 23.8564V14.6188L20 10ZM20 13.8476L15.2 16.6188V21.8564L20 24.6276L24.8 21.8564V16.6188L20 13.8476Z" fill="#F43F5E" opacity="0.85"/>
        <!-- Center Core -->
        <path d="M20 17.5L22.5 18.9434V21.8301L20 23.2735L17.5 21.8301V18.9434L20 17.5Z" fill="#F43F5E"/>
    </g>
</svg>"""

with open("/home/akuma/projects/warehouse_diesel/public/favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

print("Saved public/favicon.svg successfully!")

# 2. Render high resolution PNG favicons (512x512) for browser tab icon and WhatsApp link indexer
size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Dark rounded background card
draw.rounded_rectangle([0, 0, size, size], radius=140, fill="#18181b")

# Scale factor for 40x40 SVG paths to fit nicely inside 512x512 (scaled ~9x, offset 76px)
scale = 9.0
ox, oy = 76, 76

# Helper function to convert 40x40 coords to 512x512 coords
def transform_pts(pts):
    return [(ox + x * scale, oy + y * scale) for x, y in pts]

# Outer Hexagon (outer path & inner cutout)
outer_hex_outer = [(20, 2), (35.5885, 11), (35.5885, 29), (20, 38), (4.41154, 29), (4.41154, 11)]
outer_hex_inner = [(20, 6.5359), (31.0885, 12.9378), (31.0885, 25.7382), (20, 32.1401), (8.91154, 25.7382), (8.91154, 12.9378)]

draw.polygon(transform_pts(outer_hex_outer), fill="#f43f5e")
draw.polygon(transform_pts(outer_hex_inner), fill="#18181b")

# Inner Engine Piston & Truck Emblem
piston_outer = [(20, 10), (28, 14.6188), (28, 23.8564), (20, 28.4752), (12, 23.8564), (12, 14.6188)]
piston_inner = [(20, 13.8476), (24.8, 16.6188), (24.8, 21.8564), (20, 24.6276), (15.2, 21.8564), (15.2, 16.6188)]

draw.polygon(transform_pts(piston_outer), fill="#f43f5e")
draw.polygon(transform_pts(piston_inner), fill="#18181b")

# Center Core
center_core = [(20, 17.5), (22.5, 18.9434), (22.5, 21.8301), (20, 23.2735), (17.5, 21.8301), (17.5, 18.9434)]
draw.polygon(transform_pts(center_core), fill="#f43f5e")

# Save PNGs
favicon_png = "/home/akuma/projects/warehouse_diesel/public/favicon.png"
apple_touch_png = "/home/akuma/projects/warehouse_diesel/public/apple-touch-icon.png"

img.save(favicon_png, format="PNG")
img.save(apple_touch_png, format="PNG")
print("Saved public/favicon.png & apple-touch-icon.png successfully!")

# 3. Create Open Graph banner (1200x630) featuring the RED HEXAGON app logo prominently
og_w, og_h = 1200, 630
og_img = Image.new("RGB", (og_w, og_h), color="#0f172a")
og_draw = ImageDraw.Draw(og_img)

# Outer card border
og_draw.rounded_rectangle([40, 40, og_w - 40, og_h - 40], radius=24, outline="#1e293b", width=3, fill="#18181b")

# Paste scaled app logo icon on the left (220x220)
logo_resized = img.resize((220, 220), Image.Resampling.LANCZOS)
og_img.paste(logo_resized, (100, 205), mask=logo_resized)

# Load fonts
try:
    font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
    font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
except Exception:
    font_badge = font_title = font_subtitle = font_footer = ImageFont.load_default()

# Right Side Info
og_draw.rounded_rectangle([360, 150, 640, 192], radius=16, fill="#e11d48")
og_draw.text((380, 161), "SISTEM GUDANG DIESEL", fill="#ffffff", font=font_badge)

og_draw.text((360, 215), "Gudang Diesel Truk", fill="#ffffff", font=font_title)
og_draw.text((360, 290), "Sistem Informasi Manajemen Persediaan Suku Cadang", fill="#94a3b8", font=font_subtitle)
og_draw.text((360, 325), "Monitoring Stok Real-time, Barang Masuk/Keluar & Laporan", fill="#64748b", font=font_subtitle)

# Bottom Feature Pills
og_draw.rounded_rectangle([360, 410, 580, 465], radius=12, fill="#064e3b", outline="#10b981", width=2)
og_draw.text((385, 428), "+ Barang Masuk", fill="#34d399", font=font_footer)

og_draw.rounded_rectangle([600, 410, 820, 465], radius=12, fill="#78350f", outline="#f59e0b", width=2)
og_draw.text((625, 428), "- Barang Keluar", fill="#fbbf24", font=font_footer)

og_draw.rounded_rectangle([840, 410, 1080, 465], radius=12, fill="#881337", outline="#f43f5e", width=2)
og_draw.text((865, 428), "⚡ Alert Stok Kritis", fill="#fda4af", font=font_footer)

og_path = "/home/akuma/projects/warehouse_diesel/public/og-image.png"
og_img.save(og_path, format="PNG")
print("Saved public/og-image.png with App Logo Icon successfully!")
