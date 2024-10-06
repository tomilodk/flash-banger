import { createRoot } from 'react-dom/client';
import Flasher from './components/flasher';
import './globals.css';
import './index.css';
import ActionMenu from './components/action-menu';

const root = createRoot(document.getElementById('root'));
root.render(<>
   <Flasher />
   <ActionMenu />
</>);