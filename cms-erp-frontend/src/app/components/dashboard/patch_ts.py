import os
import re

base_path = r"c:\Users\USUARIO\Desktop\app-mobil-cms-2025\CMS-System\src\app\components\dashboard\app-dashboards"

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".component.ts") and not file.endswith(".spec.ts"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Skip if already patched
            if 'pMod: number =' in content or 'localStorage.getItem(\'PMod\')' in content:
                continue

            # Skip if there's no class
            if 'export class ' not in content:
                continue

            # Inject pMod property
            # Find start of class
            class_match = re.search(r'export class \w+[^{]*{', content)
            if class_match:
                class_decl = class_match.group(0)
                inject_prop = class_decl + '\n  pMod: number = 4;\n'
                content = content.replace(class_decl, inject_prop)

            # Inject in ngOnInit
            init_match = re.search(r'ngOnInit\([^)]*\)\s*(:\s*void)?\s*{', content)
            if init_match:
                init_decl = init_match.group(0)
                inject_init = init_decl + '\n    let pm = localStorage.getItem(\'PMod\');\n    this.pMod = pm ? parseInt(pm) : 4;\n'
                content = content.replace(init_decl, inject_init)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("TS files successfully patched.")
