const fs = require('fs');
const path = require('path');
function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const updated = content
        .replace(/import \{ cn \} from 'cn'/g, "import { cn } from '@/lib/utils'")
        .replace(/import \{ cn \} from "cn"/g, 'import { cn } from "@/lib/utils"');
      if (content !== updated) fs.writeFileSync(full, updated);
    }
  });
}
walk('client/src/components');
console.log('Done');
