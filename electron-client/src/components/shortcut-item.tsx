import React from 'react';

interface Props {
   itemKey: string;
}

const ShortcutItem: React.FC<Props> = (props) => {
   return (
      <div className="min-w-7 min-h-7 flex justify-center items-center bg-muted rounded-md p-1">
         <span className="text-muted-foreground text-sm left-0 pb-0 w-full text-center">{props.itemKey}</span>
      </div>
   );
}


export default ShortcutItem;