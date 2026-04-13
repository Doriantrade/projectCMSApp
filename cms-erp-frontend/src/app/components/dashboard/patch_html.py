import os
import re

base_path = r"c:\Users\USUARIO\Desktop\app-mobil-cms-2025\CMS-System\src\app\components\dashboard\app-dashboards"

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".component.html"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # Protect Submit (Guardar/Modificar) form buttons for pMod 3
            # We look for <button ... type="submit" ...> and inject *ngIf="pMod <= 3" if not present
            submit_matches = re.finditer(r'<button([^>]*type="submit"[^>]*)>', content)
            for m in submit_matches:
                tag = m.group(0)
                if '*ngIf' not in tag and 'pMod' not in tag:
                    new_tag = tag.replace('<button', '<button *ngIf="pMod <= 3"')
                    content = content.replace(tag, new_tag)

            # Protect floating Add buttons for pMod 2
            # Typical float add: <button class="btn btn-warning rounded-circle
            add_matches = re.finditer(r'<button([^>]*rounded-circle[^>]*mat-icon[^>]*\+?[^>]*)>', content)
            for m in add_matches:
                tag = m.group(0)
                if '*ngIf' not in tag and 'pMod' not in tag:
                    new_tag = tag.replace('<button', '<button *ngIf="pMod <= 2"')
                    content = content.replace(tag, new_tag)
                    
            # Fallback for Add buttons by checking inner mat-icon add (via heuristic multiline)
            # Find <button ...> \n <mat-icon>add</mat-icon>
            # Actually just look for buttons invoking _show_form or create/add
            add_btn_matches = re.finditer(r'<button([^>]*_show_form\s*=\s*!_show_form[^>]*)>', content)
            for m in add_btn_matches:
                tag = m.group(0)
                if '*ngIf' not in tag and 'pMod' not in tag:
                    new_tag = tag.replace('<button', '<button *ngIf="pMod <= 2"')
                    content = content.replace(tag, new_tag)

            # Protect Edit icons (pMod 3)
            # <span class="edit"
            edit_matches = re.finditer(r'<span([^>]*class="edit"[^>]*)>', content)
            for m in edit_matches:
                tag = m.group(0)
                if '*ngIf' not in tag and 'pMod' not in tag:
                    new_tag = tag.replace('<span', '<span *ngIf="pMod <= 3"')
                    content = content.replace(tag, new_tag)

            # Protect Delete icons (pMod 1)
            # <span class="delete"
            del_matches = re.finditer(r'<span([^>]*class="delete"[^>]*)>', content)
            for m in del_matches:
                tag = m.group(0)
                # Ensure we handle existing ngIf e.g. *ngIf="_delete_show" -> *ngIf="_delete_show && pMod === 1"
                if '*ngIf' in tag and 'pMod' not in tag:
                    # extract the ngIf
                    ngif_match = re.search(r'\*ngIf="([^"]+)"', tag)
                    if ngif_match:
                        old_cond = ngif_match.group(1)
                        new_cond = f"{old_cond} && pMod === 1"
                        new_tag = tag.replace(f'*ngIf="{old_cond}"', f'*ngIf="{new_cond}"')
                        content = content.replace(tag, new_tag)
                elif 'pMod' not in tag:
                    new_tag = tag.replace('<span', '<span *ngIf="pMod === 1"')
                    content = content.replace(tag, new_tag)

            if original_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

print("HTML files successfully patched.")
