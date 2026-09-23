import zipfile
import xml.etree.ElementTree as ET
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

z = zipfile.ZipFile('c:/Books/Neta Light/Quân bài neta light V2_1.xlsx')

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

cols_img = ['B', 'D', 'F', 'H', 'J', 'L', 'N', 'P']
cols_name = ['C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q']
rows = [2, 4, 6, 8, 10, 12]

all_cards = []
for row_idx, r in enumerate(rows):
    for col_idx, (c_img, c_name) in enumerate(zip(cols_img, cols_name)):
        card_num = row_idx * 8 + col_idx + 1
        img_cell = f'{c_img}{r}'
        name_cell = f'{c_name}{r}'
        card_name = cells.get(name_cell, {}).get('val')
        card_vm = cells.get(img_cell, {}).get('vm')
        all_cards.append({
            'index': card_num,
            'row': r,
            'col_header': col_idx + 1,
            'img_cell': img_cell,
            'name_cell': name_cell,
            'name': card_name,
            'vm': card_vm
        })

print(f'Total cards scanned: {len(all_cards)}')
for card in all_cards:
    print(f"#{card['index']:02d} | Cell {card['img_cell']}-{card['name_cell']} | vm={card['vm']} | Name: {card['name']}")
