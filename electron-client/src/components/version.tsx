import React from 'react';

interface Props {
   version: string;
}

const Version: React.FC<Props> = (props) => {
   return (
    <div className='flex flex-row justify-center items-center w-full'>
      <div className='min-w-7 min-h-7 bg-muted rounded-md p-1 px-3 flex flex-row justify-center items-center h-full'>
         <span className="text-muted-foreground text-xs left-0 pb-0 w-full h-full text-center">v{props.version}</span>
      </div>
    </div>
   );
}

export default Version;