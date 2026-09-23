import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import json

sys.stdout.reconfigure(encoding='utf-8')

excel_path = 'c:/Books/Neta Light/Quân bài neta light V2_1.xlsx'
output_dir = 'c:/Books/Neta Light/neta_cards'
os.makedirs(output_dir, exist_ok=True)

z = zipfile.ZipFile(excel_path)

# Map shared strings
sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sst_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
strings = []
for si in sst_tree.findall('.//s:si', ns):
    t = si.find('.//s:t', ns)
    strings.append(t.text if t is not None else '')

cells = {}
for c in sheet_tree.findall('.//s:c', ns):
    r = c.attrib['r']
    t_attr = c.attrib.get('t')
    vm = c.attrib.get('vm')
    v_elem = c.find('s:v', ns)
    val = v_elem.text if v_elem is not None else None
    if t_attr == 's' and val is not None:
        val = strings[int(val)]
    cells[r] = {'val': val, 'vm': vm}

# Relationships to media
rels_tree = ET.fromstring(z.read('xl/richData/_rels/richValueRel.xml.rels'))
rvr_tree = ET.fromstring(z.read('xl/richData/richValueRel.xml'))
rel_id_to_target = {}
for rel in rels_tree:
    rel_id_to_target[rel.attrib['Id']] = rel.attrib['Target']

vm_to_image_path = {}
for i, rel in enumerate(rvr_tree):
    r_id = rel.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
    target = rel_id_to_target[r_id].replace('../media/', 'xl/media/')
    vm_to_image_path[i + 1] = target

cols_img = ['B', 'D', 'F', 'H', 'J', 'L', 'N', 'P']
cols_name = ['C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q']
rows = [2, 4, 6, 8, 10, 12]

cards_database = []

for row_idx, r in enumerate(rows):
    for col_idx, (c_img, c_name) in enumerate(zip(cols_img, cols_name)):
        card_id = row_idx * 8 + col_idx + 1
        img_cell = f'{c_img}{r}'
        name_cell = f'{c_name}{r}'
        card_name = cells.get(name_cell, {}).get('val')
        card_vm = cells.get(img_cell, {}).get('vm')
        
        vm_int = int(card_vm) if card_vm else None
        image_zip_path = vm_to_image_path.get(vm_int)
        
        # Save individual card image
        filename = f'card_{card_id:02d}.png'
        file_path = os.path.join(output_dir, filename)
        if image_zip_path:
            with open(file_path, 'wb') as f_out:
                f_out.write(z.read(image_zip_path))
        
        card_entry = {
            'id': card_id,
            'name': card_name,
            'image': filename,
            'row': row_idx + 1,
            'col': col_idx + 1,
            'cell_image': img_cell,
            'cell_name': name_cell,
            'source_image': image_zip_path
        }
        cards_database.append(card_entry)

# Write JSON database
json_path = 'c:/Books/Neta Light/cards_database.json'
with open(json_path, 'w', encoding='utf-8') as f_json:
    json.dump(cards_database, f_json, ensure_ascii=False, indent=2)

print(f'Successfully exported {len(cards_database)} cards to {output_dir} and {json_path}')
