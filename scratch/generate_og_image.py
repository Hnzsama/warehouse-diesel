import os
from PIL import Image, ImageDraw, ImageFont

# Create a 1200x630 Open Graph Image
width, height = 1200, 630
image = Image.new('RGB', (width, height), color='#0f172a')
draw = ImageDraw.Draw(image)

# Draw subtle background glow / gradient accent cards
draw.rounded_rectangle([40, 40, width - 40, height - 40], radius=24, outline='#1e293b', width=3, fill='#1e293b')
draw.rounded_rectangle([60, 60, width - 60, height - 60], radius=18, fill='#0f172a')

# Top Badge Pill
draw.rounded_rectangle([100, 110, 360, 155], radius=20, fill='#2563eb')

# Load fonts
try:
    font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58)
    font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
except Exception:
    font_badge = font_title = font_subtitle = font_footer = ImageFont.load_default()

# Badge text
draw.text((120, 122), "PERSADIAAN GUDANG", fill='#ffffff', font=font_badge)

# Title
draw.text((100, 190), "Gudang Diesel Truk", fill='#ffffff', font=font_title)

# Subtitle
draw.text((100, 275), "Sistem Informasi Manajemen Persediaan Suku Cadang Diesel", fill='#94a3b8', font=font_subtitle)
draw.text((100, 315), "Monitoring Stok Real-time & Laporan Persediaan Resmi", fill='#64748b', font=font_subtitle)

# Feature Badges at Bottom
draw.rounded_rectangle([100, 420, 360, 480], radius=12, fill='#064e3b', outline='#10b981', width=2)
draw.text((125, 440), "+ Barang Masuk", fill='#34d399', font=font_footer)

draw.rounded_rectangle([390, 420, 650, 480], radius=12, fill='#78350f', outline='#f59e0b', width=2)
draw.text((415, 440), "- Barang Keluar", fill='#fbbf24', font=font_footer)

draw.rounded_rectangle([680, 420, 960, 480], radius=12, fill='#1e1b4b', outline='#6366f1', width=2)
draw.text((705, 440), "⚡ Alert Stok Kritis", fill='#818cf8', font=font_footer)

# Right Side Decorative Icon / Box Grid
draw.rounded_rectangle([1000, 180, 1100, 280], radius=16, fill='#2563eb')
draw.text((1032, 210), "🚚", font=font_title)

# Save Open Graph Image
og_path = "/home/akuma/projects/warehouse_diesel/public/og-image.png"
image.save(og_path, format="PNG")
print("Saved OG image to:", og_path)

# Also save a 300x300 favicon PNG for WhatsApp square preview
square = Image.new('RGB', (400, 400), color='#0f172a')
sq_draw = ImageDraw.Draw(square)
sq_draw.rounded_rectangle([20, 20, 380, 380], radius=32, fill='#1e293b', outline='#2563eb', width=4)
sq_draw.text((80, 120), "GUDANG", fill='#ffffff', font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 46))
sq_draw.text((95, 190), "DIESEL", fill='#38bdf8', font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 46))
sq_draw.rounded_rectangle([80, 270, 320, 310], radius=12, fill='#2563eb')
sq_draw.text((105, 280), "TRUK MEDAN", fill='#ffffff', font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18))

icon_path = "/home/akuma/projects/warehouse_diesel/public/favicon.png"
square.save(icon_path, format="PNG")
print("Saved favicon PNG to:", icon_path)
