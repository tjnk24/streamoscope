import sys

from PIL import Image, ImageChops

preview_path, old_narrow_path, new_narrow_path, output_path = sys.argv[1:5]

preview = Image.open(preview_path).convert('RGB')
old_narrow = Image.open(old_narrow_path).convert('RGB')
new_narrow = Image.open(new_narrow_path).convert('RGB')

box = (860, 29, 1214, 611)
size = (box[2] - box[0], box[3] - box[1])
region = preview.crop(box)
old_scaled = old_narrow.resize(size, Image.LANCZOS)
new_scaled = new_narrow.resize(size, Image.LANCZOS)

difference = ImageChops.difference(region, old_scaled).convert('L')
mask = difference.point(lambda value: 255 if value <= 8 else 0)

composed_region = Image.composite(new_scaled, region, mask)
result = preview.copy()
result.paste(composed_region, box[:2])
result.save(output_path, optimize=True)

outside = ImageChops.difference(preview, result)
outside.paste((0, 0, 0), box)
print('changed pixels outside the dock box:', outside.convert('L').getbbox())
print('saved', output_path, result.size)
