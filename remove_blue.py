from PIL import Image
import sys

def remove_blue_chroma(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # Blue color range logic
    # We want to remove "Blue". 
    # Logic: Blue component is significantly higher than Red and Green.
    # Adjust threshold as needed. 
    
    for item in datas:
        r, g, b, a = item
        # Simple blue detection: B > R+10 and B > G+10 to capture variations of blue
        # Or checking specific blue range. 
        # User said "BAGIAN WARNA BIRU" (Blue color part). It's likely a solid placeholder.
        # Let's try a standard blue chroma key approach.
        
        # Heuristic: if Blue is the dominant color and is bright enough.
        if b > 100 and b > r + 40 and b > g + 40:
             newData.append((0, 0, 0, 0)) # Transparent
        else:
             newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Processed {input_path} to {output_path}")

try:
    remove_blue_chroma('assets/Siap Sukseskan.png', 'assets/frame.png')
except Exception as e:
    print(e)
