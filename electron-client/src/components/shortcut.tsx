import React from 'react';
import ShortcutItem from './shortcut-item';

interface Props {
   platform: Platform
}

const Shortcut: React.FC<Props> = (props) => {

   const items = props.platform === "darwin" ? ["⇧", "⌥", "."] : ["SHIFT", "ALT", "."];
   return (
      <span className="text-muted-foreground text-xs left-0 pb-0 w-full flex justify-center items-center text-center gap-1">
         {items.map((value, index) => <ShortcutItem key={index} itemKey={value} />)}
      </span>
   );
}

export default Shortcut;