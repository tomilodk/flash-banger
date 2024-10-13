import React, { useEffect, useState } from 'react';
import ShortcutItem from './shortcut-item';

const Shortcut: React.FC = () => {
   const [platform, setPlatform] = useState<Platform | null>(null);

   useEffect(() => {
      window.electronAPI.getPlatform().then(setPlatform);
   }, []);

   const items = platform === "darwin" ? ["⇧", "⌥", "."] : ["SHIFT", "ALT", "."];
   return (
      <span className="text-muted-foreground text-xs left-0 pb-0 w-full flex justify-center items-center text-center gap-1">
         {items.map((value, index) => <ShortcutItem key={index} itemKey={value} />)}
      </span>
   );
}

export default Shortcut;