import { createRoot } from 'react-dom/client';
import Flasher from './components/flasher';
import './globals.css';
import './index.css';
import ActionMenu from './components/action-menu';
import { ActionMenuProvider } from './hooks/useActionMenu';

const root = createRoot(document.getElementById('root'));
root.render(<>
   <Flasher />
   <ActionMenuProvider>
      <ActionMenu />
   </ActionMenuProvider>
</>);